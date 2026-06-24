const authService = require("../../../../src/modules/auth/auth.service");

const hashService = require("../../../../src/shared/services/hash.service");
const userService = require("../../../../src/modules/user/user.service");
const jwtService = require("../../../../src/shared/services/jwt.service");
const tokenService = require("../../../../src/modules/token/token.service");
const { getKnex } = require("../../../../src/shared/config/database")

jest.mock("../../../../src/shared/services/hash.service");
jest.mock("../../../../src/modules/user/user.service"); 
jest.mock("../../../../src/shared/services/jwt.service");
jest.mock("../../../../src/modules/token/token.service");
jest.mock("../../../../src/shared/config/database");


describe("Auth Service (Unit)", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("login", () => {
        const userData = { id: "uuid-123", email: "test@example.com", password: "hashedPassword", role: "user" };
        const decodedToken = { id: "uuid-123", role: "user", exp: Math.floor(Date.now() / 1000) + (60 * 60) };

        it("should throw if fail in user retrieval", async () => {
            userService.findUserByEmail.mockRejectedValue(new Error("fake error"));

            await expect(authService.login("test@example.com", "testPassword@123"))
                .rejects.toThrow("fake error");
        });

        it("should throw if user does not exist", async () => {
            userService.findUserByEmail.mockResolvedValue(undefined); // knex return undefined

            await expect(authService.login("test@example.com", "testPassword@123"))
                .rejects.toMatchObject({
                    statusCode: 401,
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid email or password",
                });
        });


        it("should throw if password does not match", async () => {
            userService.findUserByEmail.mockResolvedValue(userData);
            hashService.compare.mockResolvedValue(false);

            await expect(authService.login("test@example.com", "wrongPassword"))
                .rejects.toMatchObject({
                    statusCode: 401,
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid email or password",
                });
        });

        it("should throw if fail in save refresh token", async () => {
            userService.findUserByEmail.mockResolvedValue(userData);
            hashService.compare.mockResolvedValue(true);
            jwtService.generateAccessToken.mockReturnValue("access-token");
            jwtService.generateRefreshToken.mockReturnValue("refresh-token");
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            hashService.hash.mockReturnValue("hashedToken");
            tokenService.saveRefreshToken.mockRejectedValue(new Error("fake error"));

            await expect(authService.login("test@example.com", "testPassword@123"))
                .rejects.toThrow("fake error");
        });   
        
        it("should login successfully", async () => {
            userService.findUserByEmail.mockResolvedValue(userData);
            hashService.compare.mockResolvedValue(true);
            jwtService.generateAccessToken.mockReturnValue("access-token");
            jwtService.generateRefreshToken.mockReturnValue("refresh-token");
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            hashService.hash.mockReturnValue("hashedToken");
            tokenService.saveRefreshToken.mockResolvedValue("token-id-123");


            const result = await authService.login("test@example.com", "testPassword@123");

            expect(jwtService.generateAccessToken).toHaveBeenCalledWith("uuid-123", "user");
            expect(jwtService.generateRefreshToken).toHaveBeenCalledWith("uuid-123", "user");
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

    describe("rotateTokens", () => {
        const oldRefreshToken = "valid-refresh-token";
        const decodedRefreshToken = { id: "uuid-123", role: "user", exp: Math.floor(Date.now() / 1000) + (60 * 60) };
        const decodedNewRefreshToken = { id: "uuid-123", role: "user", exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60) };

        it("should throw error if fail to decode refresh token", async () => {
            jwtService.decodeRefreshToken.mockImplementation(() => {
                throw new Error("fake error");
            });

            await expect(authService.rotateTokens("expired-refresh-token"))
                .rejects.toThrow("fake error");
        });

        it("should throw error if fail in tokenService.listRefreshTokensByUserId", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedRefreshToken);
            tokenService.listRefreshTokensByUserId.mockRejectedValue(new Error("fake error"));

            await expect(authService.rotateTokens(oldRefreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if tokenService.listRefreshTokensByUserId return empty", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedRefreshToken);
            tokenService.listRefreshTokensByUserId.mockResolvedValue([]);

            await expect(authService.rotateTokens(oldRefreshToken))
                .rejects.toMatchObject({
                    statusCode: 404,
                    code: "TOKEN_NOT_FOUND",
                    message: "Refresh token not found",
                });
        });

        it("should throw error an error if no hash matches", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedRefreshToken);
            tokenService.listRefreshTokensByUserId.mockResolvedValue([
                {token: "hash-token-123"},
                {token: "hash-token-456"}
            ]);
            hashService.compare.mockResolvedValueOnce(false); // first call
            hashService.compare.mockResolvedValueOnce(false); // second call
            
            await expect(authService.rotateTokens(oldRefreshToken))
                .rejects.toMatchObject({
                    statusCode: 404,
                    code: "TOKEN_NOT_FOUND",
                    message: "Refresh token not found",
                });
        });

        it("should throw error if fail in transaction tokenService.revokeRefreshToken", async () => {
            // Mocking the transaction behavior of Knex
            const trx = {};
            getKnex.mockReturnValue({
                transaction: jest.fn(async (callback) => callback(trx))
            });

            jwtService.decodeRefreshToken.mockReturnValue(decodedRefreshToken);
            tokenService.listRefreshTokensByUserId.mockResolvedValue([
                {token: "hash-token-123"},
                {token: "hash-token-456"}
            ]);
            hashService.compare.mockResolvedValueOnce(false); // first call
            hashService.compare.mockResolvedValueOnce(true);  // second call
            jwtService.generateAccessToken.mockReturnValue("new-access-token");
            jwtService.generateRefreshToken.mockReturnValue("new-refresh-token");
            jwtService.decodeRefreshToken.mockReturnValueOnce(decodedNewRefreshToken);
            hashService.hash.mockReturnValue("new-hash-token");
            // in transaction
            tokenService.revokeRefreshToken.mockRejectedValue(new Error("fake error"));

            await expect(authService.rotateTokens(oldRefreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if fail in transaction tokenService.saveRefreshToken", async () => {
            // Mocking the transaction behavior of Knex
            const trx = {};
            getKnex.mockReturnValue({
                transaction: jest.fn(async (callback) => callback(trx))
            });

            jwtService.decodeRefreshToken.mockReturnValue(decodedRefreshToken);
            tokenService.listRefreshTokensByUserId.mockResolvedValue([
                {token: "hash-token-123"},
                {token: "hash-token-456"}
            ]);
            hashService.compare.mockResolvedValueOnce(false); // first call
            hashService.compare.mockResolvedValueOnce(true);  // second call
            jwtService.generateAccessToken.mockReturnValue("new-access-token");
            jwtService.generateRefreshToken.mockReturnValue("new-refresh-token");
            jwtService.decodeRefreshToken.mockReturnValueOnce(decodedNewRefreshToken);
            hashService.hash.mockReturnValue("new-hash-token");
            // in transaction
            tokenService.revokeRefreshToken.mockResolvedValue(1);
            tokenService.saveRefreshToken.mockRejectedValue(new Error("fake error"));

            await expect(authService.rotateTokens(oldRefreshToken))
                .rejects.toThrow("fake error");
        });

        it("should refresh access token successfully", async () => {
            // Mocking the transaction behavior of Knex
            const trx = {};
            getKnex.mockReturnValue({
                transaction: jest.fn(async (callback) => callback(trx))
            });


            jwtService.decodeRefreshToken.mockReturnValueOnce(decodedRefreshToken);
            tokenService.listRefreshTokensByUserId.mockResolvedValue([
                {token: "hash-token-123"},
                {token: "hash-token-456"}
            ]);
            hashService.compare.mockResolvedValueOnce(false); // first call
            hashService.compare.mockResolvedValueOnce(true);  // second call
            jwtService.generateAccessToken.mockReturnValue("new-access-token");
            jwtService.generateRefreshToken.mockReturnValue("new-refresh-token");
            jwtService.decodeRefreshToken.mockReturnValueOnce(decodedNewRefreshToken);
            hashService.hash.mockReturnValue("new-hash-token");
            // in transaction
            tokenService.revokeRefreshToken.mockResolvedValue(1);
            tokenService.saveRefreshToken.mockResolvedValue("token-id");

            const result = await authService.rotateTokens(oldRefreshToken);
            
            expect(jwtService.decodeRefreshToken).toHaveBeenCalledWith(oldRefreshToken);
            expect(tokenService.listRefreshTokensByUserId).toHaveBeenCalledWith(decodedRefreshToken.id);
            expect(hashService.compare).toHaveBeenCalledWith(oldRefreshToken, "hash-token-123");
            expect(hashService.compare).toHaveBeenCalledWith(oldRefreshToken, "hash-token-456");
            expect(jwtService.generateAccessToken).toHaveBeenCalledWith(decodedRefreshToken.id, decodedRefreshToken.role);
            expect(jwtService.generateRefreshToken).toHaveBeenCalledWith(decodedRefreshToken.id, decodedRefreshToken.role);
            expect(jwtService.decodeRefreshToken).toHaveBeenCalledWith("new-refresh-token");
            expect(hashService.hash).toHaveBeenCalledWith("new-refresh-token");
            expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith("hash-token-456", trx);
            expect(tokenService.saveRefreshToken).toHaveBeenCalledWith({
                token: "new-hash-token",
                userId: decodedRefreshToken.id,
                expiresAt: new Date(decodedNewRefreshToken.exp * 1000)
            }, trx);

            expect(result).toEqual({
                accessToken: "new-access-token",
                refreshToken: "new-refresh-token"
            });
        });
    });

    describe("logout", () => {
        const refreshToken = "valid-refresh-token";
        const decodedToken = { id: "uuid-123", role: "user", exp: Math.floor(Date.now() / 1000) + (60 * 60) };

        it("should throw error if fail to decode refresh token", async () => {
            jwtService.decodeRefreshToken.mockImplementation(() => {
                throw new Error("fake error");
            });

            await expect(authService.logout("expired-refresh-token"))
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
                .rejects.toMatchObject({
                    statusCode: 404,
                    code: "TOKEN_NOT_FOUND",
                    message: "Refresh token not found",
                });
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
                .rejects.toMatchObject({
                    statusCode: 404,
                    code: "TOKEN_NOT_FOUND",
                    message: "Refresh token not found",
                });
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
        const decodedToken = { id: "uuid-123", role: "user", exp: Math.floor(Date.now() / 1000) + (60 * 60) };

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
                .rejects.toMatchObject({
                    statusCode: 404,
                    code: "TOKEN_NOT_FOUND",
                    message: "Refresh token not found",
                });
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
                .rejects.toMatchObject({
                    statusCode: 404,
                    code: "TOKEN_NOT_FOUND",
                    message: "Refresh token not found",
                });
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