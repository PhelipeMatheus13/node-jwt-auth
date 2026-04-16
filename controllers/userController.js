const userService = require("../services/authService");


// Get user by ID, Private route
exports.getUser = async (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ msg: "User ID is required" });
    }

    // Check if user exists
    const user = await userService.findUserById(id);
    if (!user) {
        return res.status(404).json({ msg: "User not found" });
    }

    // destructuring (rest)
    const { password, ...userWithoutPassword } = user;

    return res.status(200).json(userWithoutPassword);
};