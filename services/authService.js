const bcrypt = require("bcrypt");
const userRepository = require("../repositories/userRepository")


const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

const findUserByEmail = (email) => userRepository.findByEmail(email);

const findUserById = (id) => userRepository.findById(id);

const createUser = (userData) => userRepository.create(userData);

const emailExists = (email) => userRepository.existsByEmail(email);


module.exports = {
    hashPassword,
    comparePassword,
    findUserById,
    findUserByEmail,
    createUser,
    emailExists
};