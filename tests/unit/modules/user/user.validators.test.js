const { validateRegister } = require("../../../../src/modules/user/user.validators");

describe("Auth Validators (Unit)", () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
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

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it("should return 422 if name is empty", async () => {
            await runValidation({
                name: "",
                email: "john@example.com",
                password: "Pass@123",
                confirmPassword: "Pass@123"
            });

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({
                errors: expect.arrayContaining([
                expect.objectContaining({ msg: "Name is required" })
                ])
            });
        });

        it("should return 422 if name is less than 3 characters", async () => {
            await runValidation({
                name: "Jo",
                email: "john@example.com",
                password: "Pass@123",
                confirmPassword: "Pass@123"
            });

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({
                errors: expect.arrayContaining([
                expect.objectContaining({ msg: "Name must be at least 3 characters long" })
                ])
            });
        });

        it("should return 422 if email is invalid", async () => {
            await runValidation({
                name: "John",
                email: "not-an-email",
                password: "Pass@123",
                confirmPassword: "Pass@123"
            });

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({
                errors: expect.arrayContaining([
                expect.objectContaining({ msg: "Please provide a valid email address" })
                ])
            });
        });

        it("should return 422 if password is missing", async () => {
            await runValidation({
                name: "John",
                email: "john@example.com",
                password: "",
                confirmPassword: "Pass@123"
            });

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({
                errors: expect.arrayContaining([
                expect.objectContaining({ msg: "Password is required" })
                ])
            });
        });

        it("should return 422 if password is less than 6 characters", async () => {
            await runValidation({
                name: "John",
                email: "john@example.com",
                password: "Pass1",
                confirmPassword: "Pass1"
            });

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({
                errors: expect.arrayContaining([
                expect.objectContaining({ msg: "Password must be at least 6 characters long" })
                ])
            });
        });

        it("should return 422 if password lacks special character", async () => {
            await runValidation({
                name: "John",
                email: "john@example.com",
                password: "Password123",
                confirmPassword: "Password123"
            });

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({
                errors: expect.arrayContaining([
                expect.objectContaining({ msg: "Password must contain at least one special character" })
                ])
            });
        });

        it("should return 422 if confirmPassword is missing", async () => {
            await runValidation({
                name: "John",
                email: "john@example.com",
                password: "Pass@123",
                confirmPassword: ""
            });

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({
                errors: expect.arrayContaining([
                expect.objectContaining({ msg: "Password confirmation is required" })
                ])
            });
        });

        it("should return 422 if passwords do not match", async () => {
            await runValidation({
                name: "John",
                email: "john@example.com",
                password: "Pass@123",
                confirmPassword: "Different@123"
            });

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({
                errors: expect.arrayContaining([
                expect.objectContaining({ msg: "Passwords do not match" })
                ])
            });
        });
    });
});