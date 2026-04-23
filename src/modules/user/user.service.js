const userRepository = require("./user.repository");

const emailExists = (email) => userRepository.existsByEmail(email);

const createUser = (data) => userRepository.create(data);

// internal  function for security: do not return the password hash
const removeSensitiveFields = (user) => {
    if (!user) return undefined; // fallback for non-existing users
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

const findUserById = async (id) => {
    const user = await userRepository.findById(id);
    return removeSensitiveFields(user);
};

// sensitive function, returns the password hash.
const findUserByEmailWithPassword = (email) => userRepository.findByEmail(email);

module.exports =  {
    emailExists,
    createUser,
    findUserById,
    findUserByEmailWithPassword,
};