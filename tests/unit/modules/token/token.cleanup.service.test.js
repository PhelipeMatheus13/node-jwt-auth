const tokenCleanupService = require("../../../../src/modules/token/token.cleanup.service");
const tokenRepository = require("../../../../src/modules/token/token.repository");

jest.mock("../../../../src/modules/token/token.repository");

describe("Token cleanup service (Unit)", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    describe("deleteExpiredRefreshTokens", () => {
        it("should throw an error if tokenRepository.deleteExpired fails", async () => {
            tokenRepository.deleteExpired.mockRejectedValue(new Error("Failed to delete expired tokens"));

            await expect(tokenCleanupService.deleteExpiredRefreshTokens())
                .rejects.toThrow("Failed to delete expired tokens");
        });

        it("should call tokenRepository.deleteExpired", async () => {
            tokenRepository.deleteExpired.mockResolvedValue(1);
        
            await tokenCleanupService.deleteExpiredRefreshTokens();

            expect(tokenRepository.deleteExpired).toHaveBeenCalledTimes(1);
        });
    });

    describe("deleteRevokedRefreshTokensOlderThan", () => {
        it("should throw an error if tokenRepository.deleteRevokedOlderThan fails", async () => {
            tokenRepository.deleteRevokedOlderThan.mockRejectedValue(new Error("Failed to delete revoked tokens"));

            await expect(tokenCleanupService.deleteRevokedRefreshTokensOlderThan())
                .rejects.toThrow("Failed to delete revoked tokens");
        });

        it("should call tokenRepository.deleteRevokedOlderThan with retention hours from env", async () => {
            process.env.RETENTION_HOURS_TOKEN_REVOKED = "48";

            tokenRepository.deleteRevokedOlderThan.mockResolvedValue(1);

            await tokenCleanupService.deleteRevokedRefreshTokensOlderThan();

            expect(tokenRepository.deleteRevokedOlderThan)
                .toHaveBeenCalledWith(48);
        });

        it("should use default retention hours when RETENTION_HOURS_TOKEN_REVOKED is not set", async () => {
            delete process.env.RETENTION_HOURS_TOKEN_REVOKED;

            tokenRepository.deleteRevokedOlderThan.mockResolvedValue(1);
            await tokenCleanupService.deleteRevokedRefreshTokensOlderThan();

            expect(tokenRepository.deleteRevokedOlderThan)
                .toHaveBeenCalledWith(24);
        });
    }); 
});