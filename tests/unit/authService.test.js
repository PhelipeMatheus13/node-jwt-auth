const authService = require("../../services/authService");
const { setupTestDatabase } = require("../helpers/testDatabase");
const { setKnexInstance } = require("../../config/database");


describe("Auth Service", () => {
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
        await knex("users").del();
    });

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
        it("should create a new user", async () => {
            const userData = {
                name: "Test User",
                email: "test@example.com",
                password: "hashedpass"
            };
            const userId = await authService.createUser(userData);
            expect(userId).toBeDefined();
            expect(typeof userId).toBe("string");

            const user = await knex("users").where({ id: userId }).first();
            expect(user).toBeTruthy();
            expect(user.email).toBe(userData.email);
            expect(user.password).toBe(userData.password);
        });

        it("should find user by email", async () => {
            await authService.createUser({
                name: "Test User",
                email: "test@example.com",
                password: "hashedpass",
            });
            const user = await authService.findUserByEmail("test@example.com");
            expect(user).toBeTruthy();
            expect(user.name).toBe("Test User");
            expect(user.email).toBe("test@example.com");
            expect(user.password).toBe("hashedpass"); 
        });

        it("should return null if email not found", async () => {
            const user = await authService.findUserByEmail("notexist@example.com");
            expect(user).toBeUndefined();
        });
    });

    describe("emailExists", () => {
        it("should return true if email exists", async () => {
            await authService.createUser({
                name: "Test User",
                email: "exists@example.com",
                password: "hashedpass",
            });

            const exists = await authService.emailExists("exists@example.com");
            expect(exists).toBe(true);
        });

        it("should return false if email does not exist", async () => {
            const exists = await authService.emailExists("new@example.com");
            expect(exists).toBe(false);
        });
    });
});