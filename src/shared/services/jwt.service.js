const jwt = require("jsonwebtoken");
var logger = require("../../shared/utils/logger");
const { unauthorized } = require("../errors/errors");

const generateAccessToken = (userId, role) => {
    const secret = process.env.SECRET;
    return jwt.sign({ id: userId, role: role }, secret, { expiresIn: "15m" });
};

const generateRefreshToken = (userId, role, jti) => {
    const secret = process.env.REFRESH_SECRET || process.env.SECRET;
    return jwt.sign({ id: userId, role: role, jti: jti }, secret, { expiresIn: "7d" });
};

const decodeAccessToken = (token) => {
    const secret = process.env.SECRET;
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw unauthorized({ message: "Access token expired", code: "ACCESS_TOKEN_EXPIRED" });
        }

        if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
            logger.warn({ err: error }, "Invalid access token");
            throw unauthorized({ message: "Invalid access token", code: "INVALID_TOKEN" });
        }

        logger.error({ err: error }, "Unexpected error while verifying access token");
        throw unauthorized({ message: "Invalid access token", code: "INVALID_TOKEN" });
    }
};

const decodeRefreshToken = (token) => {
    const secret = process.env.REFRESH_SECRET || process.env.SECRET;
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw unauthorized({ message: "Refresh token expired", code: "REFRESH_TOKEN_EXPIRED" });
        }

        if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
            logger.warn({ err: error }, "Invalid refresh token");
            throw unauthorized({ message: "Invalid refresh token", code: "INVALID_TOKEN" });
        }

        logger.error({ err: error }, "Unexpected error while verifying refresh token");
        throw unauthorized({ message: "Invalid refresh token", code: "INVALID_TOKEN" });
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    decodeAccessToken,
    decodeRefreshToken
}