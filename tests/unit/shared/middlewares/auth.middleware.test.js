const {checkToken, authorize} = require("../../../../src/shared/middlewares/auth.middleware");
const jwtService = require("../../../../src/shared/services/jwt.service");

jest.mock("../../../../src/shared/services/jwt.service");

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

    describe("checkToken", () => {
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

        it("should pass decode errors to next", () => {
            req.headers.authorization = "Bearer invalid.token";
            const err = new Error("decode failed");

            jwtService.decodeAccessToken.mockImplementation(() => {
                throw err;
            });

            checkToken(req, res, next);
            expect(next).toHaveBeenCalledWith(err);
        });

        it("should extract token correctly", () => {
            req.headers.authorization = "Bearer valid.token";
            jwtService.decodeAccessToken.mockReturnValue({ id: "uuid", role: "user" });

            checkToken(req, res, next);
            expect(jwtService.decodeAccessToken).toHaveBeenCalledWith("valid.token");
            expect(req.user).toEqual({
                id: "uuid",
                role: "user",
            });
            expect(next).toHaveBeenCalledWith();
        });
    });

    describe("authorize", () => {
        it("should call next if user role is allowed", () => {
            const middleware = authorize("admin", "user");
            req.user = { id: "uuid-123", role: "user" };

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith();
        });
        
       it("should throw forbidden if user role is not allowed", () => {
            const middleware = authorize("admin");
            req.user = { id: "uuid-123", role: "user" };

            expect(() => middleware(req, res, next)).toThrow(
                expect.objectContaining({
                    statusCode: 403,
                    code: "FORBIDDEN",
                    message: "Access denied",
                })
            );

            expect(next).not.toHaveBeenCalled();
        });

        it("should throw forbidden if req.user is missing", () => {
            const middleware = authorize("admin");
            req.user = undefined;

            expect(() => middleware(req, res, next)).toThrow(
                expect.objectContaining({
                    statusCode: 403,
                    code: "FORBIDDEN",
                    message: "Access denied",
                })
            );

            expect(next).not.toHaveBeenCalled();
        });
    });
});