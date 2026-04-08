const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");

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

    // Save the refresh token in the database
    await RefreshToken.create({
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
        const storedToken = await RefreshToken.findOne({ token });
        if (!storedToken) {
            throw new Error("Token not found or revoked");
        }

        return decoded; // { id, iat, exp } id is the userId, iat is the issued at time, exp is the expiration time
    } catch (err) {
        throw new Error("Invalid or expired refresh token");
    }
};

// logout user; this function will be used to revoke the refresh token, removing it from the database
const revokeRefreshToken = async (token) => {
    await RefreshToken.deleteOne({ token });
};



module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
};