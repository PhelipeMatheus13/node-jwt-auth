const userController = require("../../../../src/modules/user/user.controller");
const userService = require("../../../../src/modules/user/user.service");

jest.mock("../../../../src/modules/user/user.service");

describe("User Controller (Unit)", () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, params: {} , user: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn(); // Mock next function for error handling
        jest.clearAllMocks();
    });

    describe("register", () => {
        it("should return 201 on successful registration", async () => {
            req.body = {
                name: "Test",
                email: "test@example.com",
                password: "Pass@123",
                confirmpassword: "Pass@123",
            };
            userService.createUser.mockResolvedValue("uuid-123");

            await userController.register(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "User created successfully",
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("getUser", () => {
        it("should return 200 with user data", async () => {
            req.params.id = "uuid-123";
            // User ownership authorization
            req.user.id = "uuid-123";
            req.user.role = "user";
            const mockUser = { id: "uuid-123", name: "Test", email: "test@example.com", role: "user" };
            userService.getUserById.mockResolvedValue(mockUser);

            await userController.getUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should return 200 with user data (admin)", async () => {
            req.params.id = "uuid-123";
            // Admin authorization
            req.user.id = "uuid-456"; 
            req.user.role = "admin";
            const mockUser = { id: "uuid-123", name: "Test", email: "test@example.com", role: "user" };
            userService.getUserById.mockResolvedValue(mockUser);

            await userController.getUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with badRequest error if id is missing", async () => {
            await userController.getUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 400,
                code: "BAD_REQUEST",
                message: "User ID is required",
            }));
            expect(res.status).not.toHaveBeenCalled();
        });

        it("should call next with forbidden error if user is not admin or owner", async () => {
            req.params.id = "uuid-123";
            req.user.id = "uuid-456";
            req.user.role = "user";

            await userController.getUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 403,
                code: "FORBIDDEN",
                message: "You can only access your own data",
            }));
            expect(res.status).not.toHaveBeenCalled();
        });
    });

    describe("deleteUser", () => {
        it("should return 200 if delete user is successful", async () => {
            req.params.id = "uuid-123";
            // User ownership authorization
            req.user.id = "uuid-123";
            req.user.role = "user";

            userService.deleteUserById.mockResolvedValue(1);

            await userController.deleteUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User deleted successfully'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should return 200 if delete user is successful (admin)", async () => {
            req.params.id = "uuid-123";
            // Admin authorization
            req.user.id = "uuid-456"; 
            req.user.role = "admin";

            userService.deleteUserById.mockResolvedValue(1);

            await userController.deleteUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
               message: 'User deleted successfully'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with badRequest error if id is missing", async () => {
            await userController.deleteUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 400,
                code: "BAD_REQUEST",
                message: "User ID is required",
            }));
            expect(res.status).not.toHaveBeenCalled();
        });

        it("should call next with forbidden error if user is not admin or owner", async () => {
            req.params.id = "uuid-123";
            req.user.id = "uuid-456";
            req.user.role = "user";

            await userController.deleteUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 403,
                code: "FORBIDDEN",
                message: "You can only access your own data",
            }));
            expect(res.status).not.toHaveBeenCalled();
        });
    });
});