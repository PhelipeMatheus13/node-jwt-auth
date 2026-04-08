const User = require("../models/User");

// Get user by ID, Private route
exports.getUser = async (req, res) => {
    const id = req.params.id;

    // Check if user exists
    const user = await User.findById(id, "-password"); // Exclude password from the response
    if (!user) {
        return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json(user);
};