const request = require("supertest");
const authService = require("../../services/authService");
const app = require("../../app"); 
const { setupTestDatabase } = require("../helpers/testDatabase");
const { setKnexInstance } = require("../../config/database");


describe("Auth Routes", () => {
    let db;
    let knex;

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
        await knex("refresh_tokens").del();
        await knex("users").del();
    });


    describe("POST /auth/register", () => {
        it("should register a new user successfully", async () => {
            const resp = await request(app)
                .post("/auth/register")
                .send({
                    name: "John Doe",
                    email: "johndoe@example.com",
                    password: "mypassword@123",
                    confirmPassword: "mypassword@123"
                });

            expect(resp.statusCode).toBe(201);
            expect(resp.body.msg).toBe("User created successfully");
            // verify that the user is actually in the database
            const user = await knex("users").where({ email: "johndoe@example.com" }).first();
            expect(user).toBeTruthy();
            expect(user.name).toBe("John Doe");
            expect(user.email).toBe("johndoe@example.com");
            // verify that the password is hashed
            const isMatch = await authService.comparePassword("mypassword@123", user.password);
            expect(isMatch).toBe(true);
        });

        it("should fail if email already exists", async () => {
            // frist register
            await request(app)
                .post("/auth/register")
                .send({
                    name: "John Doe",
                    email: "johndoe@example.com",
                    password: "mypassword@123",
                    confirmPassword: "mypassword@123"
                });

            // try to register again with the same email
            const resp = await request(app)
                .post("/auth/register")
                .send({
                    name: "Jane Doe",
                    email: "johndoe@example.com",
                    password: "anotherpassword@123",
                    confirmPassword: "anotherpassword@123"
                });

            expect(resp.statusCode).toBe(422);
            expect(resp.body.msg).toMatch(/Email already in use/);
        });

        it("should fail with validation errors", async () => {
            const resp = await request(app)
                .post("/auth/register")
                .send({
                    name: "",
                    email: "notanemail",
                    password: "123",
                    confirmPassword: "1234"
                });

            expect(resp.statusCode).toBe(422);
            expect(resp.body.errors).toBeDefined();
        });
    });

    describe("POST /auth/login", () => {
        beforeEach(async () => {
            // Create a user to login (create new at each iteration "it")
            await request(app)
                .post("/auth/register")
                .send({
                    name: "John Doe",
                    email: "johndoe@example.com",
                    password: "mypassword@123",
                    confirmPassword: "mypassword@123"
                });
        });

        it("should login successfully with correct credentials", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({
                    email: "johndoe@example.com", 
                    password: "mypassword@123" 
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.accessToken).toBeDefined();
            expect(res.body.refreshToken).toBeDefined();
        });

        it("should fail with wrong password", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({ 
                    email: "johndoe@example.com", 
                    password: "wrongpassword" 
                });

            expect(res.statusCode).toBe(422);
            expect(res.body.msg).toBe("Invalid password");
        });

        it("should fail with non-existent email", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({ 
                    email: "fake@example.com", 
                    password: "fake123" 
                });

            expect(res.statusCode).toBe(404);
            expect(res.body.msg).toBe("User not found");
        });
    });

    describe("POST /auth/refresh-token", () => {
        let refreshToken;

        beforeEach(async () => {

            await request(app)
                .post("/auth/register")
                .send({
                    name: "John Doe",
                    email: "johndoe@example.com",
                    password: "mypassword@123",
                    confirmPassword: "mypassword@123"
                });

            const loginResp = await request(app)
                .post("/auth/login")
                .send({
                    email: "johndoe@example.com", 
                    password: "mypassword@123"
                });

            refreshToken = loginResp.body.refreshToken;
        });

        it("should return a new access token with valid refresh token", async () => {
            const res = await request(app)
                .post("/auth/refresh-token")
                .send({ refreshToken });
                
            expect(res.statusCode).toBe(200);
            expect(res.body.accessToken).toBeDefined();
        });

        it("should fail without refresh token", async () => {
            const res = await request(app)
                .post("/auth/refresh-token")
                .send({});

            expect(res.statusCode).toBe(401);
            expect(res.body.msg).toBe("Refresh token is required");
        });

        it("should fail with invalid refresh token", async () => {
            const res = await request(app)
                .post("/auth/refresh-token")
                .send({ refreshToken: "invalid.token" });

            expect(res.statusCode).toBe(403);
        });
    });

    describe("POST /auth/logout", () => {
        let refreshToken;

        beforeEach(async () => {
            await request(app)
                .post("/auth/register")
                .send({
                    name: "John Doe",
                    email: "johndoe@example.com",
                    password: "mypassword@123",
                    confirmPassword: "mypassword@123"
                });

            const loginRes = await request(app)
                .post("/auth/login")
                .send({
                    email: "johndoe@example.com", 
                    password: "mypassword@123"
                });
                
            refreshToken = loginRes.body.refreshToken;
        });

        it("should logout successfully", async () => {
            const res = await request(app)
                .post("/auth/logout")
                .send({ refreshToken });

            expect(res.statusCode).toBe(200);
            expect(res.body.msg).toMatch(/Logged out/);
        });

        it("should fail with invalid refresh token", async () => {
            const res = await request(app)
                .post("/auth/logout")
                .send({ refreshToken: "invalid.token" });

            expect(res.statusCode).toBe(400);
        });

        it("should fail without refresh token", async () => {
            const res = await request(app)
                .post("/auth/logout")
                .send({});

            expect(res.statusCode).toBe(400);
        });
    });
});