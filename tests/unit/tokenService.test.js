const tokenService = require("../../services/tokenService");
const { setupTestDatabase } = require("../helpers/testDatabase");
const { setKnexInstance } = require("../../config/database");

describe("Token Service", () => {
    let db;
    let knex;
    let userId;

    beforeAll(async () => {
        db = await setupTestDatabase({
        migrationDirectory: "./database/migrations",
        });
        knex = db.knex;
        setKnexInstance(knex);
    });

    afterAll(async () => {
        await db.stop();
    });

    beforeEach(async () => {
        // Cria um usuário real para ter um ID válido
        const [user] = await knex("users")
        .insert({
            name: "Token Test User",
            email: `token_${Date.now()}@example.com`,
            password: "hashedpass",
        })
        .returning("id");
        userId = user.id;

        // Limpa tokens existentes
        await knex("refresh_tokens").del();
    });

    describe("generateAccessToken", () => {
        it("should generate a valid JWT access token", () => {
            const token = tokenService.generateAccessToken(userId);
            expect(token).toBeDefined();
            expect(typeof token).toBe("string");
            // Decode to view payload
            const decoded = require("jsonwebtoken").decode(token);
            expect(decoded.id).toBe(userId);
        });
    });

    describe("generateRefreshToken", () => {
        it("should generate and store a refresh token", async () => {
            const token = await tokenService.generateRefreshToken(userId);
            expect(token).toBeDefined();

            const stored = await knex("refresh_tokens").where({ token }).first();
            expect(stored).toBeTruthy();
            expect(stored.user_id).toBe(userId);
        });
    });

    describe("verifyRefreshToken", () => {
        it("should verify a valid refresh token", async () => {
            const token = await tokenService.generateRefreshToken(userId);
            const decoded = await tokenService.verifyRefreshToken(token);
            expect(decoded.id).toBe(userId);
        });

        it("should throw error for invalid token", async () => {
            await expect(tokenService.verifyRefreshToken("invalid.token.here"))
                .rejects.toThrow("Invalid or expired refresh token");
        });

        it("should throw error if token not in database", async () => {
            const jwt = require("jsonwebtoken");
            const secret = process.env.REFRESH_SECRET || process.env.SECRET;
            const token = jwt.sign({ id: userId }, secret, { expiresIn: "1h" });
            // don't save in the bank
            await expect(tokenService.verifyRefreshToken(token))
                .rejects.toThrow("Invalid or expired refresh token");
        });
    });

    describe("revokeRefreshToken", () => {
        it("should remove token from database", async () => {
            const token = await tokenService.generateRefreshToken(userId);
            await tokenService.revokeRefreshToken(token);
             const stored = await knex("refresh_tokens").where({ token }).first();
            expect(stored).toBeUndefined();
        });
    });
});