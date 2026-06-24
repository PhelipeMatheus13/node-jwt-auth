const tokenService = require("../../../../src/modules/token/token.service");

jest.mock("../../../../src/modules/token/token.repository");
const tokenRepository = require("../../../../src/modules/token/token.repository");

describe("Token Service (Unit)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("saveRefreshToken", () => {
        const tokendata = {token: "token", userId: "uuid-123", expiresAt: new Date()}
        it("should throw an error if repository.create fails", async () => {
            tokenRepository.create.mockRejectedValue(new Error("fake error"));

            await expect(tokenService.saveRefreshToken(tokendata)).rejects.toThrow("fake error");
        });

        it("should call repository.create", async () => {
            tokenRepository.create.mockResolvedValue(1);

            await tokenService.saveRefreshToken(tokendata);
            expect(tokenRepository.create).toHaveBeenCalledWith(tokendata, null);
        });
    });


    describe("revokeRefreshToken", () => {
        it("should throw an error if repository.revokeByToken fails", async () => {
            tokenRepository.revokeByToken.mockRejectedValue(new Error("fake error"));

            await expect(tokenService.revokeRefreshToken("token")).rejects.toThrow("fake error");
        });

        it("should call repository.revokeByToken", async () => {
            tokenRepository.revokeByToken.mockResolvedValue(1);

            await tokenService.revokeRefreshToken("token");
            expect(tokenRepository.revokeByToken).toHaveBeenCalledWith("token", null);
        });
    });

    describe("revokeAllRefreshTokensByUserId", () => {
        it("should throw an error if repository.revokeAllByUserId fails", async () => {
            tokenRepository.revokeAllByUserId.mockRejectedValue(new Error("fake error"));

            await expect(tokenService.revokeAllRefreshTokensByUserId("uuid-123")).rejects.toThrow("fake error");
        });

        it("should call repository.revokeAllByUserId", async () => {
            tokenRepository.revokeAllByUserId.mockResolvedValue(1);

            await tokenService.revokeAllRefreshTokensByUserId("uuid-123");
            expect(tokenRepository.revokeAllByUserId).toHaveBeenCalledWith("uuid-123");
        });
    });

    describe("listRefreshTokensByUserId", () => {
        it("should throw an error if repository.listByUserId fails", async () => {
            tokenRepository.listByUserId.mockRejectedValue(new Error("fake error"));

            await expect(tokenService.listRefreshTokensByUserId("token")).rejects.toThrow("fake error");
        });

        it("should call repository.listByUserId", async () => {
            const tokensData = [
                {token: "test-token-123"},
                {token: "test-token-456"}
            ];

            tokenRepository.listByUserId.mockResolvedValue(tokensData);

            const response = await tokenService.listRefreshTokensByUserId("token");

            expect(tokenRepository.listByUserId).toHaveBeenCalledWith("token");
            expect(response).toBe(tokensData)
        });
    });
});