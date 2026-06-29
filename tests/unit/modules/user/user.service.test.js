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
                .rejects.toMatchObject({
                    statusCode: 409,
                    code: "ALREADY_EXISTS",
                    message: "Email already in use, please choose another",
                    isOperational: true,
                });
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


    describe("getUserById", () => {
        const userId = "uuid-123";

        it("should throw an error if repository.findById fails", async () => {
            userRepository.findById.mockRejectedValue(new Error("fake error"));

            await expect(userService.getUserById(userId))
                .rejects.toThrow("fake error");
        });


        it("should throw NOT_FOUND error if user does not exist", async () => {
           userRepository.findById.mockResolvedValue(undefined); // knex returns undefined

            await expect(userService.getUserById(userId))
                .rejects.toMatchObject({
                    statusCode: 404,
                    code: "NOT_FOUND",
                    message: "User not found",
                    isOperational: true,
                });
        });

        it("should return user", async () => {
            userRepository.findById.mockResolvedValue({
                id: userId, name: "Test", email: "test@example.com", password: "secret"
            });

            const result = await userService.getUserById(userId);

            expect(result).toEqual({
                id: userId, 
                name: "Test", 
                email: "test@example.com", 
                password: "secret"
            });
        });

    });

    describe("findUserByEmail", () => {
        const email = "test@example.com";
        const userResponse = { id: "uuid-123", name: "Test", email: email, password: "hashed" };
        it("should throw an error if repository.findByEmail fails", async () => {
            userRepository.findByEmail.mockRejectedValue(new Error("fake error"));

            await expect(userService.findUserByEmail(email)).rejects.toThrow("fake error");
        });

        it("should return user", async () => {
            userRepository.findByEmail.mockResolvedValue(userResponse);

            const result = await userService.findUserByEmail(email);
            expect(result).toEqual(userResponse);
        });
    });

    describe("deleteUserById", () => {
        const userId = "uuid-123";
        it("should throw an error if repository.deleteById fails", async () => {
            userRepository.deleteById.mockRejectedValue(new Error("fake error"));

            await expect(userService.deleteUserById(userId)).rejects.toThrow("fake error");
        });

        it("should throw an error if user does not exist", async () => {
            userRepository.deleteById.mockResolvedValue(0);

            await expect(userService.deleteUserById(userId)).rejects.toMatchObject({
                statusCode: 404,
                code: "NOT_FOUND",
                message: "User not found",
                isOperational: true,
            });
        });

        it("should delete user by ID", async () => {
            userRepository.deleteById.mockResolvedValue(1);

            await expect(
                userService.deleteUserById(userId)
            ).resolves.toBeUndefined();

            expect(userRepository.deleteById).toHaveBeenCalledWith(userId);
        });
    });
});