const crypto = require("crypto");
const { internal } = require("../../shared/errors/errors");
const logger = require("../../shared/utils/logger"); 

/** 
 * Creates an SHA-256 hash for a token and returns the result in hexadecimal format
 */
const hashToken = (token) => {
    // Intentionally no try/catch: this is a synchronous operation and failures are unlikely
    // Unexpected errors are handled by our global error middleware as a 500 response
    return crypto.createHash("sha256").update(token).digest("hex");
};

/** 
 * Compares a token with a hash in a timing-safe manner to prevent timing attacks
 */
const compareToken = (token, hash) => {
    const tokenHash = hashToken(token);

    try {
        // Compare in constant time to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(tokenHash),
            Buffer.from(hash)
        );
    } catch (error) {
        logger.error({ err: error }, "Token comparison error");
        throw internal();
    }
};


module.exports = { hashToken, compareToken };
