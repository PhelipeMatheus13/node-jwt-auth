const { setupTestDatabase } = require("../../../helpers/testDatabase");
// Ensure the test database is set up before importing the repository
const { setKnexInstance } = require("../../../../src/shared/config/database"); 
const tokenRepository = require("../../../../src/modules/token/token.repository");
const { randomUUID } = require("crypto");  

describe("Token Repository (Integration)", () => {
    let db, knex, userId;

    beforeAll(async () => {
        db = await setupTestDatabase({ migrationDirectory: "./database/migrations" });
        knex = db.knex;
        setKnexInstance(knex);
    });

    afterAll(async () => {
        await db.stop();
    });

    beforeEach(async () => {
        await knex("refresh_tokens").del();
        await knex("users").del();

        const result = await knex("users")
            .insert({
                name: "token user",
                email: "token@example.com",
                password: "hashedpassword"
            })
            .returning("id")

        userId = result[0].id;
    });

    describe("Writer repository", () => {
        describe("create", () => {
            it("should insert a new token into the database", async () => {
                const tokenData = {
                    tokenHash: "token-hash-123",
                    userId: userId,
                    jti: randomUUID(),
                    expiresAt: new Date(Date.now() + 86400000) 
                }

                const tokenId = await tokenRepository.create(tokenData);

                expect(tokenId).toBeDefined();
                expect(typeof tokenId).toBe("string");

                const token = await knex("refresh_tokens").where({ id: tokenId }).first();

                expect(token).toMatchObject({
                    token_hash: tokenData.tokenHash,
                    user_id: tokenData.userId,
                    expires_at: tokenData.expiresAt
                });
            });
        });

        describe("revokeById", () => {
            it("should update the revoked_at field for a token", async () => {
                const tokenData = {
                    token_hash: "test-token-123",
                    user_id: userId,
                    jti: randomUUID(),
                    expires_at: new Date(Date.now() + 86400000)
                };

                const [{ id: tokenId }] = await knex("refresh_tokens").insert(tokenData).returning("id");

                await tokenRepository.revokeById(tokenId);

                const token = await knex("refresh_tokens").select("revoked_at").where({ id: tokenId }).first();
                expect(token.revoked_at).toBeDefined();
            });
        });

        describe("revokeAllByUserId", () => {
            it("should update the revoked_at field for all tokens of a user", async () => {
                const now = Date.now();
                const tokensData = [
                    {
                        token_hash: "token-hash-123",
                        user_id: userId,
                        jti: randomUUID(),
                        expires_at: new Date(now + 86400000),
                        created_at: new Date(now - 10000) 
                    },
                    {
                        token_hash: "token-hash-456",
                        user_id: userId,
                        jti: randomUUID(),
                        expires_at: new Date(now + 86400000),
                        created_at: new Date(now) 
                    }
                ];

                await knex("refresh_tokens").insert(tokensData);
                await tokenRepository.revokeAllByUserId(userId);

                const tokens = await knex("refresh_tokens").select("revoked_at").where({ user_id: userId });
                tokens.forEach(token => {
                    expect(token.revoked_at).toBeDefined();
                });
            });
        });
    });

    describe("findByJti", () => {
        it("should return tokens ordered by created_at desc", async () => {
            const now = Date.now();
            const tokenData = {
                token_hash: "token-hash-123",
                user_id: userId,
                jti: randomUUID(),
                expires_at: new Date(now + 86400000),
                created_at: new Date(now - 10000) 
            };

            await knex("refresh_tokens").insert(tokenData);

            const token = await tokenRepository.findByJti(tokenData.jti);

            expect(token).toBeDefined();
            expect(token).toMatchObject({
                token_hash: tokenData.token_hash,
                user_id: userId,
                jti: tokenData.jti
            });
        });
    });
});