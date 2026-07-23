const jwtService = require("../../../../src/shared/services/jwt.service");
const jwt = require("jsonwebtoken");
const logger = require("../../../../src/shared/utils/logger");

jest.mock("jsonwebtoken");

jest.mock("../../../../src/shared/utils/logger", () => ({
    warn: jest.fn(),
    error: jest.fn(),
}));

describe("JWT Service (Unit)", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, SECRET: "secret", REFRESH_SECRET: "refresh" };
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    describe("generateAccessToken", () => {
        it("should generate access token using SECRET and expiration of 15m", () => {
            jwt.sign.mockReturnValue("access-token");
            const token = jwtService.generateAccessToken("user-123", "admin");
            expect(token).toBe("access-token");
            expect(jwt.sign).toHaveBeenCalledWith({ id: "user-123", role: "admin" }, "secret", { expiresIn: "15m" });
        });
    });

    describe("generateRefreshToken", () => {
        it("should generate refresh token using REFRESH_SECRET and expiration of 7d", () => {
            jwt.sign.mockReturnValue("refresh-token");
            const token = jwtService.generateRefreshToken("user-123", "admin", "jti-uuid-123");
            expect(token).toBe("refresh-token");
            expect(jwt.sign).toHaveBeenCalledWith({ id: "user-123", role: "admin", jti: "jti-uuid-123" }, "refresh", { expiresIn: "7d" });
        });

        it("should fallback to SECRET when REFRESH_SECRET is not set", () => {
            delete process.env.REFRESH_SECRET;
            jwt.sign.mockReturnValue("fallback-token");
            const token = jwtService.generateRefreshToken("user-123", "admin", "jti-uuid-123");
            expect(token).toBe("fallback-token");
            expect(jwt.sign).toHaveBeenCalledWith({ id: "user-123", role: "admin", jti: "jti-uuid-123" }, "secret", { expiresIn: "7d" });
        });
    });

    describe("decodeAccessToken", () => {
        it("should decode a valid token", () => {
            jwt.verify.mockReturnValue({ id: "user-123", role: "admin", iat: 123, exp: 456 });
            const decoded = jwtService.decodeAccessToken("valid-token");
            expect(decoded).toEqual({ id: "user-123", role: "admin", iat: 123, exp: 456 });
            expect(jwt.verify).toHaveBeenCalledWith("valid-token", "secret");
        });

        it("should throw ACCESS_TOKEN_EXPIRED error when token is expired", () => {
            const expiredError = new Error("jwt expired");
            expiredError.name = "TokenExpiredError";
            jwt.verify.mockImplementation(() => { throw expiredError; });

            expect(() => jwtService.decodeAccessToken("expired-token"))
                .toThrow(
                    expect.objectContaining({
                        statusCode: 401,
                        code: "ACCESS_TOKEN_EXPIRED",
                        message: "Access token expired",
                    })
                );
        });

        it("should log a warning and throw INVALID_TOKEN for a known jwt library error", () => {
            const jwtError = new Error("invalid signature");
            jwtError.name = "JsonWebTokenError";
            jwt.verify.mockImplementation(() => { throw jwtError; });


            expect(() => jwtService.decodeAccessToken("bad-token"))
                .toThrow(
                    expect.objectContaining({
                        statusCode: 401,
                        code: "INVALID_TOKEN",
                        message: "Invalid access token",
                    })
                );

            expect(logger.warn).toHaveBeenCalledWith({ err: jwtError }, "Invalid access token");
        });


        it("should log an error and throw INVALID_TOKEN for an unexpected error", () => {
            const unexpectedError = new Error("unexpected error");
            jwt.verify.mockImplementation(() => { throw unexpectedError; });


            expect(() => jwtService.decodeAccessToken("bad-token"))
                .toThrow(
                    expect.objectContaining({
                        statusCode: 401,
                        code: "INVALID_TOKEN",
                        message: "Invalid access token",
                    })
                );

            expect(logger.error).toHaveBeenCalledWith({ err: unexpectedError }, "Unexpected error while verifying access token");
        });
    });

    describe("decodeRefreshToken", () => {
        it("should decode a valid token", () => {
            jwt.verify.mockReturnValue({ id: "user-123", role: "admin", iat: 123, exp: 456 });
            const decoded = jwtService.decodeRefreshToken("valid-token");
            expect(decoded).toEqual({ id: "user-123", role: "admin", iat: 123, exp: 456 });
            expect(jwt.verify).toHaveBeenCalledWith("valid-token", "refresh");
        });

        it("should throw REFRESH_TOKEN_EXPIRED error when token is expired", () => {
            const expiredError = new Error("jwt expired");
            expiredError.name = "TokenExpiredError";
            jwt.verify.mockImplementation(() => { throw expiredError; });

            expect(() => jwtService.decodeRefreshToken("expired-token"))
                .toThrow(
                    expect.objectContaining({
                        statusCode: 401,
                        code: "REFRESH_TOKEN_EXPIRED",
                        message: "Refresh token expired",
                    })
                );
        });

        it("should log a warning and throw INVALID_TOKEN for a known jwt library error", () => {
            const jwtError = new Error("invalid signature");
            jwtError.name = "JsonWebTokenError";
            jwt.verify.mockImplementation(() => { throw jwtError; });


            expect(() => jwtService.decodeRefreshToken("bad-token"))
                .toThrow(
                    expect.objectContaining({
                        statusCode: 401,
                        code: "INVALID_TOKEN",
                        message: "Invalid refresh token",
                    })
                );

            expect(logger.warn).toHaveBeenCalledWith({ err: jwtError }, "Invalid refresh token");
        });


        it("should log an error and throw INVALID_TOKEN for an unexpected error", () => {
            const unexpectedError = new Error("unexpected error");
            jwt.verify.mockImplementation(() => { throw unexpectedError; });


            expect(() => jwtService.decodeRefreshToken("bad-token"))
                .toThrow(
                    expect.objectContaining({
                        statusCode: 401,
                        code: "INVALID_TOKEN",
                        message: "Invalid refresh token",
                    })
                );

            expect(logger.error).toHaveBeenCalledWith({ err: unexpectedError }, "Unexpected error while verifying refresh token");
        });

        it("should fallback to SECRET when REFRESH_SECRET is not set", () => {
            delete process.env.REFRESH_SECRET;
            jwt.verify.mockReturnValue({ id: "user-123", role: "admin", iat: 123, exp: 456 });
            const decoded = jwtService.decodeRefreshToken("valid-token");
            expect(decoded).toEqual({ id: "user-123", role: "admin", iat: 123, exp: 456 });
            expect(jwt.verify).toHaveBeenCalledWith("valid-token", "secret");
        });
    });
});