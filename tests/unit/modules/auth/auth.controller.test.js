const authController = require("../../../../src/modules/auth/auth.controller");
const authService = require("../../../../src/modules/auth/auth.service");

jest.mock("../../../../src/modules/auth/auth.service");

describe("Auth Controller (Unit)", () => {
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
            await authController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { accessToken: "fakeAccessToken", refreshToken: "fakeRefreshToken" }
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("refresh", () => {
        const body = {
            refreshToken: "test-refresh-token"
        }; 

        it("should return 200 and ne access token on successful refreshing Token", async () => {
            req.body = body;
            authService.rotateTokens.mockResolvedValue({
                accessToken: "access-token",
                refreshToken: "refresh-token"
            });
            await authController.refresh(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { accessToken: "access-token", refreshToken: "refresh-token" }
            });
            expect(next).not.toHaveBeenCalled();
        });
        
        it("should return 400 if Refresh token is invalid", async () => {
            req.body = {};
            await authController.refresh(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 400,
                code: "BAD_REQUEST",
                message: "Refresh token is required"
            }));
        });
    });
 
    describe("logout", () => {
        const body = {
            refreshToken: "test-refresh-token"
        }; 

        it("should return 200 on successful logout", async () => {
            req.body = body;
            authService.logout.mockResolvedValue(null);
            await authController.logout(req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Logged out successfully"
            });
            expect(next).not.toHaveBeenCalled();
        });
        
        it("should return 400 if Refresh token is invalid", async () => {
            req.body = {};
            await authController.logout(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 400,
                code: "BAD_REQUEST",
                message: "Refresh token is required"
            }));
        });
    });

    describe("logoutAll", () => {
        const body = {
            refreshToken: "test-refresh-token"
        }; 

        it("should return 200 on successful logout", async () => {
            req.body = body;
            authService.logoutAll.mockResolvedValue(null);
            await authController.logoutAll(req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Logged out from all devices"
            });
            expect(next).not.toHaveBeenCalled();
        });
        
        it("should return 400 if Refresh token is invalid", async () => {
            req.body = {};
            await authController.logoutAll(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 400,
                code: "BAD_REQUEST",
                message: "Refresh token is required",
            }));
        });

    });
});