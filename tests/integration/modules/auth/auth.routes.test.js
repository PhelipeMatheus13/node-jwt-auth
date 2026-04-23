const request = require("supertest");
const app = require("../../../../src/app");
const { setupTestDatabase } = require("../../../helpers/testDatabase");
const { setKnexInstance } = require("../../../../src/shared/config/database");

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

    describe("POST /auth/register", () => {
        const validUser = {
            name: "John Doe",
            email: "john@example.com",
            password: "Pass@123",
            confirmPassword: "Pass@123"
        };

        it("should register a new user successfully", async () => {
            const res = await request(app)
                .post("/auth/register")
                .send(validUser);

            expect(res.statusCode).toBe(201);
            expect(res.body.msg).toBe("User created successfully");

            const user = await knex("users").where({ email: validUser.email }).first();
            expect(user).toBeTruthy();
            expect(user.name).toBe(validUser.name);
        });

        it("should return 422 if validation fails (e.g., short password)", async () => {
            const invalidUser = { ...validUser, password: "123" };
            const res = await request(app)
                .post("/auth/register")
                .send(invalidUser);

            expect(res.statusCode).toBe(422);
            expect(res.body.errors).toBeDefined();
            expect(res.body.errors[0].msg).toMatch(/at least 6 characters/);
        });
    });

    describe("POST /auth/login", () => {
        beforeEach(async () => {
            await request(app).post("/auth/register").send({
                name: "Login Test",
                email: "login@example.com",
                password: "Pass@123",
                confirmPassword: "Pass@123"
            });
        });

        it("should login successfully and return tokens", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({ email: "login@example.com", password: "Pass@123" });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("accessToken");
            expect(res.body).toHaveProperty("refreshToken");
        });

        it("should return 422 if validation fails (e.g., missing email)", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({ password: "Pass@123" });

            expect(res.statusCode).toBe(422);
            expect(res.body.errors).toBeDefined();
        });
    });

    describe("POST /auth/refresh-token", () => {
        let refreshToken;

        beforeEach(async () => {
            await request(app).post("/auth/register").send({
                name: "Refresh Test",
                email: "refresh@example.com",
                password: "Pass@123",
                confirmPassword: "Pass@123"
            });

            const loginRes = await request(app)
                .post("/auth/login")
                .send({ email: "refresh@example.com", password: "Pass@123" });

            refreshToken = loginRes.body.refreshToken;
        });

        it("should return a new access token", async () => {
            const res = await request(app)
                .post("/auth/refresh-token")
                .send({ refreshToken });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("accessToken");
        });
    });

    describe("POST /auth/logout", () => {
        let refreshToken;

        beforeEach(async () => {
            await request(app).post("/auth/register").send({
                name: "Logout Test",
                email: "logout@example.com",
                password: "Pass@123",
                confirmPassword: "Pass@123"
            });

            const loginRes = await request(app)
                .post("/auth/login")
                .send({ email: "logout@example.com", password: "Pass@123" });

            refreshToken = loginRes.body.refreshToken;
        });

        it("should logout successfully and remove refresh token", async () => {
            const res = await request(app)
                .post("/auth/logout")
                .send({ refreshToken });

            expect(res.statusCode).toBe(200);
            expect(res.body.msg).toBe("Logged out successfully");

            const stored = await knex("refresh_tokens").where({ token: refreshToken }).first();
            expect(stored).toBeUndefined();
        });
    });
});