const tokenCleanup = require("../../../../src/shared/jobs/tokenCleanup.job");
const tokenCleanupService = require("../../../../src/modules/token/token.cleanup.service")
const { withRetry } = require("../../../../src/shared/utils/retry");
const logger  = require("../../../../src/shared/utils/logger");

jest.mock("../../../../src/modules/token/token.cleanup.service");

jest.mock("../../../../src/shared/utils/retry", () => ({
    withRetry: jest.fn((fn) => fn()),
}));

jest.mock("../../../../src/shared/utils/logger", () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

describe("Token cleanup (Unit)", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();

        process.env = { ...originalEnv };

        jest.resetModules();
    });

    afterEach(() => {
        tokenCleanup.stopTokenCleanupJob();

        process.env = { ...originalEnv };

        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe("runTokenCleanup", () => {
        it("should call deleteExpiredRefreshTokens and deleteRevokedRefreshTokensOlderThan", async () => {
            tokenCleanupService.deleteExpiredRefreshTokens.mockResolvedValue(5);
            tokenCleanupService.deleteRevokedRefreshTokensOlderThan.mockResolvedValue(3);

            await tokenCleanup.runTokenCleanup();

            expect(tokenCleanupService.deleteExpiredRefreshTokens).toHaveBeenCalled();
            expect(tokenCleanupService.deleteRevokedRefreshTokensOlderThan).toHaveBeenCalled();

            expect(logger.info).toHaveBeenCalledWith(
                "Token cleanup completed: 5 expired, 3 revoked tokens removed"
            );
        });

        it("should log errors if deleteExpiredRefreshTokens fails", async () => {
            const error = new Error("Failed to delete expired tokens");
            tokenCleanupService.deleteExpiredRefreshTokens.mockRejectedValue(error);
            tokenCleanupService.deleteRevokedRefreshTokensOlderThan.mockResolvedValue(2);

            await tokenCleanup.runTokenCleanup();

            expect(logger.error).toHaveBeenCalledWith(
                { err: error },
                "deleteExpiredRefreshTokens failed after retries"
            );

            expect(logger.info).toHaveBeenCalledWith(
                "Token cleanup completed: N/A expired, 2 revoked tokens removed"
            );
        });

        it("should log errors if deleteRevokedRefreshTokensOlderThan fails", async () => {
            tokenCleanupService.deleteExpiredRefreshTokens.mockResolvedValue(4);
            const error = new Error("Failed to delete revoked tokens");
            tokenCleanupService.deleteRevokedRefreshTokensOlderThan.mockRejectedValue(error);

            await tokenCleanup.runTokenCleanup();

            expect(logger.error).toHaveBeenCalledWith(
                { err: error },
                "deleteRevokedRefreshTokensOlderThan failed after retries"
            );
            
            expect(logger.info).toHaveBeenCalledWith(
                "Token cleanup completed: 4 expired, N/A revoked tokens removed"
            );
        });

        it("should not log the summary if both operations fail", async () => {
            tokenCleanupService.deleteExpiredRefreshTokens.mockRejectedValue(new Error("fail expired"));
            tokenCleanupService.deleteRevokedRefreshTokensOlderThan.mockRejectedValue(new Error("fail revoked"));

            await tokenCleanup.runTokenCleanup();

            expect(logger.error).toHaveBeenCalledTimes(2);
        });
    });

    describe("startTokenCleanupJob", () => {
        it("should start the token cleanup job and set an interval", () => {
            jest.useFakeTimers();
            jest.spyOn(global, "setInterval");

            tokenCleanup.startTokenCleanupJob();

            expect(setInterval).toHaveBeenCalledWith(expect.any(Function), expect.any(Number));

            jest.useRealTimers();
        });

        it("should not start the job if it's already running", () => {
            tokenCleanup.startTokenCleanupJob();
            tokenCleanup.startTokenCleanupJob();

            expect(logger.warn).toHaveBeenCalledWith("Token cleanup job is already running");
        });

        it("should use TOKEN_CLEANUP_INTERVAL_MS from environment variable", () => {
            jest.useFakeTimers();

            process.env.TOKEN_CLEANUP_INTERVAL_MS = "30000";

            jest.resetModules();

            const tokenCleanupJob = require("../../../../src/shared/jobs/tokenCleanup.job");

            jest.spyOn(global, "setInterval");

            tokenCleanupJob.startTokenCleanupJob();

            expect(setInterval).toHaveBeenCalledWith(
                expect.any(Function),
                30000
            );
        });

        it("should use 1 hour as default interval when TOKEN_CLEANUP_INTERVAL_MS is not defined", () => {
            jest.useFakeTimers();

            delete process.env.TOKEN_CLEANUP_INTERVAL_MS;

            jest.resetModules();

            const tokenCleanupJob = require("../../../../src/shared/jobs/tokenCleanup.job");

            jest.spyOn(global, "setInterval");

            tokenCleanupJob.startTokenCleanupJob();

            expect(setInterval).toHaveBeenCalledWith(
                expect.any(Function),
                60 * 60 * 1000
            );
        });
    });

    describe("stopTokenCleanupJob", () => {
        it("should clear the interval when the job is running", () => {
            jest.useFakeTimers();
            jest.spyOn(global, "clearInterval");

            tokenCleanup.startTokenCleanupJob();
            tokenCleanup.stopTokenCleanupJob();

            expect(clearInterval).toHaveBeenCalled();

            jest.useRealTimers();
        });

        it("should allow the job to be started again after being stopped", () => {
            tokenCleanup.startTokenCleanupJob();
            tokenCleanup.stopTokenCleanupJob();
            tokenCleanup.startTokenCleanupJob();

            expect(logger.warn).not.toHaveBeenCalledWith("Token cleanup job is already running");
        });

        it("should do nothing if the job was never started", () => {
            jest.spyOn(global, "clearInterval");

            tokenCleanup.stopTokenCleanupJob();

            expect(clearInterval).not.toHaveBeenCalled();
        });
    });
});