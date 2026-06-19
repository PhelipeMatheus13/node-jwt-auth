const hashService = require("../../shared/services/hash.service");
const jwtService = require("../../shared/services/jwt.service");
const userService = require("../user/user.service");
const tokenService = require("../token/token.service");
const {unauthorized, notFound} = require("../../shared/errors/errors");


const login = async (email, password) => {
    // Find user by email, including password hash for validation
    const user = await userService.findUserByEmail(email);
 
    // For security reasons, any errors will be treated as invalid here
    if (!user || !(await hashService.compare(password, user.password))) {
        throw unauthorized({
            message: "Invalid email or password",
            code: "INVALID_CREDENTIALS",
        });
    }

    const accessToken = jwtService.generateAccessToken(user.id, user.role);
    const refreshToken = jwtService.generateRefreshToken(user.id, user.role);
    const decoded = jwtService.decodeRefreshToken(refreshToken);
    // hash refresh token before saving in database
    const hashedToken = await hashService.hash(refreshToken);

    await tokenService.saveRefreshToken({
        token: hashedToken,
        userId: user.id,
        expiresAt: new Date(decoded.exp * 1000) 
    });

    return {
        accessToken,
        refreshToken
    };
};


const refreshAccessToken = async (refreshToken) => {
    const decoded = jwtService.decodeRefreshToken(refreshToken);
    const hashes = await tokenService.listRefreshTokensByUserId(decoded.id);

    if (!hashes.length) {
        throw notFound({ message: "Refresh token not found", code: "TOKEN_NOT_FOUND" });
    }

    let match = false;
    for (const record of hashes) {
        if (await hashService.compare(refreshToken, record.token)) {
            match = true;
            break;
        }
    }

    if (!match) {
        throw notFound({ message: "Refresh token not found", code: "TOKEN_NOT_FOUND" });
    }

    return jwtService.generateAccessToken(decoded.id, decoded.role);
};


const logout = async (refreshToken) => {
    const decoded = jwtService.decodeRefreshToken(refreshToken);
    const hashes = await tokenService.listRefreshTokensByUserId(decoded.id);

    if (!hashes.length) {
        throw notFound({ message: "Refresh token not found", code: "TOKEN_NOT_FOUND" });
    }

    let matchedHash = null;
    for (const record of hashes) {
        if (await hashService.compare(refreshToken, record.token)) {
            matchedHash = record.token;
            break;
        }
    }

    if (!matchedHash) {
        throw notFound({ message: "Refresh token not found", code: "TOKEN_NOT_FOUND" });
    }

    return await tokenService.revokeRefreshToken(matchedHash);
};

const logoutAll = async (refreshToken) => {
    const decoded = jwtService.decodeRefreshToken(refreshToken);
    const hashes = await tokenService.listRefreshTokensByUserId(decoded.id);

    if (!hashes.length) {
        throw notFound({ message: "Refresh token not found", code: "TOKEN_NOT_FOUND" });
    }

    let match = false;
    for (const record of hashes) {
        if (await hashService.compare(refreshToken, record.token)) {
            match = true;
            break;
        }
    }

    if (!match) {
        throw notFound({ message: "Refresh token not found", code: "TOKEN_NOT_FOUND" });
    }

    return tokenService.revokeAllRefreshTokensByUserId(decoded.id);
};

module.exports = {
    login,
    refreshAccessToken,
    logout,
    logoutAll,
};