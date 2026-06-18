const request = require("supertest");
const app = require("../../../../src/app");
const { setupTestDatabase } = require("../../../helpers/testDatabase");
const { setKnexInstance } = require("../../../../src/shared/config/database");
const jwtService = require("../../../../src/shared/services/jwt.service");

describe("User Routes (Integration)", () => {
    let db, knex, userId, accessToken;

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

    describe("POST /users/register", () => {
        const validUser = {
            name: "John Doe",
            email: "john@example.com",
            password: "Pass@123",
            confirmPassword: "Pass@123"
        };

        it("should register a new user successfully", async () => {
            const res = await request(app)
                .post("/users/register")
                .send(validUser);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toEqual("User created successfully");

            const user = await knex("users").where({ email: validUser.email }).first();
            expect(user).toBeTruthy();
            expect(user.name).toBe(validUser.name);
        });

        it("should return 422 if validation fails (e.g., short password)", async () => {
            const invalidUser = { ...validUser, password: "123" };
            const res = await request(app)
                .post("/users/register")
                .send(invalidUser);

            expect(res.statusCode).toBe(422);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Validation failed"
            });
            expect(res.body.error.details).toBeDefined();
            expect(res.body.error.details[0].msg).toMatch(/at least 6 characters/);
        });
    });

    describe("GET /users/:id", () => {
        beforeEach(async () => {
            const [user] = await knex("users")
                .insert({
                    name: "Test User",
                    email: "test@example.com",
                    password: "hashedpass"
                })
                .returning("*");

            userId = user.id;
            accessToken = jwtService.generateAccessToken(userId, "user");
        });

        it("should return user data with valid token", async () => {
            const res = await request(app)
                .get(`/users/${userId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                id: userId,
                name: "Test User",
                email: "test@example.com"
            });
            expect(res.body.data.password).toBeUndefined(); // password should not be returned
        });

        it("should return 401 when no token is provided", async () => {
            const res = await request(app).get(`/users/${userId}`);

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toEqual({
                code: "UNAUTHORIZED",
                message: "Access denied"
            });
        });
    });

    describe("DELETE /users/:id", () => {
        beforeEach(async () => {
            const [user] = await knex("users")
                .insert({
                    name: "Test User",
                    email: "test@example.com",
                    password: "hashedpass"
                })
                .returning("*");

            userId = user.id;
            accessToken = jwtService.generateAccessToken(userId, "user");
        });

        it("should delete user with valid token", async () => {
            const res = await request(app)
                .delete(`/users/${userId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('User deleted successfully');
        });

        it("should return 401 when no token is provided", async () => {
            const res = await request(app).delete(`/users/${userId}`);

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toEqual({
                code: "UNAUTHORIZED",
                message: "Access denied"
            });
        });
    });
});
