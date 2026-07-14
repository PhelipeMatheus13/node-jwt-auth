const errorHandler = require("../../../../src/shared/middlewares/error.middleware");
const { notFound } = require("../../../../src/shared/errors/errors");

jest.mock("../../../../src/shared/utils/logger", () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

const logger = require("../../../../src/shared/utils/logger");

describe("Error Middleware (Unit)", () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();

        jest.clearAllMocks();
    });

    it("should respond with operational error details when error is operational", () => {
        const operationalError = notFound({ message: "Resource not found" });

        errorHandler(operationalError, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(operationalError.toJSON());
        expect(logger.error).not.toHaveBeenCalled();
    });

    it("should respond with 500 for non-operational errors and log the error", () => {
        const unexpectedError = new Error("Database error");

        errorHandler(unexpectedError, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Internal server error",
            },
        });
        expect(logger.error).toHaveBeenCalled();
    });

    it("should not call next for operational or non-operational errors", () => {
        errorHandler(new Error("any"), req, res, next);
        expect(next).not.toHaveBeenCalled();
    });
});