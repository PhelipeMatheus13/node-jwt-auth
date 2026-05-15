const userController = require("../../../../src/modules/user/user.controller");

jest.mock("../../../../src/modules/user/user.service");
const userService = require("../../../../src/modules/user/user.service");

describe("User Controller (Unit)", () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, params: {} };
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
        it("should return 200 with user data if id is provided", async () => {
            req.params.id = "uuid-123";
            const mockUser = { id: "uuid-123", name: "Test", email: "test@example.com" };
            userService.findUserById.mockResolvedValue(mockUser);

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
    });
});