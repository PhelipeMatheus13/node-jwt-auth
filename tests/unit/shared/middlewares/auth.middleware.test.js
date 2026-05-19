const checkToken = require("../../../../src/shared/middlewares/auth.middleware");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken");

describe("Auth Middleware (Unit)", () => {
    let req, res, next;
    const originalEnv = process.env;

    beforeAll(() => {
        process.env = {
            ...originalEnv,
            SECRET: "secret",
            REFRESH_SECRET: "refresh",
        };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    beforeEach(() => {
        req = { headers: {} };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    it("should call next with unauthorized error if no token provided", () => {
        checkToken(req, res, next);
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 401,
                code: "UNAUTHORIZED",
                message: "Access denied",
            })
        );
    });

    it("should call next with unauthorized if token is expired", () => {
        req.headers.authorization = "Bearer expired.token";
        const err = new Error("expired");
        err.name = "TokenExpiredError";
        jwt.verify.mockImplementation(() => { throw err; });

        checkToken(req, res, next);
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 401,
                code: "TOKEN_EXPIRED",
                message: "Invalid expired",
            })
        );
    });

    it("should call next with unauthorized if token is invalid", () => {
        req.headers.authorization = "Bearer invalid.token";
        jwt.verify.mockImplementation(() => { throw new Error("invalid signature"); });

        checkToken(req, res, next);
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 401,
                code: "INVALID_TOKEN",
                message: "Invalid token",
            })
        );
    });

    it("should call next without arguments when token is valid", () => {
        req.headers.authorization = "Bearer valid.token";
        jwt.verify.mockReturnValue({ id: "user-uuid" });

        checkToken(req, res, next);
        expect(next).toHaveBeenCalledWith(); // sem erro
    });

    it("should extract token correctly", () => {
        req.headers.authorization = "Bearer abc.def.ghi";
        jwt.verify.mockReturnValue({ id: "uuid" });

        checkToken(req, res, next);
        expect(jwt.verify).toHaveBeenCalledWith("abc.def.ghi", "secret");
        expect(next).toHaveBeenCalledWith();
    });
});