const hashService = require("./auth/hashService");
const jwtService = require("./auth/jwtService");
const userService = require("./userService");
const tokenService = require("./tokenService");

const registerUser = async (data) => {
    const exists = await userService.emailExists(data.email);
    if (exists) {
        throw new Error("ALREADY_EXISTS");
    }

    // Hash the password before saving the user
    const hashedPassword = await hashService.hashPassword(data.password);

    return userService.createUser({
        ...data,
        password: hashedPassword
    });
};

const login = async (email, password) => {
    // Find user by email, including password hash for validation
    const user = await userService.findUserByEmailWithPassword(email);
 
    // For security reasons, any errors will be treated as invalid here
    if (!user || !(await hashService.comparePassword(password, user.password))) {
        throw new Error("INVALID");
    }

    const accessToken = jwtService.generateAccessToken(user.id);
    const refreshToken = jwtService.generateRefreshToken(user.id);
    const decoded = jwtService.decodeRefreshToken(refreshToken);

    await tokenService.saveRefreshToken({
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(decoded.exp * 1000) 
    });

    return {
        accessToken,
        refreshToken
    };
};


const refreshAccessToken = async (refreshToken) => {
    let decoded;
    try {
        decoded = jwtService.decodeRefreshToken(refreshToken);
    } catch (err) {
        throw err;   
    }

    const exists = await tokenService.refreshTokenExists(refreshToken);
    if (!exists) {
        throw new Error("Refresh token not found or revoked");
    }

    return jwtService.generateAccessToken(decoded.id);
};


const logout = async (refreshToken) => {
    try {
        jwtService.decodeRefreshToken(refreshToken);
    } catch (err) {
        throw err;
    }

    const exists = await tokenService.refreshTokenExists(refreshToken);
    if (!exists) {
        throw new Error("NOT_FOUND");
    }

    return await tokenService.revokeRefreshToken(refreshToken);
};

module.exports = {
    registerUser,
    login,
    refreshAccessToken,
    logout,
};