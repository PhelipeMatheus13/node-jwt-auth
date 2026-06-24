const { loginInputDTO, tokenOutputDTO } = require("../../../../src/modules/auth/auth.dtos");

describe("Auth DTOs (Unit)", () => {
    describe("loginInputDTO", () => {
        it("should pick only email and password", () => {
            const body = { email: "teste@example.com", password: "secret", extra: "noise" };
            expect(loginInputDTO(body)).toEqual({ email: "teste@example.com", password: "secret" });
        });
    });

    describe("tokenOutputDTO", () => {
        it("should format full token pair", () => {
            expect(tokenOutputDTO({ accessToken: "accessToken", refreshToken: "refreshToken" }))
                .toEqual({ accessToken: "accessToken", refreshToken: "refreshToken" });
        });
    });
});