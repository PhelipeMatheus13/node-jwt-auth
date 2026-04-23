const userService = require("./user.service");


// Private route, protected by authMiddleware
const getUser = async (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ msg: "User ID is required" });
    }

    try {
        const user = await userService.findUserById(id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ msg: "Internal server error" });
    }
};

module.exports = {
    getUser,
}