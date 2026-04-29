const userController = require("../../../../src/modules/user/user.controller");

jest.mock("../../../../src/modules/user/user.service");
const userService = require("../../../../src/modules/user/user.service");

describe("User Controller (Unit)", () => {
    let req, res;

    beforeEach(() => {
        req = { params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        
        jest.clearAllMocks();
    });

    describe("register", () => {
        const body = { 
            name: "Test", 
            email: "test@example.com", 
            password: "myPassword@123", 
            confirmpassword: "myPassword@123" 
        };

        it("should return 201 on successful registration", async () => {
            req.body = body;
            userService.createUser.mockResolvedValue("uuid-123");

            await userController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ msg: "User created successfully" });
        });

        it("should return 409 if email already exists", async () => {
            req.body = body;
            userService.createUser.mockRejectedValue(new Error("ALREADY_EXISTS"));

            await userController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ msg: "Email already in use, please choose another" });
        });

        it("should return 500 on unexpected error", async () => {
            req.body = body;
            userService.createUser.mockRejectedValue(new Error("DB error"));

            await userController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ msg: "Internal server error" });
        });
    });
    

    describe("getUser", () => {
        it("should return 400 if id is missing", async () => {
            await userController.getUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ msg: "User ID is required" });
        });

        it("should return 404 if user not found", async () => {
            req.params.id = "uuid-123";
            userService.findUserById.mockRejectedValue(new Error("fail in findUserById"));

            await userController.getUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ msg: "Internal server error" });
        });

        it("should return 404 if user not found", async () => {
            req.params.id = "uuid-123";
            userService.findUserById.mockResolvedValue(null);

            await userController.getUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ msg: "User not found" });
        });

        it("should return 200 and user data on success", async () => {
            req.params.id = "uuid";
            const mockUser = { id: "uuid", name: "Test", email: "test@example.com" };
            userService.findUserById.mockResolvedValue(mockUser);

            await userController.getUser(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });
    });
});