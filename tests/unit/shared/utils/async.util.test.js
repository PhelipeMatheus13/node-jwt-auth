const asyncHandler = require("../../../../src/shared/utils/async.util");
const { internal } = require("../../../../src/shared/errors/errors");

describe("asyncHandler", () => {
    it("should call next with the error when the wrapped function throws a custom error", async () => {
        const customError = internal({ message: "Something went wrong" });
        const handler = asyncHandler(async () => { throw customError; });

        const req = {};
        const res = {};
        const next = jest.fn();

        await handler(req, res, next);

        expect(next).toHaveBeenCalledWith(customError);
        expect(customError.statusCode).toBe(500);
        expect(customError.code).toBe("INTERNAL_ERROR");
    });

    it("should call next with a standard error when thrown", async () => {
        const standardError = new Error("unexpected failure");
        const handler = asyncHandler(async () => { throw standardError; });

        const req = {};
        const res = {};
        const next = jest.fn();

        await handler(req, res, next);

        expect(next).toHaveBeenCalledWith(standardError);
    });

    it("should not call next when the wrapped function succeeds", async () => {
        const handler = asyncHandler(async (req, res) => {
            res.status(200).json({ success: true });
        });

        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await handler(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });
});