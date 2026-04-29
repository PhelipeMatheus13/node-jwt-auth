const userService = require("../../../../src/modules/user/user.service");

jest.mock("../../../../src/modules/user/user.repository");
jest.mock("../../../../src/shared/services/hash.service");
const userRepository = require("../../../../src/modules/user/user.repository");
const hashService = require("../../../../src/shared/services/hash.service");


describe("User Service (Unit)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createUser", () => {
        it("should throw if fail in email check ", async () => {
            userRepository.existsByEmail.mockRejectedValue(new Error("fake error"));

            await expect(userService.createUser({ email: "test@example.com", password: "testPassword@123" }))
                .rejects.toThrow("fake error");
        });

        it("should throw if email already exists ", async () => {
            userRepository.existsByEmail.mockResolvedValue(true);

            await expect(userService.createUser({ email: "test@example.com", password: "testPassword@123" }))
                .rejects.toThrow("ALREADY_EXISTS");
        });

        it("should throw if fail in user creation", async () => {
            userRepository.existsByEmail.mockResolvedValue(false);
            hashService.hash.mockResolvedValue("hashedPassword");
            userRepository.create.mockRejectedValue(new Error("fake error"));

            await expect(userService.createUser({ email: "test@example.com", password: "testPassword@123" }))
                .rejects.toThrow("fake error");
        });

        it("should create user successfully", async () => {
            userRepository.existsByEmail.mockResolvedValue(false);
            hashService.hash.mockResolvedValue("hashedPassword");
            userRepository.create.mockResolvedValue("uuid-123");

            const data = { name: "Test", email: "test@example.com", password: "testPassword@123" };
            const result = await userService.createUser(data);

            expect(hashService.hash).toHaveBeenCalledWith("testPassword@123");
            expect(userRepository.create).toHaveBeenCalledWith({
                name: "Test",
                email: "test@example.com",
                password: "hashedPassword",
            });

            expect(result).toBe("uuid-123");
        });
    });


    describe("findUserById", () => {
        const userId = "uuid-123";
        const userResponse = { id: userId, name: "Test", email: "test@example.com" };
        it("should throw an error if repository.findById fails", async () => {
            userRepository.findById.mockRejectedValue(new Error("fake error"));

            await expect(userService.findUserById(userId))
                .rejects.toThrow("fake error");
        });

        it("should return user without password", async () => {
            userRepository.findById.mockResolvedValue({
                id: userId, name: "Test", email: "test@example.com", password: "secret"
            });

            const result = await userService.findUserById(userId);

            expect(result).toEqual(userResponse);
            expect(result.password).toBeUndefined();
        });

        it("should return user without password", async () => {
            userRepository.findById.mockResolvedValue({
                id: userId, name: "Test", email: "test@example.com", password: "secret"
            });

            const result = await userService.findUserById(userId);

            expect(result).toEqual(userResponse);
            expect(result.password).toBeUndefined();
        });

        it("should return null if user not found", async () => {
            userRepository.findById.mockResolvedValue(undefined); // knex returns undefined for non-existing records
            const result = await userService.findUserById(userId);
            
            expect(result).toBeUndefined();
        });
    });

    describe("findUserByEmailWithPassword", () => {
        const email = "test@example.com";
        const userResponse = { id: "uuid-123", name: "Test", email: email, password: "hashed" };
        it("should throw an error if repository.findByEmail fails", async () => {
            userRepository.findByEmail.mockRejectedValue(new Error("fake error"));

            await expect(userService.findUserByEmailWithPassword(email)).rejects.toThrow("fake error");
        });

        it("should return user with password", async () => {
            userRepository.findByEmail.mockResolvedValue(userResponse);

            const result = await userService.findUserByEmailWithPassword(email);
            expect(result).toEqual(userResponse);
        });

        it("should return null if user not found", async () => {
            userRepository.findByEmail.mockResolvedValue(undefined); // knex returns undefined for non-existing records
            const result = await userService.findUserByEmailWithPassword(email);

            expect(result).toBeUndefined();
        });
    });
});