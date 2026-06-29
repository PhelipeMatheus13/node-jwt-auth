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
        const userData = { 
            id: "uuid-123", 
            email: "test@example.com", 
            password: "hashedPassword", 
            role: "user" 
        };

        const decodedRefreshToken = { 
            id: "uuid-123", 
            role: "user",
            jti: "jti-uuid-123", 
            exp: Math.floor(Date.now() / 1000) + (60 * 60) 
        };

        it("should throw if fail in uuserService.findUserByEmail", async () => {
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

        it("should throw if fail in hashService.compare", async () => {
            userService.findUserByEmail.mockResolvedValue(userData);
            hashService.compare.mockRejectedValue(new Error("fake error"));

            await expect(authService.login("test@example.com", "testPassword@123"))
                .rejects.toThrow("fake error");
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

        it("should throw if fail in jwtService.generateAccessToken", async () => {
            userService.findUserByEmail.mockResolvedValue(userData);
            hashService.compare.mockResolvedValue(true);
            jwtService.generateAccessToken.mockImplementation(() => {
                throw new Error("fake error");
            });

            await expect(authService.login("test@example.com", "testPassword@123"))
                .rejects.toThrow("fake error");
        });

        it("should throw if fail in jwtService.generateRefreshToken", async () => {
            userService.findUserByEmail.mockResolvedValue(userData);
            hashService.compare.mockResolvedValue(true);
            jwtService.generateAccessToken.mockResolvedValue("access-token");
            jwtService.generateRefreshToken.mockImplementation(() => {
                throw new Error("fake error");
            });

            await expect(authService.login("test@example.com", "testPassword@123"))
                .rejects.toThrow("fake error");
        });


        it("should throw if fail in jwtService.decodeRefreshToken", async () => {
            userService.findUserByEmail.mockResolvedValue(userData);
            hashService.compare.mockResolvedValue(true);
            jwtService.generateAccessToken.mockResolvedValue("access-token");
            jwtService.generateRefreshToken.mockResolvedValue("refresh-token");
            jwtService.decodeRefreshToken.mockImplementation(() => {
                throw new Error("fake error");
            });

            await expect(authService.login("test@example.com", "testPassword@123"))
                .rejects.toThrow("fake error");
        });

        it("should throw if fail in hashService.hash", async () => {
            userService.findUserByEmail.mockResolvedValue(userData);
            hashService.compare.mockResolvedValue(true);
            jwtService.generateAccessToken.mockResolvedValue("access-token");
            jwtService.generateRefreshToken.mockResolvedValue("refresh-token");
            jwtService.decodeRefreshToken.mockResolvedValue(decodedRefreshToken);
            hashService.hash.mockRejectedValue(new Error("fake error"));

            await expect(authService.login("test@example.com", "testPassword@123"))
                .rejects.toThrow("fake error");
        });

        it("should throw if fail in tokenService.saveRefreshToken", async () => {
            userService.findUserByEmail.mockResolvedValue(userData);
            hashService.compare.mockResolvedValue(true);
            jwtService.generateAccessToken.mockReturnValue("access-token");
            jwtService.generateRefreshToken.mockReturnValue("refresh-token");
            jwtService.decodeRefreshToken.mockReturnValue(decodedRefreshToken);
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
            jwtService.decodeRefreshToken.mockReturnValue(decodedRefreshToken);
            hashService.hash.mockReturnValue("hashedToken");
            tokenService.saveRefreshToken.mockResolvedValue("token-id-123");

            const result = await authService.login("test@example.com", "testPassword@123");

            expect(jwtService.generateAccessToken).toHaveBeenCalledWith("uuid-123", "user");
            expect(jwtService.generateRefreshToken).toHaveBeenCalledWith("uuid-123", "user", expect.any(String));
            expect(jwtService.decodeRefreshToken).toHaveBeenCalledWith("refresh-token");
            expect(hashService.hash).toHaveBeenCalledWith("refresh-token");
            expect(tokenService.saveRefreshToken).toHaveBeenCalledWith({
                tokenHash: "hashedToken",
                userId: "uuid-123",
                jti: expect.any(String),
                expiresAt: new Date(decodedRefreshToken.exp * 1000)
            });

            expect(result.accessToken).toBe("access-token");
            expect(result.refreshToken).toBe("refresh-token");
        });
    });

    describe("rotateTokens", () => {
        const oldRefreshToken = "valid-refresh-token";

        const tokenData = {
            id: "token-uuid-123",
            token_hash: "hashed-refresh-token",
            user_id: "uuid-123",
            jti: "jti-uuid-123",
            revoked_at: null
        };

        const decodedOldRefreshToken = { 
            id: "uuid-123", 
            role: "user", 
            jti: "jti-uuid-123",
            exp: Math.floor(Date.now() / 1000) + (60 * 60) 
        };

        const decodedNewRefreshToken = { 
            id: "uuid-123", 
            role: "user", 
            jti: "jti-uuid-456",
            exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60) 
        };

        it("should throw error if fail to decode refresh token", async () => {
            jwtService.decodeRefreshToken.mockImplementation(() => {
                throw new Error("fake error");
            });

            await expect(authService.rotateTokens("expired-refresh-token"))
                .rejects.toThrow("fake error");
        });

        it("should throw error if fail in tokenService.findRefreshTokenByJti", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedOldRefreshToken);
            tokenService.findRefreshTokenByJti.mockRejectedValue(new Error("fake error"));

            await expect(authService.rotateTokens(oldRefreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if tokenService.findRefreshTokenByJti return empty", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedOldRefreshToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(undefined); 

            await expect(authService.rotateTokens(oldRefreshToken))
                .rejects.toMatchObject({
                    statusCode: 401,
                    code: "TOKEN_NOT_FOUND",
                    message: "Refresh token not found",
                });
        });

        it("should throw error if fail in hashService.compare", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedOldRefreshToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData); 
            hashService.compare.mockRejectedValue(new Error("fake error"));

            await expect(authService.rotateTokens(oldRefreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error an error if token not match with any stored token hash", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedOldRefreshToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockResolvedValue(false);

            await expect(authService.rotateTokens(oldRefreshToken))
                .rejects.toMatchObject({
                    statusCode: 401,
                    code: "INVALID_TOKEN",
                    message: "Invalid refresh token",
                });
        });

        it("should throw error if fail in tokenService.revokeAllRefreshTokensByUserId", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedOldRefreshToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue({
                token_hash: "hashed-refresh-token",
                user_id: "uuid-123",
                jti: "jti-uuid-123",
                revoked_at: new Date() // Simulate that the token has been revoked
            });
            hashService.compare.mockResolvedValue(true); 
            tokenService.revokeAllRefreshTokensByUserId.mockRejectedValue(new Error("fake error"));

            await expect(authService.rotateTokens(oldRefreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if token reuse is detected", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedOldRefreshToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue({
                token_hash: "hashed-refresh-token",
                user_id: "uuid-123",
                jti: "jti-uuid-123",
                revoked_at: new Date() // Simulate that the token has been revoked
            });
            hashService.compare.mockResolvedValue(true); 
            tokenService.revokeAllRefreshTokensByUserId.mockReturnValue(1);

            await expect(authService.rotateTokens(oldRefreshToken))
                .rejects.toMatchObject({
                    statusCode: 401,
                    code: "TOKEN_REUSE_DETECTED",
                    message: "Refresh token reuse detected",
                });
        });

        it("should throw error if fail in jwtService.generateAccessToken", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedOldRefreshToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockResolvedValue(true); 
            jwtService.generateAccessToken.mockImplementation(() => {
                throw new Error("fake error");
            });

            await expect(authService.rotateTokens(oldRefreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if fail in jwtService.generateRefreshToken", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedOldRefreshToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockResolvedValue(true); 
            jwtService.generateAccessToken.mockReturnValue("new-access-token");
            jwtService.generateRefreshToken.mockImplementation(() => {
                throw new Error("fake error");
            });

            await expect(authService.rotateTokens(oldRefreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if fail in hashService.hash", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedOldRefreshToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockResolvedValue(true); 
            jwtService.generateAccessToken.mockReturnValue("new-access-token");
            jwtService.generateRefreshToken.mockReturnValue("new-refresh-token");
            jwtService.decodeRefreshToken.mockReturnValue(decodedNewRefreshToken);
            hashService.hash.mockRejectedValue(new Error("fake error"));

            await expect(authService.rotateTokens(oldRefreshToken)) 
                .rejects.toThrow("fake error");
        });

        it("should throw error if fail in transaction tokenService.revokeRefreshTokenById", async () => {
            // Mocking the transaction behavior of Knex
            const trx = {};
            getKnex.mockReturnValue({
                transaction: jest.fn(async (callback) => callback(trx))
            });

            jwtService.decodeRefreshToken.mockReturnValue(decodedOldRefreshToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockResolvedValueOnce(true);
            jwtService.generateAccessToken.mockReturnValue("new-access-token");
            jwtService.generateRefreshToken.mockReturnValue("new-refresh-token");
            jwtService.decodeRefreshToken.mockReturnValueOnce(decodedNewRefreshToken);
            hashService.hash.mockReturnValue("new-hash-token");
            // in transaction
            tokenService.revokeRefreshTokenById.mockRejectedValue(new Error("fake error"));

            await expect(authService.rotateTokens(oldRefreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if tokenService.revokeRefreshTokenById return 0 rows updated", async () => {
            // Mocking the transaction behavior of Knex
            const trx = {};
            getKnex.mockReturnValue({
                transaction: jest.fn(async (callback) => callback(trx))
            });

            jwtService.decodeRefreshToken.mockReturnValue(decodedOldRefreshToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockResolvedValueOnce(true);
            jwtService.generateAccessToken.mockReturnValue("new-access-token");
            jwtService.generateRefreshToken.mockReturnValue("new-refresh-token");
            jwtService.decodeRefreshToken.mockReturnValueOnce(decodedNewRefreshToken);
            hashService.hash.mockReturnValue("new-hash-token");
            // in transaction
            tokenService.revokeRefreshTokenById.mockReturnValue(0); // Simulate that no rows were updated

            await expect(authService.rotateTokens(oldRefreshToken))
                .rejects.toMatchObject({
                    statusCode: 401,
                    code: "TOKEN_REUSE_DETECTED",
                    message: "Refresh token reuse detected",
                });
        });

        it("should throw error if fail in transaction tokenService.saveRefreshToken", async () => {
            // Mocking the transaction behavior of Knex
            const trx = {};
            getKnex.mockReturnValue({
                transaction: jest.fn(async (callback) => callback(trx))
            });

            jwtService.decodeRefreshToken.mockReturnValue(decodedOldRefreshToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockResolvedValueOnce(true);
            jwtService.generateAccessToken.mockReturnValue("new-access-token");
            jwtService.generateRefreshToken.mockReturnValue("new-refresh-token");
            jwtService.decodeRefreshToken.mockReturnValueOnce(decodedNewRefreshToken);
            hashService.hash.mockReturnValue("new-hash-token");
            // in transaction
            tokenService.revokeRefreshTokenById.mockResolvedValue(1);
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

            jwtService.decodeRefreshToken.mockReturnValueOnce(decodedOldRefreshToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockResolvedValueOnce(true);
            jwtService.generateAccessToken.mockReturnValue("new-access-token");
            jwtService.generateRefreshToken.mockReturnValue("new-refresh-token");
            jwtService.decodeRefreshToken.mockReturnValueOnce(decodedNewRefreshToken);
            hashService.hash.mockReturnValue("new-hash-token");
            // in transaction
            tokenService.revokeRefreshTokenById.mockResolvedValue(1);
            tokenService.saveRefreshToken.mockResolvedValue("token-id");

            const result = await authService.rotateTokens(oldRefreshToken);
            
            expect(jwtService.decodeRefreshToken).toHaveBeenCalledWith(oldRefreshToken);
            expect(tokenService.findRefreshTokenByJti).toHaveBeenCalledWith(decodedOldRefreshToken.jti);
            expect(hashService.compare).toHaveBeenCalledWith(oldRefreshToken, tokenData.token_hash);
            expect(jwtService.generateAccessToken).toHaveBeenCalledWith(decodedOldRefreshToken.id, decodedOldRefreshToken.role);
            expect(jwtService.generateRefreshToken).toHaveBeenCalledWith(
                decodedOldRefreshToken.id,
                decodedOldRefreshToken.role, 
                expect.any(String) // jti is generated randomly, so we can't assert its exact value
            );
            expect(jwtService.decodeRefreshToken).toHaveBeenCalledWith("new-refresh-token");
            expect(hashService.hash).toHaveBeenCalledWith("new-refresh-token");
            expect(tokenService.revokeRefreshTokenById).toHaveBeenCalledWith(tokenData.id, trx);
            expect(tokenService.saveRefreshToken).toHaveBeenCalledWith({
                tokenHash: "new-hash-token",
                userId: decodedNewRefreshToken.id,
                jti: decodedNewRefreshToken.jti,
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
        const decodedToken = { 
            id: "uuid-123", 
            role: "user", 
            jti: "jti-uuid-123",
            exp: Math.floor(Date.now() / 1000) + (60 * 60) 
        };

        const tokenData = {
            id: "token-uuid-123",
            token_hash: "hashed-refresh-token",
            user_id: "uuid-123",
            jti: "jti-uuid-123",
            revoked_at: null
        };

        it("should throw error if fail in jwtService.decodeRefreshToken", async () => {
            jwtService.decodeRefreshToken.mockImplementation(() => {
                throw new Error("fake error");
            });

            await expect(authService.logout("expired-refresh-token"))
                .rejects.toThrow("fake error");
        });

        it("should throw error if fail in tokenService.findRefreshTokenByJti", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.findRefreshTokenByJti.mockRejectedValue(new Error("fake error"));

            await expect(authService.logout(refreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if refresh token does not exist", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(undefined);

            await expect(authService.logout(refreshToken))
                .rejects.toMatchObject({
                    statusCode: 401,
                    code: "TOKEN_NOT_FOUND",
                    message: "Refresh token not found",
                });
        });

        it("should throw error if fail in hashService.compare", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockRejectedValue(new Error("fake error"));

            await expect(authService.logout(refreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error an error if no hash matches", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockResolvedValueOnce(false);
            
            await expect(authService.logout(refreshToken))
                .rejects.toMatchObject({
                    statusCode: 401,
                    code: "INVALID_TOKEN",
                    message: "Invalid refresh token",
                });
        });

        it("should return if token is already revoked", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue({
                token_hash: "hashed-refresh-token",
                user_id: "uuid-123",
                jti: "jti-uuid-123",
                revoked_at: new Date() // Simulate that the token has been revoked
            });
            hashService.compare.mockResolvedValueOnce(true);
            
            await expect(authService.logout(refreshToken));
        });

        it("should throw error if fail in tokenService.revokeRefreshTokenById", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockResolvedValueOnce(true);
            tokenService.revokeRefreshTokenById.mockRejectedValue(new Error("fake error"));
 
            await expect(authService.logout(refreshToken))
                .rejects.toThrow("fake error");
        });

        it("should logout successfully", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockResolvedValueOnce(true);
            tokenService.revokeRefreshTokenById.mockResolvedValue(1); // knex returns number of rows deleted

            await expect(authService.logout(refreshToken))
                .resolves.toBe(1);

            expect(jwtService.decodeRefreshToken).toHaveBeenCalledWith(refreshToken);
            expect(tokenService.findRefreshTokenByJti).toHaveBeenCalledWith(decodedToken.jti);
            expect(hashService.compare).toHaveBeenCalledWith(refreshToken, tokenData.token_hash);
            expect(tokenService.revokeRefreshTokenById).toHaveBeenCalledWith(tokenData.id);
        });
    });

    describe("logoutAll", () => {
        const refreshToken = "valid-refresh-token";
        const decodedToken = { 
            id: "uuid-123", 
            role: "user", 
            jti: "jti-uuid-123",
            exp: Math.floor(Date.now() / 1000) + (60 * 60) 
        };

        const tokenData = {
            id: "token-uuid-123",
            token_hash: "hashed-refresh-token",
            user_id: "uuid-123",
            jti: "jti-uuid-123",
            revoked_at: null
        };

        it("should throw error if fail in jwtService.decodeRefreshToken", async () => {
            jwtService.decodeRefreshToken.mockImplementation(() => {
                throw new Error("fake error");
            });

            await expect(authService.logoutAll(refreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if fail in tokenService.findRefreshTokenByJti", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.findRefreshTokenByJti.mockRejectedValue(new Error("fake error"));

            await expect(authService.logoutAll(refreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error if refresh token does not exist", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(undefined);

            await expect(authService.logoutAll(refreshToken))
                .rejects.toMatchObject({
                    statusCode: 401,
                    code: "TOKEN_NOT_FOUND",
                    message: "Refresh token not found",
                });
        });

        it("should throw error if fail in hashService.compare", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockRejectedValue(new Error("fake error"));

            await expect(authService.logoutAll(refreshToken))
                .rejects.toThrow("fake error");
        });

        it("should throw error an error if no hash match", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockResolvedValueOnce(false);
            
            await expect(authService.logoutAll(refreshToken))
                .rejects.toMatchObject({
                    statusCode: 401,
                    code: "INVALID_TOKEN",
                    message: "Invalid refresh token",
                });
        });

        it("should throw error if fail in tokenService.revokeAllRefreshTokensByUserId", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockResolvedValueOnce(true);
            tokenService.revokeAllRefreshTokensByUserId.mockRejectedValue(new Error("fake error"));

            await expect(authService.logoutAll(refreshToken))
                .rejects.toThrow("fake error");
        });

        it("should logoutAll successfully", async () => {
            jwtService.decodeRefreshToken.mockReturnValue(decodedToken);
            tokenService.findRefreshTokenByJti.mockResolvedValue(tokenData);
            hashService.compare.mockResolvedValueOnce(true);
            tokenService.revokeAllRefreshTokensByUserId.mockResolvedValue(2); // knex returns number of rows deleted

            await expect(authService.logoutAll(refreshToken))
                .resolves.toBe(2);

            expect(jwtService.decodeRefreshToken).toHaveBeenCalledWith(refreshToken);
            expect(tokenService.findRefreshTokenByJti).toHaveBeenCalledWith(decodedToken.jti);
            expect(hashService.compare).toHaveBeenCalledWith(refreshToken, tokenData.token_hash);
            expect(tokenService.revokeAllRefreshTokensByUserId).toHaveBeenCalledWith(tokenData.user_id);
        });
    });
});