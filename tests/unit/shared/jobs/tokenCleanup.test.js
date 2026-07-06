const tokenCleanup = require("../../../../src/shared/jobs/tokenCleanup.job");
const tokenCleanupService = require("../../../../src/modules/token/token.cleanup.service")
const { withRetry } = require("../../../../src/shared/utils/retry");

jest.mock("../../../../src/modules/token/token.cleanup.service");
jest.mock("../../../../src/shared/utils/retry", () => ({
    withRetry: jest.fn((fn) => fn()),
}));

describe("Token cleanup (Unit)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();
        console.warn = jest.fn();
        console.error = jest.fn();
    });

    afterEach(() => {
        tokenCleanup.stopTokenCleanupJob();
        jest.clearAllMocks();
    });

    describe("runTokenCleanup", () => {
        it("should call deleteExpiredRefreshTokens and deleteRevokedRefreshTokensOlderThan", async () => {
            tokenCleanupService.deleteExpiredRefreshTokens.mockResolvedValue(5);
            tokenCleanupService.deleteRevokedRefreshTokensOlderThan.mockResolvedValue(3);

            await tokenCleanup.runTokenCleanup();

            expect(tokenCleanupService.deleteExpiredRefreshTokens).toHaveBeenCalled();
            expect(tokenCleanupService.deleteRevokedRefreshTokensOlderThan).toHaveBeenCalled();

            expect(console.log).toHaveBeenCalledWith(
                "Token cleanup: removed 5 expired, 3 revoked tokens"
            );
        });

        it("should log errors if deleteExpiredRefreshTokens fails", async () => {
            const error = new Error("Failed to delete expired tokens");
            tokenCleanupService.deleteExpiredRefreshTokens.mockRejectedValue(error);

            await tokenCleanup.runTokenCleanup();

            expect(console.error).toHaveBeenCalledWith(
                "deleteExpiredRefreshTokens: failed after retries:",
                error
            );
        });

        it("should log errors if deleteRevokedRefreshTokensOlderThan fails", async () => {
            const error = new Error("Failed to delete revoked tokens");
            tokenCleanupService.deleteRevokedRefreshTokensOlderThan.mockRejectedValue(error);

            await tokenCleanup.runTokenCleanup();

            expect(console.error).toHaveBeenCalledWith(
                "deleteRevokedRefreshTokensOlderThan: failed after retries:",
                error
            );
        });

        it("should not log the summary if both operations fail", async () => {
            tokenCleanupService.deleteExpiredRefreshTokens.mockRejectedValue(new Error("fail expired"));
            tokenCleanupService.deleteRevokedRefreshTokensOlderThan.mockRejectedValue(new Error("fail revoked"));

            await tokenCleanup.runTokenCleanup();

            expect(console.error).toHaveBeenCalledTimes(2);
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

            expect(console.warn).toHaveBeenCalledWith("Token cleanup job is already running");
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

            expect(console.warn).not.toHaveBeenCalledWith("Token cleanup job is already running");
        });

        it("should do nothing if the job was never started", () => {
            jest.spyOn(global, "clearInterval");

            tokenCleanup.stopTokenCleanupJob();

            expect(clearInterval).not.toHaveBeenCalled();
        });
    });
});