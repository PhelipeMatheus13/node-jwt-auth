const rateLimit = require("express-rate-limit");

/**
 * Creates and configures an Express rate limiter middleware.
 *
 * @param {Object} options - Rate limiter configuration.
 * @param {number} options.windowMs - Time window in milliseconds.
 * @param {number} options.maxRequests - Maximum number of requests allowed within the time window.
 * @param {string} [options.errorMessage] - Custom error message returned when the rate limit is exceeded.
 * @returns {import("express").RequestHandler} Configured Express middleware.
 */
function createRateLimiter({ windowMs, maxRequests, errorMessage }) {
    return rateLimit({
        windowMs,
        limit: maxRequests,
        standardHeaders: "draft-8", // latest IETF RateLimit header spec, exposes limit/remaining/reset to clients
        legacyHeaders: false,       // disables the old non-standard X-RateLimit-* headers
        message: {
            success: false,
            error: {
                code: "TOO_MANY_REQUESTS",
                message: errorMessage || "Too many requests, please try again later",
            },
        },
    });
}

const globalLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 min
    maxRequests: 60,
});

const loginLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 min
    maxRequests: 5,
    errorMessage: "Too many login attempts, please try again in a minute",
});

const refreshLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 min
    maxRequests: 3,
    errorMessage: "Too many refresh attempts, please try again in a minute",
});

const registerLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 min
    maxRequests: 5,
    errorMessage: "Too many register attempts, please try again in a minute",
});

module.exports = {
    globalLimiter,
    loginLimiter,
    refreshLimiter,
    registerLimiter,
};