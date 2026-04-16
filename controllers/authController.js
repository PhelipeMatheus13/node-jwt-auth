const authService = require("../services/authService");
const tokenService = require("../services/tokenService");

/* Register user */ 
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const exists = await authService.emailExists(email);
        if (exists) {
            return res.status(422).json({ msg: "Email already in use, please choose another" });
        }

        // Hash the password before saving the user
        const hashedPassword = await authService.hashPassword(password);
        
        await authService.createUser({
            name: name,
            email: email,
            password: hashedPassword
        });


        return res.status(201).json({ msg: "User created successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Server error while creating user" });
    }
};

/* Login user */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authService.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const passwordMatch = await authService.comparePassword(password, user.password);
        if (!passwordMatch) {
            return res.status(422).json({ msg: "Invalid password" });
        }

        // generate access and refresh tokens
        const accessToken = tokenService.generateAccessToken(user.id);
        const refreshToken = await tokenService.generateRefreshToken(user.id);

        return res.status(200).json({
            msg: "Login successful",
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Server error during login" });
    }
};

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ msg: "Refresh token is required" });
    }

    try {
        const decoded = await tokenService.verifyRefreshToken(refreshToken);
        const userId = decoded.id; 

        // generate a new access token
        const newAccessToken = tokenService.generateAccessToken(userId);

        return res.status(200).json({ accessToken: newAccessToken });
    } catch (err) {
        console.error(err);
        return res.status(403).json({ msg: err.message });
    }
};



exports.logout = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ msg: "Refresh token is required" });
    }

    try {
        // Checks if the token is valid (throws an error if it is not)
        const decoded = await tokenService.verifyRefreshToken(refreshToken);
        const userId = decoded.id;

        await tokenService.revokeRefreshToken(refreshToken);

        return res.status(200).json({ msg: "Logged out successfully" });
    } catch (err) {
        return res.status(400).json({ msg: err.message });
    }
};