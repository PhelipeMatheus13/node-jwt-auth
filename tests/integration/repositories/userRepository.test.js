const { setupTestDatabase } = require("../../helpers/testDatabase");
// Ensure the test database is set up before importing the repository
const { setKnexInstance } = require("../../../config/database"); 
const userRepository = require("../../../repositories/userRepository");

describe("User Repository (Integration)", () => {
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
        await knex("users").del();
    });

    describe("create", () => {
        it("should insert a new user into the database", async () => {
            const userData = {
                name: "jhon doe",
                email: "jhon@example.com",
                password: "hashedpassword" 
            }

            const userId = await userRepository.create(userData);

            expect(userId).toBeDefined();
            expect(typeof userId).toBe("string");

            const user = await knex("users").where({ id: userId }).first();
            expect(user).toMatchObject(userData);
        });
    });
 
    describe("existsByEmail", () => {
        it("should return true if a user with the given email exists", async () => {
            const userData = {
                name: "jhon doe",
                email: "jhon@example.com",
                password: "hashedpassword"
            };

            await knex("users").insert(userData);
            
            const exists = await userRepository.existsByEmail("jhon@example.com");
            expect(exists).toBe(true);
        });

        it("should return false if a user with the given email does not exist", async () => {
            const exists = await userRepository.existsByEmail("nonexistent@example.com");
            expect(exists).toBe(false);
        });
    });

    describe("findByEmail", () => {
        it("should return the user if a user with the given email exists", async () => {
            const userData = {
                name: "jhon doe",
                email: "jhon@example.com",
                password: "hashedpassword"
            };

            await knex("users").insert(userData);

            const user = await userRepository.findByEmail("jhon@example.com");
            expect(user).toMatchObject(userData);
        });

        it("should return null if a user with the given email does not exist", async () => {
            const user = await userRepository.findByEmail("nonexistent@example.com");
            expect(user).toBe(undefined);
        });
    });

    describe("findById", () => {
        it("should return the user if a user with the given ID exists", async () => {
            const userData = {
                name: "jhon doe",
                email: "jhon@example.com",
                password: "hashedpassword"
            };

            const [{ id: userId }] = await knex("users")
                .insert(userData)
                .returning("id");

            const user = await userRepository.findById(userId);
            expect(user).toMatchObject({ ...userData, id: userId });
        });

        it("should return null if a user with the given ID does not exist", async () => {
            const user = await userRepository.findById("0c6f9075-b4f9-46fb-bd17-f8659cfbd6aa");
            expect(user).toBe(undefined);
        });
    });
})