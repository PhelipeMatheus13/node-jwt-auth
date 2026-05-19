const jwt = require("jsonwebtoken");
const { unauthorized } = require("../../../shared/errors/errors");

const generateAccessToken = (userId) => {
    const secret = process.env.SECRET;
    return jwt.sign({ id: userId }, secret, { expiresIn: "15m" });
};

const generateRefreshToken = (userId) => {
    const secret = process.env.REFRESH_SECRET || process.env.SECRET;
    return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
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
    decodeRefreshToken
}