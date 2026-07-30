const rateLimit = require("express-rate-limit");

/**
 * Creates and configures an Express rate limiter middleware.
 *
 * @param {Object} options - Rate limiter configuration.
 * @param {string} options.identifier - Name of the rate limiting policy exposed in the `RateLimit-Policy` header.
 * @param {number} options.windowMs - Time window in milliseconds.
 * @param {number} options.maxRequests - Maximum number of requests allowed within the time window.
 * @param {string} [options.errorMessage] - Custom error message returned when the rate limit is exceeded.
 * @returns {import("express").RequestHandler} Configured Express middleware.
 */
const createRateLimiter = ({ identifier, windowMs, maxRequests, errorMessage }) =>  {
    return rateLimit({
        identifier,
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
};

const globalLimiter = createRateLimiter({
    identifier: "global",
    windowMs: 60 * 1000, // 1 min
    maxRequests: 60,
});

const loginLimiter = createRateLimiter({
    identifier: "login",
    windowMs: 60 * 1000, // 1 min
    maxRequests: 5,
    errorMessage: "Too many login attempts, please try again in a minute",
});

const refreshLimiter = createRateLimiter({
    identifier: "refresh",
    windowMs: 60 * 1000, // 1 min
    maxRequests: 3,
    errorMessage: "Too many refresh attempts, please try again in a minute",
});

const registerLimiter = createRateLimiter({
    identifier: "register",
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