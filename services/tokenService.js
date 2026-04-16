const jwt = require("jsonwebtoken");
const tokenRepository = require("../repositories/tokenRepository");

// Generate access token; this token will be used for authentication and will have a short expiration time
const generateAccessToken = (userId) => {
    const secret = process.env.SECRET;
    return jwt.sign({ id: userId }, secret, { expiresIn: "15m" }); // 15 minutes
};

// Generate refresh token; this token will be used to obtain new access tokens and will have a longer expiration time
const generateRefreshToken = async (userId) => {
    const secret = process.env.REFRESH_SECRET || process.env.SECRET;
    const refreshToken = jwt.sign({ id: userId }, secret, { expiresIn: "7d" }); // 7 days

    const decoded = jwt.decode(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);

    // TODO: hash the refresh token before saving it in the database for added security

    // Save the refresh token in the database
    await tokenRepository.create({
        token: refreshToken,
        userId,
        expiresAt
    });

    return refreshToken;
};

// verify refresh token; this function will be used to validate the refresh token and check if it exists in the database
const verifyRefreshToken = async (token) => {
    try {
        const secret = process.env.REFRESH_SECRET || process.env.SECRET;
        const decoded = jwt.verify(token, secret);

        // Check if exists 
        const exists = await tokenRepository.existsByToken(token);
        if (!exists) {
            throw new Error("Token not found or revoked");
        }

        return decoded; // { id, iat, exp } 
    } catch (err) {
        throw new Error("Invalid or expired refresh token");
    }
};

// logout user; this function will be used to revoke the refresh token, removing it from the database
const revokeRefreshToken = (token) => tokenRepository.deleteByToken(token);

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
};