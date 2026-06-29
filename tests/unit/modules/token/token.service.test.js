const tokenService = require("../../../../src/modules/token/token.service");

jest.mock("../../../../src/modules/token/token.repository");
const tokenRepository = require("../../../../src/modules/token/token.repository");

describe("Token Service (Unit)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("saveRefreshToken", () => {
        const tokendata = {tokenHash: "token", userId: "uuid-123", jti: "jti-uuid-123", expiresAt: new Date()}
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


    describe("revokeRefreshTokenById", () => {
        it("should throw an error if repository.revokeById fails", async () => {
            tokenRepository.revokeById.mockRejectedValue(new Error("fake error"));

            await expect(tokenService.revokeRefreshTokenById("token-id-123")).rejects.toThrow("fake error");
        });

        it("should call repository.revokeById", async () => {
            tokenRepository.revokeById.mockResolvedValue(1);

            await tokenService.revokeRefreshTokenById("token-id-123");
            expect(tokenRepository.revokeById).toHaveBeenCalledWith("token-id-123", null);
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

    describe("findRefreshTokenByJti", () => {
        it("should throw an error if repository.findByJti fails", async () => {
            tokenRepository.findByJti.mockRejectedValue(new Error("fake error"));

            await expect(tokenService.findRefreshTokenByJti("jti-uuid-123")).rejects.toThrow("fake error");
        });

        it("should call repository.findByJti", async () => {
            const tokenData = {token: "test-token-123"};

            tokenRepository.findByJti.mockResolvedValue(tokenData);

            const response = await tokenService.findRefreshTokenByJti("jti-uuid-123");

            expect(tokenRepository.findByJti).toHaveBeenCalledWith("jti-uuid-123");
            expect(response).toBe(tokenData)
        });
    });
});