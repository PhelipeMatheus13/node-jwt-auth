const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../app");
const User = require("../../models/User");
const authService = require("../../services/authService");
const tokenService = require("../../services/tokenService");

let mongoServer;
let accessToken;
let userId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("User Routes", () => {
    beforeEach(async () => {
        // Clear users and tokens before each test
        await User.deleteMany({});
        
        // Create a user for the tests
        const hashedPassword = await authService.hashPassword("userpass123");
        const user = await User.create({
            name: "Test User",
            email: "test@example.com",
            password: hashedPassword
        });
        userId = user._id.toString();

        // Generates a valid access token for this user
        accessToken = tokenService.generateAccessToken(userId);
    });

    describe("GET /users/:id", () => {
        it("should return user data when valid token is provided", async () => {
            const res = await request(app)
                .get(`/users/${userId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("_id", userId);
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
            const nonExistentId = new mongoose.Types.ObjectId().toString();
            const res = await request(app)
                .get(`/users/${nonExistentId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.msg).toBe("User not found");
        });
    });
});