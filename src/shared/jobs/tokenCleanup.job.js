const tokenCleanupService = require("../../modules/token/token.cleanup.service");
const { withRetry } = require("../utils/retry");

const TOKEN_CLEANUP_INTERVAL_MS = Number(process.env.TOKEN_CLEANUP_INTERVAL_MS) || 60 * 60 * 1000;

let intervalId;

const runTokenCleanup = async () => {
    let expiredCount = null;
    let revokedCount = null;

    try {
        expiredCount = await withRetry(tokenCleanupService.deleteExpiredRefreshTokens);
    } catch (error) {
        console.error("deleteExpiredRefreshTokens: failed after retries:", error);
    }

    try {
        revokedCount = await withRetry(tokenCleanupService.deleteRevokedRefreshTokensOlderThan);
    } catch (error) {
        console.error("deleteRevokedRefreshTokensOlderThan: failed after retries:", error);
    }

    if (expiredCount || revokedCount) {
        console.log(`Token cleanup: removed ${expiredCount ?? "N/A"} expired, ${revokedCount ?? "N/A"} revoked tokens`);
    }
}

const stopTokenCleanupJob = () => {
    if (!intervalId) return;

    clearInterval(intervalId);
    intervalId = undefined;
}

const startTokenCleanupJob = () => {
    if (intervalId) {
        console.warn("Token cleanup job is already running");
        return;
    }

    runTokenCleanup();
    intervalId = setInterval(runTokenCleanup, TOKEN_CLEANUP_INTERVAL_MS);
}

module.exports = {
  runTokenCleanup,
  startTokenCleanupJob,
  stopTokenCleanupJob
};

