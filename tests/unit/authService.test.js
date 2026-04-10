const authService = require("../../services/authService");
const User = require("../../models/User");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("Auth Service", () => {
    describe("hashPassword", () => {
        it("should generate a hashed password", async () => {
            const password = "mypassword@123";
            const hash = await authService.hashPassword(password);
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(20);
        });
    });

    describe("comparePassword", () => {
        it("should return true for correct password", async () => {
            const password = "mypassword@123";
            const hash = await authService.hashPassword(password);
            const match = await authService.comparePassword(password, hash);
            expect(match).toBe(true);
        });

        it("should return false for wrong password", async () => {
            const hash = await authService.hashPassword("mypassword@123");
            const match = await authService.comparePassword("falsepassword", hash);
            expect(match).toBe(false);
        });
    });

    describe("createUser and findUserByEmail", () => {
        // Clears the database before each test (at each iteration "it")
        beforeEach(async () => {
            await User.deleteMany({});
        });

        it("should create a new user", async () => {
            const userData = {
                name: "Test User",
                email: "test@example.com",
                password: "hashedpass"
            };
            const user = await authService.createUser(userData);
            expect(user._id).toBeDefined();
            expect(user.email).toBe(userData.email);
            expect(user.password).toBe(userData.password);
        });

        it("should find user by email", async () => {
            await authService.createUser({
                name: "Test User",
                email: "test@example.com",
                password: "hashedpass"
            });
            const resp = await authService.findUserByEmail("test@example.com");
            expect(resp).toBeTruthy();
            expect(resp.name).toBe("Test User");
        });

        it("should return null if email not found", async () => {
            const resp = await authService.findUserByEmail("notexist@example.com");
            expect(resp).toBeNull();
        });
    });
});