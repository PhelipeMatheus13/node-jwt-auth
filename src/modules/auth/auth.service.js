const hashService = require("../../shared/services/hash.service");
const jwtService = require("../../shared/services/jwt.service");
const userService = require("../user/user.service");
const tokenService = require("../token/token.service");
const {unauthorized} = require("../../shared/errors/errors");
const { getKnex } = require("../../shared/config/database");
const { randomUUID } = require("crypto");  

const login = async (email, password) => {
    // Find user by email, including password hash for validation
    const userData = await userService.findUserByEmail(email);
 
    // For security reasons, any errors will be treated as invalid here
    if (!userData || !(await hashService.compare(password, userData.password))) {
        throw unauthorized({
            message: "Invalid email or password",
            code: "INVALID_CREDENTIALS",
        });
    }

    const accessToken = jwtService.generateAccessToken(
        userData.id, 
        userData.role
    );

    const refreshToken = jwtService.generateRefreshToken(
        userData.id, 
        userData.role, 
        randomUUID()
    );

    const decoded = jwtService.decodeRefreshToken(refreshToken);
    // hash refresh token before saving in database
    const hashedToken = await hashService.hash(refreshToken);

    await tokenService.saveRefreshToken({
        tokenHash: hashedToken,
        userId: userData.id,
        jti: decoded.jti,
        expiresAt: new Date(decoded.exp * 1000) 
    });

    return {
        accessToken,
        refreshToken
    };
};

const rotateTokens = async (oldRefreshToken) => {
    const oldRefreshDecoded = jwtService.decodeRefreshToken(oldRefreshToken);
    const tokenData = await tokenService.findRefreshTokenByJti(oldRefreshDecoded.jti);

    if (!tokenData) {
        throw unauthorized({message: "Refresh token not found", code: "TOKEN_NOT_FOUND"});
    }

    // for security, compare the provided refresh token with the hashed version in the database
    // This ensures that the presented token is exactly the one that was issued
    if (!(await hashService.compare(oldRefreshToken, tokenData.token_hash))) {
        throw unauthorized({ message: "Invalid refresh token", code: "INVALID_TOKEN" });
    }

    if (tokenData.revoked_at) {
        // If the token has been revoked, revoke all tokens for this user to prevent reuse
        // TODO: implement logging this event for security auditing
        await tokenService.revokeAllRefreshTokensByUserId(tokenData.user_id);

        throw unauthorized({message: "Refresh token reuse detected", code: "TOKEN_REUSE_DETECTED"});
    }

    // Generate new tokens
    const newAccessToken = jwtService.generateAccessToken(
        oldRefreshDecoded.id, 
        oldRefreshDecoded.role
    );

    const newRefreshToken = jwtService.generateRefreshToken(
        oldRefreshDecoded.id, 
        oldRefreshDecoded.role, 
        randomUUID()
    );

    const newRefreshDecoded = jwtService.decodeRefreshToken(newRefreshToken);
    const newRefreshTokenHash = await hashService.hash(newRefreshToken);

    const knex = getKnex();
    await knex.transaction(async (trx) => {
        const revokedRows = await tokenService.revokeRefreshTokenById(tokenData.id, trx);
        if (revokedRows === 0) {
            // race condition: the token was revoked by another process after we checked but before we revoked it
            throw unauthorized({ message: "Refresh token reuse detected", code: "TOKEN_REUSE_DETECTED" });
        }

        await tokenService.saveRefreshToken({
            tokenHash: newRefreshTokenHash,
            userId: newRefreshDecoded.id,
            jti: newRefreshDecoded.jti,
            expiresAt: new Date(newRefreshDecoded.exp * 1000),
        }, trx);
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const logout = async (refreshToken) => {
    const decoded = jwtService.decodeRefreshToken(refreshToken);
    const tokenData = await tokenService.findRefreshTokenByJti(decoded.jti);

    if (!tokenData) {
        throw unauthorized({ message: "Refresh token not found", code: "TOKEN_NOT_FOUND" });
    }

    if (!(await hashService.compare(refreshToken, tokenData.token_hash))) {
        throw unauthorized({ message: "Invalid refresh token", code: "INVALID_TOKEN" });
    }

    if (tokenData.revoked_at) {
        // Logout is idempotent: the token is already dead, the goal is already achieved
        // it does not grant new tokens, so there is no privilege to protect here
        return;
    }

    return await tokenService.revokeRefreshTokenById(tokenData.id);
};

const logoutAll = async (refreshToken) => {
    const decoded = jwtService.decodeRefreshToken(refreshToken);
    const tokenData = await tokenService.findRefreshTokenByJti(decoded.jti);

    if (!tokenData) {
        throw unauthorized({ message: "Refresh token not found", code: "TOKEN_NOT_FOUND" });
    }

    if (!(await hashService.compare(refreshToken, tokenData.token_hash))) {
        throw unauthorized({ message: "Invalid refresh token", code: "INVALID_TOKEN" });
    }

    return tokenService.revokeAllRefreshTokensByUserId(tokenData.user_id);
};

module.exports = {
    login,
    rotateTokens,
    logout,
    logoutAll,
};