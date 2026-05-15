const asyncHandler = require("../../shared/utils/async.util");
const authService = require("./services/auth.service");
const { badRequest } = require("../../shared/errors/errors");

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await authService.login(email, password);
    res.status(200).json({
        success: true,
        data: { accessToken, refreshToken }
    });
});

const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw badRequest({ message: "Refresh token is required" }); 
    const accessToken = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({
        success: true,
        data: { accessToken }
    });
});

const logout = asyncHandler(async (req, res) =>  {
    const { refreshToken } = req.body;
    if (!refreshToken) throw badRequest({ message: "Refresh token is required" });
    await authService.logout(refreshToken);
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
});

const logoutAll = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw badRequest({ message: "Refresh token is required" });
    await authService.logoutAll(refreshToken);
    res.status(200).json({
        success: true,
        message: "Logged out from all devices"
    });
});

module.exports = {
    login,
    refreshToken,
    logout,
    logoutAll
};