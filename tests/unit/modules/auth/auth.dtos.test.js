const { loginInputDTO, tokenOutputDTO } = require("../../../../src/modules/auth/auth.dtos");

describe("Auth DTOs (Unit)", () => {
    describe("loginInputDTO", () => {
        it("should pick only email and password", () => {
            const body = { email: "a@b.com", password: "secret", extra: "noise" };
            expect(loginInputDTO(body)).toEqual({ email: "a@b.com", password: "secret" });
        });
    });

    describe("tokenOutputDTO", () => {
        it("should format full token pair", () => {
            expect(tokenOutputDTO({ accessToken: "at", refreshToken: "rt" }))
                .toEqual({ accessToken: "at", refreshToken: "rt" });
        });
        it("should format access token only", () => {
            expect(tokenOutputDTO({ accessToken: "at" }))
                .toEqual({ accessToken: "at" });
        });
    });
});