const authController = require("../../../controllers/authController");
const authService = require("../../../services/authService");

jest.mock("../../../services/authService");

describe("Auth Controller (Unit)", () => {
  let req, res;

    beforeEach(() => {
        req = { body: {} };
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
            authService.registerUser.mockResolvedValue("uuid-123");

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ msg: "User created successfully" });
        });

        it("should return 409 if email already exists", async () => {
            req.body = body;
            authService.registerUser.mockRejectedValue(new Error("ALREADY_EXISTS"));

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ msg: "Email already in use, please choose another" });
        });

        it("should return 500 on unexpected error", async () => {
            req.body = body;
            authService.registerUser.mockRejectedValue(new Error("DB error"));

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ msg: "Internal server error" });
        });
    });

    describe("login", () => {
        const body = {
            email: "testlogin@example.com",
            password: "mypassword@123"
        }; 

        it("should return 200 and access tokens on successful login", async () => {
            req.body = body;
            authService.login.mockResolvedValue({
                accessToken: "fakeAccessToken",
                refreshToken: "fakeRefreshToken"
            });

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                msg: "Login successful",
                accessToken: "fakeAccessToken",
                refreshToken: "fakeRefreshToken"
            });
        });
        
        it("should return 401 if invalid credentials ", async () => {
            req.body = body;
            authService.login.mockRejectedValue(new Error("INVALID"));

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ msg: "Invalid email or password" });
        });

        it("should return 500 on unexpected error", async () => {
            req.body = body;
            authService.login.mockRejectedValue(new Error("fake error"));

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ msg: "Internal server error" });
        });
    });

    describe("refreshToken", () => {
        const body = {
            refreshToken: "test-refresh-token"
        }; 

        it("should return 200 and ne access token on successful refreshing Token", async () => {
            req.body = body;
            authService.refreshAccessToken.mockResolvedValue("test-access-token")

            await authController.refreshToken(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({accessToken: "test-access-token"});
        });
        
        it("should return 401 if Refresh token is empty", async () => {
            req.body = {};

            await authController.refreshToken(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ msg: "Refresh token is required" });
        });

        it("should return 401 if invalid Refresh token", async () => {
            req.body = body;
            authService.refreshAccessToken.mockRejectedValue(new Error("INVALID"))

            await authController.refreshToken(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ msg: "Invalid or expired token, please login again" });
        });

        it("should return 500 on unexpected error", async () => {
            req.body = body;
            authService.refreshAccessToken.mockRejectedValue(new Error("fake error"));

            await authController.refreshToken(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ msg: "Internal server error" });
        });
    });

    describe("logout", () => {
        const body = {
            refreshToken: "test-refresh-token"
        }; 

        it("should return 200 on successful logout", async () => {
            req.body = body;
            authService.logout.mockResolvedValue(null);

            await authController.logout(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });
        
        it("should return 401 if Refresh token is empty", async () => {
            req.body = {};

            await authController.logout(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ msg: "Refresh token is required" });
        });
        
        it("should return 404 if Refresh token not exists", async () => {
            req.body = body;
            authService.logout.mockRejectedValue(new Error("NOT_FOUND"));

            await authController.logout(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ msg: "Refresh token not found or revoked" });
        });

        it("should return 500 on unexpected error", async () => {
            req.body = body;
            authService.logout.mockRejectedValue(new Error("fake error"));

            await authController.refreshToken(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ msg: "Internal server error" });
        });
    });
});