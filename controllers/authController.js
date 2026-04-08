const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* Register user */ 
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email: email });
    if (userExists) {
        return res.status(422).json({ msg: "Email already in use, please choose another" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
        name,
        email,
        password: passwordHash,
    });

    try {
        await user.save(); // Save user in database
        return res.status(201).json({ msg: "User created successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: "Error creating user" });
    }
};

/* Login user */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(404).json({ msg: "User not found" });
    }

    // Check if password match
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
        return res.status(422).json({ msg: "Invalid password" });
    }

    try {
        const secret = process.env.SECRET;
        const token = jwt.sign({ id: user._id }, secret); // Create token
        return res.status(200).json({ msg: "User logged in successfully", token }); // Return token to client
    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: "Error trying to login" });
    }
};