const { validateRegister } = require("../../../../src/modules/user/user.validators");

describe("User Validators (Unit)", () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe("validateRegister", () => {
        const runValidation = async (body) => {
            req.body = body;
            for (const middleware of validateRegister) {
                await middleware(req, res, next);
            }
        };

        it("should call next for valid input", async () => {
            await runValidation({
                name: "John Doe",
                email: "john@example.com",
                password: "Pass@123",
                confirmPassword: "Pass@123"
            });

            expect(next).toHaveBeenCalledWith();
        });

        it("should call next with error if name is empty", async () => {
            await runValidation({
                name: "",
                email: "john@example.com",
                password: "Pass@123",
                confirmPassword: "Pass@123"
            });

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 422,
                    code: "VALIDATION_ERROR",
                    details: expect.arrayContaining([
                        expect.objectContaining({ msg: "Name is required" })
                    ])
                })
            );
        });

        it("should call next with error if name is less than 3 characters", async () => {
            await runValidation({
                name: "Jo",
                email: "john@example.com",
                password: "Pass@123",
                confirmPassword: "Pass@123"
            });

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 422,
                    code: "VALIDATION_ERROR",
                    details: expect.arrayContaining([
                        expect.objectContaining({ msg: "Name must be at least 3 characters long" })
                    ])
                })
            );
        });

        it("should call next with error if email is invalid", async () => {
            await runValidation({
                name: "John",
                email: "not-an-email",
                password: "Pass@123",
                confirmPassword: "Pass@123"
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

        it("should call next with error if password is missing", async () => {
            await runValidation({
                name: "John",
                email: "john@example.com",
                password: "",
                confirmPassword: "Pass@123"
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

        it("should call next with error if password is less than 6 characters", async () => {
            await runValidation({
                name: "John",
                email: "john@example.com",
                password: "Pass1",
                confirmPassword: "Pass1"
            });

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 422,
                    code: "VALIDATION_ERROR",
                    details: expect.arrayContaining([
                        expect.objectContaining({ msg: "Password must be at least 6 characters long" })
                    ])
                })
            );
        });

        it("should call next with error if password lacks special character", async () => {
            await runValidation({
                name: "John",
                email: "john@example.com",
                password: "Password123",
                confirmPassword: "Password123"
            });

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 422,
                    code: "VALIDATION_ERROR",
                    details: expect.arrayContaining([
                        expect.objectContaining({ msg: "Password must contain at least one special character" })
                    ])
                })
            );
        });

        it("should call next with error if confirmPassword is missing", async () => {
            await runValidation({
                name: "John",
                email: "john@example.com",
                password: "Pass@123",
                confirmPassword: ""
            });

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 422,
                    code: "VALIDATION_ERROR",
                    details: expect.arrayContaining([
                        expect.objectContaining({ msg: "Password confirmation is required" })
                    ])
                })
            );
        });

        it("should call next with error if passwords do not match", async () => {
            await runValidation({
                name: "John",
                email: "john@example.com",
                password: "Pass@123",
                confirmPassword: "Different@123"
            });

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 422,
                    code: "VALIDATION_ERROR",
                    details: expect.arrayContaining([
                        expect.objectContaining({ msg: "Passwords do not match" })
                    ])
                })
            );
        });
    });
});