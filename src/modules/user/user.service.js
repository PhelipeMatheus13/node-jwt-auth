const userRepository = require("./user.repository");
const hashService = require("../../shared/services/hash.service");
const {alreadyExists, internal, notFound} = require("../../shared/errors/errors");

const createUser = async (data) => {
    const exists = await userRepository.existsByEmail(data.email);
    if (exists) throw alreadyExists({message: "Email already in use, please choose another"});
   
    // Hash the password before saving the user
    const hashedPassword = await hashService.hash(data.password);

    return userRepository.create({
        ...data,
        password: hashedPassword
    });
};

// internal  function for security: do not return the password hash
const removeSensitiveFields = (user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

const findUserById = async (id) => {
    const user = await userRepository.findById(id);
    if (!user) throw notFound({ message: "User not found" });
    return removeSensitiveFields(user);
};

// sensitive function, returns the password hash.
const findUserByEmailWithPassword = async (email) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw notFound({ message: "User not found" });
    return user;
};

module.exports =  {
    createUser,
    findUserById,
    findUserByEmailWithPassword,
};