const errors = require("../../../../src/shared/errors/errors");

describe("errors factories (Unit)", () => {
    it("badRequest sets statusCode 400 and default message", () => {
        const error = errors.badRequest();
        expect(error.statusCode).toBe(400);
        expect(error.code).toBe("BAD_REQUEST");
        expect(error.message).toBe("Bad request");
    });

    it("unauthorized sets statusCode 401", () => {
        const error = errors.unauthorized();
        expect(error.statusCode).toBe(401);
        expect(error.code).toBe("UNAUTHORIZED");
    });

    it("notFound sets statusCode 404", () => {
        const error = errors.notFound();
        expect(error.statusCode).toBe(404);
        expect(error.code).toBe("NOT_FOUND");
    });

    it("conflict sets statusCode 409", () => {
        const error = errors.conflict();
        expect(error.statusCode).toBe(409);
        expect(error.code).toBe("CONFLICT");
    });

    it("forbidden sets statusCode 403", () => {
        const error = errors.forbidden();
        expect(error.statusCode).toBe(403);
        expect(error.code).toBe("FORBIDDEN");
    });

    it("alreadyExists sets statusCode 409 with its own code", () => {
        const error = errors.alreadyExists();
        expect(error.statusCode).toBe(409);
        expect(error.code).toBe("ALREADY_EXISTS");
    });

    it("unprocessable sets statusCode 422", () => {
        const error = errors.unprocessable();
        expect(error.statusCode).toBe(422);
        expect(error.code).toBe("VALIDATION_ERROR");
    });

    it("internal sets statusCode 500", () => {
        const error = errors.internal();
        expect(error.statusCode).toBe(500);
        expect(error.code).toBe("INTERNAL_ERROR");
    });

    it("AppError uses default values when instantiated without any options", () => {
        const error = new errors.AppError();
        expect(error.statusCode).toBe(500);
        expect(error.code).toBe("INTERNAL_ERROR");
        expect(error.message).toBe("Internal server error");
        expect(error.details).toBeNull();
    });

    it("allows overriding message and details via options", () => {
        const error = errors.notFound({ message: "User not found", details: { id: 42 } });
        expect(error.message).toBe("User not found");
        expect(error.details).toEqual({ id: 42 });
    });

    it("toJSON includes details only when present", () => {
        const withDetails = errors.badRequest({ details: { field: "email" } });
        expect(withDetails.toJSON()).toEqual({
            success: false,
            error: { code: "BAD_REQUEST", message: "Bad request", details: { field: "email" } },
        });

        const withoutDetails = errors.badRequest();
        expect(withoutDetails.toJSON()).toEqual({
            success: false,
            error: { code: "BAD_REQUEST", message: "Bad request" },
        });
    });
});