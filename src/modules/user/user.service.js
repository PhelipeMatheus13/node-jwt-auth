const userRepository = require("./user.repository");
const hashService = require("../../shared/services/hash.service")


const createUser = async (data) => {
    const exists = await userRepository.existsByEmail(data.email);
    if (exists) {
        throw new Error("ALREADY_EXISTS");
    }

    // Hash the password before saving the user
    const hashedPassword = await hashService.hash(data.password);

    return userRepository.create({
        ...data,
        password: hashedPassword
    });
};

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
    createUser,
    findUserById,
    findUserByEmailWithPassword,
};