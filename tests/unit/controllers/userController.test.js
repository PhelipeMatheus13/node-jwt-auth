const userController = require("../../../controllers/userController");
const userService = require("../../../services/userService");

jest.mock("../../../services/userService");

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