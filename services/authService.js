const bcrypt = require("bcrypt");
const User = require("../models/User");

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};

const createUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

module.exports = {
    hashPassword,
    comparePassword,
    findUserByEmail,
    createUser
};