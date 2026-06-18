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

const findUserById = async (id) => {
    const user = await userRepository.findById(id);
    if (!user) throw notFound({ message: "User not found" });
    return user;
};

const findUserByEmail = async (email) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw notFound({ message: "User not found" });
    return user;
};

const deleteUserById = async (id) => {
    const deletedRows = await userRepository.deleteById(id);

    if (deletedRows === 0) {
        throw notFound({ message: "User not found" });
    }
};

module.exports =  {
    createUser,
    findUserById,
    findUserByEmail,
    deleteUserById
};