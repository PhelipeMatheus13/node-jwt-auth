const { setupTestDatabase } = require("../../../helpers/testDatabase");
// Ensure the test database is set up before importing the repository
const { setKnexInstance } = require("../../../../src/shared/config/database"); 
const tokenRepository = require("../../../../src/modules/token/token.repository");

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

    describe("create", () => {
        it("should insert a new token into the database", async () => {
            const tokenData = {
                token: "test-token-123",
                userId: userId,
                expiresAt: new Date(Date.now() + 86400000) 
            }

            const tokenId = await tokenRepository.create(tokenData);

            expect(tokenId).toBeDefined();
            expect(typeof tokenId).toBe("string");

            const token = await knex("refresh_tokens").where({ id: tokenId }).first();

            expect(token).toMatchObject({
                token: tokenData.token,
                user_id: tokenData.userId,
                expires_at: tokenData.expiresAt
            });
        });
    });

    describe("deleteByToken", () => {
        it("should remove the token", async () => {
            await knex("refresh_tokens").insert({
                token: "test-token-123",
                user_id: userId,
                expires_at: new Date(Date.now() + 86400000) 
            });

            await tokenRepository.deleteByToken("test-token-123");

            const response = await knex("refresh_tokens").where({ token: "test-token-123" }).first();
            expect(response).toBeUndefined();
        });
    });
    
    describe("deleteAllByUserId", () => {
        it("should remove all tokens", async () => {
            const now = Date.now();
            const tokensData = [
                {
                    token: "test-token-123",
                    user_id: userId,
                    expires_at: new Date(now + 86400000),
                    created_at: new Date(now - 10000) 
                },
                {
                    token: "test-token-456",
                    user_id: userId,
                    expires_at: new Date(now + 86400000),
                    created_at: new Date(now) 
                }
            ];

            await knex("refresh_tokens").insert(tokensData);

            await tokenRepository.deleteAllByUserId(userId);

            const response = await knex("refresh_tokens").where({ user_id: userId }).first();
            expect(response).toBeUndefined();
        });
    }); 

    describe("listByUserId", () => {
        it("should return tokens ordered by created_at desc", async () => {
            const now = Date.now();
            const tokensData = [
                {
                    token: "test-token-123",
                    user_id: userId,
                    expires_at: new Date(now + 86400000),
                    created_at: new Date(now - 10000) 
                },
                {
                    token: "test-token-456",
                    user_id: userId,
                    expires_at: new Date(now + 86400000),
                    created_at: new Date(now) 
                }
            ];

            await knex("refresh_tokens").insert(tokensData);

            const responseList = await tokenRepository.listByUserId(userId);

            expect(responseList).toHaveLength(2);
            expect(responseList[0]).toEqual({token: "test-token-456"});
            expect(responseList[1]).toEqual({token: "test-token-123"});
        });
    });
});