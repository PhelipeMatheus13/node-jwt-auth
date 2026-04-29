const userService = require("./user.service");

const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // ignore id returned by userRepository.createUser
        await userService.createUser({
            name: name,
            email: email,
            password: password
        });

        return res.status(201).json({ msg: "User created successfully" });
    } catch (err) {
        console.error(err);
        
        if (err.message === "ALREADY_EXISTS") {
            return res.status(409).json({ msg: "Email already in use, please choose another"});
        }

        return res.status(500).json({ msg: "Internal server error" });
    }
};

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
    register,
    getUser,
}