const authService = require("./services/auth.service");

// TODO: Refactor to use custom error classes (e.g., ConflictError, ValidationError)
// This will allow the controller to map errors to HTTP status codes cleanly.


/* Login user */
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const { accessToken, refreshToken } = await authService.login(email, password);

        return res.status(200).json({
            msg: "Login successful",
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.error(err);
        
        if (err.message === "INVALID") {
            return res.status(401).json({ msg: "Invalid email or password"});
        }

        return res.status(500).json({ msg: "Internal server error" });
    }
};

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ msg: "Refresh token is required" });
    }

    try {
        const newAccessToken = await authService.refreshAccessToken(refreshToken);

        return res.status(200).json({ accessToken: newAccessToken });
    } catch (err) {
        console.error(err);
        
        if (err.message === "INVALID") {
            return res.status(401).json({ msg: "Invalid or expired token, please login again"});
        }

        return res.status(500).json({ msg: "Internal server error" });
    }
};



exports.logout = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ msg: "Refresh token is required" });
    }

    try {
        await authService.logout(refreshToken);

        return res.status(200).json({ msg: "Logged out successfully" });
    } catch (err) {
        if (err.message === "NOT_FOUND") {
            return res.status(404).json({ msg: "Refresh token not found or revoked"});
        }

        return res.status(500).json({ msg: "Internal server error" });
    }
};