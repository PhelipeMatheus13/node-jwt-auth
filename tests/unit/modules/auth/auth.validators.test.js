const { validateLogin } = require("../../../../src/modules/auth/auth.validators");

describe("Auth Validators (Unit)", () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe("validateLogin", () => {
        const runValidation = async (body) => {
            req.body = body;
            for (const middleware of validateLogin) {
                await middleware(req, res, next);
            }
        };

        it("should call next for valid input", async () => {
            await runValidation({
                email: "john@example.com",
                password: "anypassword"
            });

            expect(next).toHaveBeenCalledWith();
        });

        it("should return 422 if email is missing", async () => {
            await runValidation({
                password: "anypassword"
            });

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 422,
                    code: "VALIDATION_ERROR",
                    details: expect.arrayContaining([
                        expect.objectContaining({ msg: "Email is required" })
                    ])
                })
            );
        });

        it("should return 422 if email is invalid", async () => {
            await runValidation({
                email: "invalid",
                password: "anypassword"
            });

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 422,
                    code: "VALIDATION_ERROR",
                    details: expect.arrayContaining([
                        expect.objectContaining({ msg: "Please provide a valid email address" })
                    ])
                })
            );
        });

        it("should return 422 if password is missing", async () => {
            await runValidation({
                email: "john@example.com"
            });

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 422,
                    code: "VALIDATION_ERROR",
                    details: expect.arrayContaining([
                        expect.objectContaining({ msg: "Password is required" })
                    ])
                })
            );
        });
    });
});