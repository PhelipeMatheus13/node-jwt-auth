const jwt = require("jsonwebtoken");
const { unauthorized } = require("../errors/errors");

const generateAccessToken = (userId, role) => {
    const secret = process.env.SECRET;
    return jwt.sign({ id: userId, role: role }, secret, { expiresIn: "15m" });
};

const generateRefreshToken = (userId, role) => {
    const secret = process.env.REFRESH_SECRET || process.env.SECRET;
    return jwt.sign({ id: userId, role: role }, secret, { expiresIn: "7d" });
};

const decodeAccessToken = (token) => {
    const secret = process.env.SECRET;
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw unauthorized({ message: "Access token expired", code: "TOKEN_EXPIRED" });
        }
        throw unauthorized({ message: "Invalid access token", code: "INVALID_TOKEN" });
    }
};

const decodeRefreshToken = (token) => {
    const secret = process.env.REFRESH_SECRET || process.env.SECRET;
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw unauthorized({ message: "Refresh token expired", code: "TOKEN_EXPIRED" });
        }
        throw unauthorized({ message: "Invalid refresh token", code: "INVALID_TOKEN" });
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    decodeAccessToken,
    decodeRefreshToken
}