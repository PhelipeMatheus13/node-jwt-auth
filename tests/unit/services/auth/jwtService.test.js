jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

const jwtService = require("../../../../services/auth/jwtService");
const jwt = require("jsonwebtoken");

describe("JWT Service (Unit)", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = {
            ...originalEnv,
            SECRET: "secret",
            REFRESH_SECRET: "refresh",
        };
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    describe("generateAccessToken", () => {
        it("should throw an error when jwt.sign fails", () => {
            jwt.sign.mockImplementation(() => {
                throw new Error("sign failed");
            });

            expect(() => jwtService.generateAccessToken("user-123")).toThrow(
                "sign failed"
            );

            expect(jwt.sign).toHaveBeenCalledTimes(1);
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: "user-123" },
                "secret",
                { expiresIn: "15m" }
            );
        });

        it("should generate access token using SECRET and expiration of 15m", () => {
            jwt.sign.mockReturnValue("access-token");

            const token = jwtService.generateAccessToken("user-123");

            expect(token).toBe("access-token");
            expect(jwt.sign).toHaveBeenCalledTimes(1);
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: "user-123" },
                "secret",
                { expiresIn: "15m" }
            );
        });
    });

    describe("generateRefreshToken", () => {
        it("should throw an error when jwt.sign fails", () => {
            jwt.sign.mockImplementation(() => {
                throw new Error("refresh sign failed");
            });

            expect(() => jwtService.generateRefreshToken("user-123")).toThrow(
                "refresh sign failed"
            );

            expect(jwt.sign).toHaveBeenCalledTimes(1);
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: "user-123" },
                "refresh",
                { expiresIn: "7d" }
            );
        });

        it("should generate refresh token using REFRESH_SECRET and expiration of 7d", () => {
            jwt.sign.mockReturnValue("refresh-token");

            const token = jwtService.generateRefreshToken("user-123");

            expect(token).toBe("refresh-token");
            expect(jwt.sign).toHaveBeenCalledTimes(1);
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: "user-123" },
                "refresh",
                { expiresIn: "7d" }
            );
        });

        it("should use SECRET as fallback when REFRESH_SECRET does not exist", () => {
            delete process.env.REFRESH_SECRET;
            jwt.sign.mockReturnValue("refresh-token-fallback");

            const token = jwtService.generateRefreshToken("user-123");

            expect(token).toBe("refresh-token-fallback");
            expect(jwt.sign).toHaveBeenCalledTimes(1);
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: "user-123" },
                "secret",
                { expiresIn: "7d" }
            );
        });
    });

    describe("decodeRefreshToken", () => {
        
        it("should throw 'Refresh token expired' when the error is TokenExpiredError", () => {
            jwt.verify.mockImplementation(() => {
                const err = new Error("jwt expired");
                err.name = "TokenExpiredError";
                throw err;
            });

            expect(() => jwtService.decodeRefreshToken("expired-token")).toThrow(
                "INVALID"
            );

            expect(jwt.verify).toHaveBeenCalledTimes(1);
            expect(jwt.verify).toHaveBeenCalledWith("expired-token", "refresh");
        });

        it("should throw 'Invalid refresh token' for any error different from TokenExpiredError", () => {
            jwt.verify.mockImplementation(() => {
                const err = new Error("not before");
                err.name = "NotBeforeError";
                throw err;
            });

            expect(() => jwtService.decodeRefreshToken("not-ready-token")).toThrow(
                "INVALID"
            );

            expect(jwt.verify).toHaveBeenCalledTimes(1);
            expect(jwt.verify).toHaveBeenCalledWith("not-ready-token", "refresh");
        });

        it("should decode a valid refresh token using REFRESH_SECRET", () => {
            jwt.verify.mockReturnValue({
                id: "user-123",
                iat: 123,
                exp: 456,
            });

            const decoded = jwtService.decodeRefreshToken("valid-token");

            expect(decoded).toEqual({
                id: "user-123",
                iat: 123,
                exp: 456,
            });
            expect(jwt.verify).toHaveBeenCalledTimes(1);
            expect(jwt.verify).toHaveBeenCalledWith("valid-token", "refresh");
        });

        it("should use SECRET as fallback when REFRESH_SECRET does not exist", () => {
            delete process.env.REFRESH_SECRET;

            jwt.verify.mockReturnValue({
                id: "user-123",
            });

            const decoded = jwtService.decodeRefreshToken("valid-token");

            expect(decoded).toEqual({ id: "user-123" });
            expect(jwt.verify).toHaveBeenCalledTimes(1);
            expect(jwt.verify).toHaveBeenCalledWith("valid-token", "secret");
        });
    });
});