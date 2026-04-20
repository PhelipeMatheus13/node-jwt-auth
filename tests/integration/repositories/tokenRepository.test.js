const { setupTestDatabase } = require("../../helpers/testDatabase");
// Ensure the test database is set up before importing the repository
const { setKnexInstance } = require("../../../config/database"); 
const tokenRepository = require("../../../repositories/tokenRepository");

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
    
    describe("existsByToken", () => {
        it("should return true if a user with the given email exists", async () => {
            const tokenData = {
                token: "test-token-123",
                userId: userId,
                expiresAt: new Date(Date.now() + 86400000) 
            }

            await knex("refresh_tokens")
                .insert({
                    token: tokenData.token,
                    user_id: tokenData.userId,
                    expires_at: tokenData.expiresAt
                });

            const exists = await tokenRepository.existsByToken(tokenData.token);

            expect(exists).toBe(true);
        });

        it("should return false if a user with the given email does not exist", async () => {
            const exists = await tokenRepository.existsByToken("nonExistent");
            expect(exists).toBe(false);
        });
    });
});