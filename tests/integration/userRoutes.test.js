const request = require("supertest");
const app = require("../../app");
const { setupTestDatabase } = require("../helpers/testDatabase");
const { setKnexInstance } = require("../../config/database");
const authService = require("../../services/authService");
const tokenService = require("../../services/tokenService");


describe("User Routes", () => {
    let db;
    let knex;
    let userId;
    let accessToken;

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

        // create a test user in the database
        const hashedPassword = await authService.hashPassword("userpass123");
        const [user] = await knex("users")
        .insert({
            name: "Test User",
            email: "test@example.com",
            password: hashedPassword,
        })
        .returning("*");
        userId = user.id;

        accessToken = tokenService.generateAccessToken(userId);
    });


    describe("GET /users/:id", () => {
        it("should return user data when valid token is provided", async () => {
            const res = await request(app)
                .get(`/users/${userId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("id", userId);
            expect(res.body).toHaveProperty("name", "Test User");
            expect(res.body).toHaveProperty("email", "test@example.com");
            expect(res.body).not.toHaveProperty("password"); // The password should not be returned
        });

        it("should return 401 when no token is provided", async () => {
            const res = await request(app)
                .get(`/users/${userId}`);

            expect(res.statusCode).toBe(401);
            expect(res.body.msg).toBe("Access denied");
        });

        it("should return 401 when token is malformed", async () => {
            const res = await request(app)
                .get(`/users/${userId}`)
                .set("Authorization", "Bearer invalid.token.here");

            expect(res.statusCode).toBe(400);
            expect(res.body.msg).toBe("Invalid token");
        });

        it("should return 401 when token is expired", async () => {
            // Generates a token with instant expiration (0s)
            const jwt = require("jsonwebtoken");
            const expiredToken = jwt.sign({ id: userId }, process.env.SECRET, { expiresIn: "0s" });

            const res = await request(app)
                .get(`/users/${userId}`)
                .set("Authorization", `Bearer ${expiredToken}`);

            expect(res.statusCode).toBe(401);
            expect(res.body.msg).toBe("Token expired");
        });

        it("should return 404 if user does not exist", async () => {
            const nonExistentId = "00000000-0000-0000-0000-000000000000"; // Assuming this ID does not exist in the database
            const res = await request(app)
                .get(`/users/${nonExistentId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.msg).toBe("User not found");
        });
    });
});