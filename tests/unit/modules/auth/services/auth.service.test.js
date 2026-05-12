const authService = require("../../../../../src/modules/auth/services/auth.service");

jest.mock("../../../../../src/shared/services/hash.service");
jest.mock("../../../../../src/modules/user/user.service"); 
jest.mock("../../../../../src/modules/auth/services/jwt.service");
jest.mock("../../../../../src/modules/token/token.service");

const hashService = require("../../../../../src/shared/services/hash.service");
const userService = require("../../../../../src/modules/user/user.service");
const jwtService = require("../../../../../src/modules/auth/services/jwt.service");
const tokenService = require("../../../../../src/modules/token/token.service");


describe("Auth Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
            hashService.compare.mockResolvedValue(false);

            await expect(authService.login({ email: "test@example.com", password: "wrongPassword" }))
                .rejects.toThrow("INVALID");
        });

        it("should throw if fail in save refresh token", async () => {
            userService.findUserByEmailWithPassword.mockResolvedValue(userData);
            hashService.compare.mockResolvedValue(true);
            jwtService.generateAccessToken.mockReturnValue("access-token");
            jwtService.generateRefreshToken.mockReturnValue("refresh-token");
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            hashService.hash.mockReturnValue("hashedToken");
            tokenService.saveRefreshToken.mockRejectedValue(new Error("fake error"));

            await expect(authService.login({ email: "test@example.com", password: "testPassword@123" }))
                .rejects.toThrow("fake error");
        });   
        
        it("should login successfully", async () => {
            userService.findUserByEmailWithPassword.mockResolvedValue(userData);
            hashService.compare.mockResolvedValue(true);
            jwtService.generateAccessToken.mockReturnValue("access-token");
            jwtService.generateRefreshToken.mockReturnValue("refresh-token");
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            hashService.hash.mockReturnValue("hashedToken");
            tokenService.saveRefreshToken.mockResolvedValue("token-id-123");


            const result = await authService.login({ email: "test@example.com", password: "testPassword@123" });

            expect(jwtService.generateAccessToken).toHaveBeenCalledWith("uuid-123");
            expect(jwtService.generateRefreshToken).toHaveBeenCalledWith("uuid-123");
            expect(jwtService.decodeRefreshToken).toHaveBeenCalledWith("refresh-token");
            expect(hashService.hash).toHaveBeenCalledWith("refresh-token");
            expect(tokenService.saveRefreshToken).toHaveBeenCalledWith({
                token: "hashedToken",
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

        it("should throw error if fail in tokenService.listRefreshTokensByUserId", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.listRefreshTokensByUserId.mockRejectedValue(new Error("fake error"));

            await expect(authService.refreshAccessToken(refreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if tokenService.listRefreshTokensByUserId return empty", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.listRefreshTokensByUserId.mockResolvedValue([]);

            await expect(authService.refreshAccessToken(refreshToken))
                .rejects.toThrow("NOT_FOUND");
        });

        it("should throw error an error if no hash matches", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.listRefreshTokensByUserId.mockResolvedValue([
                {token: "hash-token-123"},
                {token: "hash-token-456"}
            ]);
            hashService.compare.mockResolvedValueOnce(false); // first call
            hashService.compare.mockResolvedValueOnce(false); // second call
            jwtService.generateAccessToken.mockReturnValue("new-access-token");
            jwtService.generateAccessToken.mockReturnValue("new-access-token");
            
            await expect(authService.refreshAccessToken(refreshToken))
                .rejects.toThrow("NOT_FOUND");
        });

        it("should refresh access token successfully", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.listRefreshTokensByUserId.mockResolvedValue([
                {token: "hash-token-123"},
                {token: "hash-token-456"}
            ]);
            hashService.compare.mockResolvedValueOnce(false); // first call
            hashService.compare.mockResolvedValueOnce(true);  // second call
            jwtService.generateAccessToken.mockReturnValue("new-access-token");
            jwtService.generateAccessToken.mockReturnValue("new-access-token");
            
            const result = await authService.refreshAccessToken(refreshToken);

            expect(jwtService.decodeRefreshToken).toHaveBeenCalledWith(refreshToken);
            expect(tokenService.listRefreshTokensByUserId).toHaveBeenCalledWith(decodedToken.id);
            expect(hashService.compare).toHaveBeenCalledWith(refreshToken, "hash-token-123");
            expect(hashService.compare).toHaveBeenCalledWith(refreshToken, "hash-token-456");
            expect(jwtService.generateAccessToken).toHaveBeenCalledWith(decodedToken.id);
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

        it("should throw error if fail in tokenService.listRefreshTokensByUserId", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.listRefreshTokensByUserId.mockRejectedValue(new Error("fake error"));

            await expect(authService.logout(refreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if refresh token does not exist", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.listRefreshTokensByUserId.mockResolvedValue([]);

            await expect(authService.logout(refreshToken))
                .rejects.toThrow("NOT_FOUND");
        });


        it("should throw error an error if no hash matches", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.listRefreshTokensByUserId.mockResolvedValue([
                {token: "hash-token-123"},
                {token: "hash-token-456"}
            ]);
            hashService.compare.mockResolvedValueOnce(false);
            hashService.compare.mockResolvedValueOnce(false);
            
            await expect(authService.logout(refreshToken))
                .rejects.toThrow("NOT_FOUND");
        });

        it("should logout successfully", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.listRefreshTokensByUserId.mockResolvedValue([
                {token: "hash-token-123"},
                {token: "hash-token-456"}
            ]);
            hashService.compare.mockResolvedValueOnce(false);
            hashService.compare.mockResolvedValueOnce(true);
            tokenService.revokeRefreshToken.mockResolvedValue(1); // knex returns number of rows deleted

            await expect(authService.logout(refreshToken))
                .resolves.toBe(1);

            expect(jwtService.decodeRefreshToken).toHaveBeenCalledWith(refreshToken);
            expect(tokenService.listRefreshTokensByUserId).toHaveBeenCalledWith(decodedToken.id);
            expect(hashService.compare).toHaveBeenCalledWith(refreshToken, "hash-token-123");
            expect(hashService.compare).toHaveBeenCalledWith(refreshToken, "hash-token-456");
            expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith("hash-token-456");
        });
    });

    describe("logoutAll", () => {
        const refreshToken = "valid-refresh-token";
        const decodedToken = { id: "uuid-123", exp: Math.floor(Date.now() / 1000) + (60 * 60) };

        it("should throw error if fail to decode refresh token", async () => {
            jwtService.decodeRefreshToken.mockImplementation(() => {
                throw new Error("fake error");
            });

            await expect(authService.logoutAll(refreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if fail in tokenService.listRefreshTokensByUserId", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.listRefreshTokensByUserId.mockRejectedValue(new Error("fake error"));

            await expect(authService.logoutAll(refreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if refresh token does not exist", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.listRefreshTokensByUserId.mockResolvedValue([]);

            await expect(authService.logoutAll(refreshToken))
                .rejects.toThrow("NOT_FOUND");
        });


        it("should throw error an error if no hash matches", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.listRefreshTokensByUserId.mockResolvedValue([
                {token: "hash-token-123"},
                {token: "hash-token-456"}
            ]);
            hashService.compare.mockResolvedValueOnce(false);
            hashService.compare.mockResolvedValueOnce(false);
            
            await expect(authService.logoutAll(refreshToken))
                .rejects.toThrow("NOT_FOUND");
        });

        it("should logoutAll successfully", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.listRefreshTokensByUserId.mockResolvedValue([
                {token: "hash-token-123"},
                {token: "hash-token-456"}
            ]);
            hashService.compare.mockResolvedValueOnce(false);
            hashService.compare.mockResolvedValueOnce(true);
            tokenService.revokeAllRefreshTokensByUserId.mockResolvedValue(2); // knex returns number of rows deleted

            await expect(authService.logoutAll(refreshToken))
                .resolves.toBe(2);

            expect(jwtService.decodeRefreshToken).toHaveBeenCalledWith(refreshToken);
            expect(tokenService.listRefreshTokensByUserId).toHaveBeenCalledWith(decodedToken.id);
            expect(hashService.compare).toHaveBeenCalledWith(refreshToken, "hash-token-123");
            expect(hashService.compare).toHaveBeenCalledWith(refreshToken, "hash-token-456");
            expect(tokenService.revokeAllRefreshTokensByUserId).toHaveBeenCalledWith(decodedToken.id);
        });
    });
});