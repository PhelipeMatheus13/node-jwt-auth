const tokenCleanupService = require("../../modules/token/token.cleanup.service");
const logger  = require("../utils/logger");
const { withRetry } = require("../utils/retry");

const TOKEN_CLEANUP_INTERVAL_MS = Number(process.env.TOKEN_CLEANUP_INTERVAL_MS) || 60 * 60 * 1000;

let intervalId;

const runTokenCleanup = async () => {
    let expiredCount = null;
    let revokedCount = null;

    try {
        expiredCount = await withRetry(tokenCleanupService.deleteExpiredRefreshTokens);
    } catch (error) {
        logger.error({ err: error }, "deleteExpiredRefreshTokens failed after retries");
    }

    try {
        revokedCount = await withRetry(tokenCleanupService.deleteRevokedRefreshTokensOlderThan);
    } catch (error) {
        logger.error({ err: error }, "deleteRevokedRefreshTokensOlderThan failed after retries");
    }

    if (expiredCount || revokedCount) {
        logger.info(`Token cleanup completed: ${expiredCount ?? "N/A"} expired, ${revokedCount ?? "N/A"} revoked tokens removed`);
    }
};

const stopTokenCleanupJob = () => {
    if (!intervalId) return;

    clearInterval(intervalId);
    intervalId = undefined;
};

const startTokenCleanupJob = () => {
    if (intervalId) {
        logger.warn("Token cleanup job is already running");
        return;
    }

    runTokenCleanup();
    intervalId = setInterval(runTokenCleanup, TOKEN_CLEANUP_INTERVAL_MS);
};

module.exports = {
  runTokenCleanup,
  startTokenCleanupJob,
  stopTokenCleanupJob,
};

