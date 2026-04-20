const authService = require("../../../services/authService");

jest.mock("../../../services/auth/hashService");
jest.mock("../../../services/userService"); 
jest.mock("../../../services/auth/jwtService");
jest.mock("../../../services/tokenService");

const hashService = require("../../../services/auth/hashService");
const userService = require("../../../services/userService");
const jwtService = require("../../../services/auth/jwtService");
const tokenService = require("../../../services/tokenService");


describe("Auth Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("registerUser", () => {
        it("should throw if fail in email check ", async () => {
            userService.emailExists.mockRejectedValue(new Error("fake error"));

            await expect(authService.registerUser({ email: "test@example.com", password: "testPassword@123" }))
                .rejects.toThrow("fake error");
        });

        it("should throw if email already exists ", async () => {
            userService.emailExists.mockResolvedValue(true);

            await expect(authService.registerUser({ email: "test@example.com", password: "testPassword@123" }))
                .rejects.toThrow("ALREADY_EXISTS");
        });

        it("should throw if fail in user creation", async () => {
            userService.emailExists.mockResolvedValue(false);
            hashService.hashPassword.mockResolvedValue("hashedPassword");
            userService.createUser.mockRejectedValue(new Error("fake error"));

            await expect(authService.registerUser({ email: "test@example.com", password: "testPassword@123" }))
                .rejects.toThrow("fake error");
        });

        it("should create user successfully", async () => {
            userService.emailExists.mockResolvedValue(false);
            hashService.hashPassword.mockResolvedValue("hashedPassword");
            userService.createUser.mockResolvedValue("uuid-123");

            const data = { name: "Test", email: "test@example.com", password: "testPassword@123" };
            const result = await authService.registerUser(data);

            expect(hashService.hashPassword).toHaveBeenCalledWith("testPassword@123");
            expect(userService.createUser).toHaveBeenCalledWith({
                name: "Test",
                email: "test@example.com",
                password: "hashedPassword",
            });

            expect(result).toBe("uuid-123");
        });
    });

    describe("login", () => {
        const userData = { id: "uuid-123", email: "test@example.com", password: "hashedPassword" };
        const decodedToken = { id: "uuid-123", exp: Math.floor(Date.now() / 1000) + (60 * 60) };

        it("should throw if fail in user retrieval", async () => {
            userService.findUserByEmailWithPassword.mockRejectedValue(new Error("fake error"));

            await expect(authService.login({ email: "test@example.com", password: "testPassword@123" }))
                .rejects.toThrow("fake error");
        });

        it("should throw if user does not exist", async () => {
            userService.findUserByEmailWithPassword.mockResolvedValue(undefined); // knex return undefined

            await expect(authService.login({ email: "test@example.com", password: "testPassword@123" }))
                .rejects.toThrow("INVALID");
        });


        it("should throw if password does not match", async () => {
            userService.findUserByEmailWithPassword.mockResolvedValue(userData);
            hashService.comparePassword.mockResolvedValue(false);

            await expect(authService.login({ email: "test@example.com", password: "wrongPassword" }))
                .rejects.toThrow("INVALID");
        });

        it("should throw if fail in save refresh token", async () => {
            userService.findUserByEmailWithPassword.mockResolvedValue(userData);
            hashService.comparePassword.mockResolvedValue(true);
            jwtService.generateAccessToken.mockReturnValue("access-token");
            jwtService.generateRefreshToken.mockReturnValue("refresh-token");
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.saveRefreshToken.mockRejectedValue(new Error("fake error"));

            await expect(authService.login({ email: "test@example.com", password: "testPassword@123" }))
                .rejects.toThrow("fake error");
        });   
        
        it("should login successfully", async () => {
            userService.findUserByEmailWithPassword.mockResolvedValue(userData);
            hashService.comparePassword.mockResolvedValue(true);
            jwtService.generateAccessToken.mockReturnValue("access-token");
            jwtService.generateRefreshToken.mockReturnValue("refresh-token");
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.saveRefreshToken.mockResolvedValue("token-id-123");


            const result = await authService.login({ email: "test@example.com", password: "testPassword@123" });

            expect(jwtService.generateAccessToken).toHaveBeenCalledWith("uuid-123");
            expect(jwtService.generateRefreshToken).toHaveBeenCalledWith("uuid-123");
            expect(jwtService.decodeRefreshToken).toHaveBeenCalledWith("refresh-token");
            expect(tokenService.saveRefreshToken).toHaveBeenCalledWith({
                token: "refresh-token",
                userId: "uuid-123",
                expiresAt: new Date(decodedToken.exp * 1000)
            });

            expect(result.accessToken).toBe("access-token");
            expect(result.refreshToken).toBe("refresh-token");
        });
    });

    describe("refreshAccessToken", () => {
        const refreshToken = "valid-refresh-token";
        const decodedToken = { id: "uuid-123", exp: Math.floor(Date.now() / 1000) + (60 * 60) };

        it("should throw error if fail to decode refresh token", async () => {
            jwtService.decodeRefreshToken.mockImplementation(() => {
                throw new Error("fake error");
            });

            await expect(authService.refreshAccessToken("expired-refresh-token"))
                .rejects.toThrow("fake error");
        });

        it("should throw error if fail in verify if refresh token exists", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.refreshTokenExists.mockRejectedValue(new Error("fake error"));

            await expect(authService.refreshAccessToken(refreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if refresh token does not exist", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.refreshTokenExists.mockResolvedValue(false);

            await expect(authService.refreshAccessToken(refreshToken))
                .rejects.toThrow("Refresh token not found or revoked");
        });

        it("should refresh access token successfully", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.refreshTokenExists.mockResolvedValue(true);
            jwtService.generateAccessToken.mockReturnValue("new-access-token");
            
            const result = await authService.refreshAccessToken(refreshToken);

            expect(jwtService.decodeRefreshToken).toHaveBeenCalledWith(refreshToken);
            expect(tokenService.refreshTokenExists).toHaveBeenCalledWith(refreshToken);
            expect(jwtService.generateAccessToken).toHaveBeenCalledWith("uuid-123");
            expect(result).toBe("new-access-token");
        });
    });

    describe("logout", () => {
        const refreshToken = "valid-refresh-token";
        const decodedToken = { id: "uuid-123", exp: Math.floor(Date.now() / 1000) + (60 * 60) };

        it("should throw error if fail to decode refresh token", async () => {
            jwtService.decodeRefreshToken.mockImplementation(() => {
                throw new Error("fake error");
            });

            await expect(authService.logout(refreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if fail to verify refresh token exists", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.refreshTokenExists.mockRejectedValue(new Error("fake error"));

            await expect(authService.logout(refreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if refresh token does not exist", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.refreshTokenExists.mockResolvedValue(false);

            await expect(authService.logout(refreshToken))
                .rejects.toThrow("NOT_FOUND");
        });

        it("should logout successfully", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.refreshTokenExists.mockResolvedValue(true);
            tokenService.revokeRefreshToken.mockResolvedValue(1); // knex returns number of rows deleted

            await expect(authService.logout(refreshToken))
                .resolves.toBe(1);
        });
    });
});