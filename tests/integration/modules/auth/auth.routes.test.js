const request = require("supertest");
const app = require("../../../../src/app");
const { setupTestDatabase } = require("../../../helpers/testDatabase");
const { setKnexInstance } = require("../../../../src/shared/config/database");
const hashService = require("../../../../src/shared/services/hash.service");

describe("Auth Routes (Integration)", () => {
    let db, knex;

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
    });

    describe("POST /auth/login", () => {
        beforeEach(async () => {
            const password = "Pass@123";
            const passwordHashed = await hashService.hash(password);

            await knex("users").insert({
                name: "teste login",
                email: "login@example.com",
                password: passwordHashed
            });
        });

        it("should login successfully and return tokens", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({ email: "login@example.com", password: "Pass@123" });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("accessToken");
            expect(res.body.data).toHaveProperty("refreshToken");
        });

        it("should return 422 if validation fails (e.g., missing email)", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({ password: "Pass@123" });

            expect(res.statusCode).toBe(422);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Validation failed"
            });
            expect(res.body.error.details).toBeDefined();
        });
    });

    describe("POST /auth/refresh-token", () => {
        let refreshToken;

        beforeEach(async () => {
            const password = "Pass@123";
            const passwordHashed = await hashService.hash(password);

            await knex("users").insert({
                name: "teste refresh token",
                email: "refresh@example.com",
                password: passwordHashed
            });

            const loginRes = await request(app)
                .post("/auth/login")
                .send({ email: "refresh@example.com", password: "Pass@123" });

            refreshToken = loginRes.body.data.refreshToken;
        });

        it("should return a new access token", async () => {
            const res = await request(app)
                .post("/auth/refresh-token")
                .send({ refreshToken });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("accessToken");
        });
    });

    describe("POST /auth/logout", () => {
        let refreshToken;

        beforeEach(async () => {
            const password = "Pass@123";
            const passwordHashed = await hashService.hash(password);

            await knex("users").insert({
                name: "teste logout",
                email: "logout@example.com",
                password: passwordHashed
            });

            const loginRes = await request(app)
                .post("/auth/login")
                .send({ email: "logout@example.com", password: "Pass@123" });

            refreshToken = loginRes.body.data.refreshToken;
        });

        it("should logout successfully", async () => {
            const res = await request(app)
                .post("/auth/logout")
                .send({ refreshToken });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Logged out successfully");
        });
    });

    describe("POST /auth/logout-all", () => {
        let refreshToken;

        beforeEach(async () => {
            const password = "Pass@123";
            const passwordHashed = await hashService.hash(password);

            await knex("users").insert({
                name: "teste logout all",
                email: "logout-all@example.com",
                password: passwordHashed
            });

            const loginRes = await request(app)
                .post("/auth/login")
                .send({ email: "logout-all@example.com", password: "Pass@123" });

            refreshToken = loginRes.body.data.refreshToken;
        });

        it("should logout from all devices successfully", async () => {
            const res = await request(app)
                .post("/auth/logout-all")
                .send({ refreshToken });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Logged out from all devices");
        });
    });
});