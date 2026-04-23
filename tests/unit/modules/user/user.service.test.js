const userService = require("../../../../src/modules/user/user.service");

jest.mock("../../../../src/modules/user/user.repository");
const userRepository = require("../../../../src/modules/user/user.repository");

describe("User Service (Unit)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("emailExists", () => {
        const email = "test@example.com"
        it("should throw an error if repository.existsByEmail fails", async () => {
            userRepository.existsByEmail.mockRejectedValue(new Error("fake error"));

            await expect(userService.emailExists(email))
                .rejects.toThrow("fake error");
        });

        it("should return true if repository returns true", async () => {
            userRepository.existsByEmail.mockResolvedValue(true);

            const result = await userService.emailExists(email);
            expect(result).toBe(true);
        });
    });

    describe("createUser", () => {
        const userData = { name: "Test", email: "test@example.com", password: "hashed" };
        it("should throw an error if repository.create fails", async () => {
            userRepository.create.mockRejectedValue(new Error("fake error"));

            await expect(userService.createUser(userData))
                .rejects.toThrow("fake error");
        });

        it("should call repository.create", async () => {
            userRepository.create.mockResolvedValue("uuid-123");

            const result = await userService.createUser(userData);
            
            expect(userRepository.create).toHaveBeenCalledWith(userData);
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