const { registerInputDTO, userOutputDTO } = require("../../../../src/modules/user/user.dtos");

describe("User DTOs (Unit)", () => {
  describe("registerInputDTO", () => {
        it("should pick only name, email and password from the body", () => {
            const body = {
                name: "John",
                email: "john@example.com",
                password: "secret",
                extraField: "should be ignored",
                isAdmin: true
            };

            const input = registerInputDTO(body);
            expect(input).toEqual({
                name: "John",
                email: "john@example.com",
                password: "secret"
            });

            expect(input.extraField).toBeUndefined();
            expect(input.isAdmin).toBeUndefined();
        });
  });

  describe("userOutputDTO", () => {
        it("should map snake_case to camelCase and remove password", () => {
            const user = {
                id: "uuid-123",
                name: "John",
                email: "john@example.com",
                password: "secret",
                role: "user",
                created_at: "2025-01-01",
                updated_at: "2025-01-02"
            };

            const output = userOutputDTO(user);

            expect(output).toEqual({
                id: "uuid-123",
                name: "John",
                email: "john@example.com",
                role: "user",
                createdAt: "2025-01-01",
                updatedAt: "2025-01-02"
            });

            expect(output.password).toBeUndefined();
        });
  });
});