const { setupTestDatabase } = require("../../../helpers/testDatabase");
// Ensure the test database is set up before importing the repository
const { setKnexInstance } = require("../../../../src/shared/config/database"); 
const userRepository = require("../../../../src/modules/user/user.repository");

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

    describe("Writer repository", () => {
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
                expect(user.name).toBe("jhon doe");
                expect(user.email).toBe("jhon@example.com");
                expect(user.password).toBe("hashedpassword");
                expect(user.role).toBe("user");
            });
        });

        describe("deleteById", () => {
            it("should delete a user from the database by ID", async () => {
                const userData = {
                    name: "jhon doe",
                    email: "jhon@example.com",
                    password: "hashedpassword" 
                }

                const [{ id: userId }] = await knex("users")
                    .insert(userData)
                    .returning("id");

                const deletedCount = await userRepository.deleteById(userId);
                expect(deletedCount).toBe(1);

                const user = await knex("users").where({ id: userId }).first();
                expect(user).toBeUndefined();
            });

            it("should return 0 if no user was deleted", async () => {
                const deletedCount = await userRepository.deleteById("0c6f9075-b4f9-46fb-bd17-f8659cfbd6aa"); // Non-existent ID
                expect(deletedCount).toBe(0);
            });
        });
    });

    describe("Reader repository", () => {
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
                expect(user.name).toBe("jhon doe");
                expect(user.email).toBe("jhon@example.com");
                expect(user.password).toBe("hashedpassword");
                expect(user.role).toBe("user");
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
                expect(user.name).toBe("jhon doe");
                expect(user.email).toBe("jhon@example.com");
                expect(user.password).toBe("hashedpassword");
                expect(user.role).toBe("user");
            });

            it("should return null if a user with the given ID does not exist", async () => {
                const user = await userRepository.findById("0c6f9075-b4f9-46fb-bd17-f8659cfbd6aa");
                expect(user).toBe(undefined);
            });
        });
    });
})