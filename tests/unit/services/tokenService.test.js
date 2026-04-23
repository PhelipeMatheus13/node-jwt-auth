const tokenService = require("../../../services/tokenService");

jest.mock("../../../repositories/tokenRepository");
const tokenRepository = require("../../../repositories/tokenRepository");

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
            expect(tokenRepository.create).toHaveBeenCalledWith(tokendata);
        });
    });

    describe("refreshTokenExists", () => {
        it("should throw an error if repository.existsByToken fails", async () => {
            tokenRepository.existsByToken.mockRejectedValue(new Error("fake error"));

            await expect(tokenService.refreshTokenExists("token")).rejects.toThrow("fake error");
        });

        it("should return true if token exists", async () => {
            tokenRepository.existsByToken.mockResolvedValue(true);

            const result = await tokenService.refreshTokenExists("token");
            expect(result).toBe(true);
        });
    });

    describe("revokeRefreshToken", () => {
        it("should throw an error if repository.deleteByToken fails", async () => {
            tokenRepository.deleteByToken.mockRejectedValue(new Error("fake error"));

            await expect(tokenService.revokeRefreshToken("token")).rejects.toThrow("fake error");
        });

        it("should call repository.deleteByToken", async () => {
            tokenRepository.deleteByToken.mockResolvedValue(1);

            await tokenService.revokeRefreshToken("token");
            expect(tokenRepository.deleteByToken).toHaveBeenCalledWith("token");
        });
    });
});