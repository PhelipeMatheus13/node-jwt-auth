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
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it("should return 401 if no token provided", () => {
        checkToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: "Access denied" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if token is expired", () => {
        req.headers.authorization = "Bearer expired.token";
        const err = new Error("expired");
        err.name = "TokenExpiredError";
        jwt.verify.mockImplementation(() => { throw err; });

        checkToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: "Invalid expired" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 400 if token is invalid", () => {
        req.headers.authorization = "Bearer invalid.token";
        jwt.verify.mockImplementation(() => { throw new Error("invalid signature"); });

        checkToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ msg: "Invalid token" });
        expect(next).not.toHaveBeenCalled();
    });   

    it("should call next if token is valid", () => {
        req.headers.authorization = "Bearer valid.token";
        jwt.verify.mockReturnValue({ id: "user-uuid" });

        checkToken(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it("should extract token correctly when authorization header has Bearer scheme", () => {
        req.headers.authorization = "Bearer abc.def.ghi";
        jwt.verify.mockReturnValue({ id: "uuid" });

        checkToken(req, res, next);
        expect(jwt.verify).toHaveBeenCalledWith("abc.def.ghi", "secret"); // <-- consistente
        expect(next).toHaveBeenCalled();
    });
});