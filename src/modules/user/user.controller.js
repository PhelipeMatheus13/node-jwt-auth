const asyncHandler = require("../../shared/utils/async.util");
const userService = require("./user.service");
const {badRequest, forbidden} = require("../../shared/errors/errors");
const { registerInputDTO, userOutputDTO } = require("./user.dtos");

const register = asyncHandler(async (req, res) => {
    const input = registerInputDTO(req.body);
    await userService.createUser(input);
    res.status(201).json({
        success: true,
        message: 'User created successfully'
    });
});

const getUser = asyncHandler(async (req, res) =>  {
    const id = req.params.id;
    if (!id) throw badRequest({ message: "User ID is required" });

    // Only allow access if the user is an admin or the owner of the data
    if (req.user.role !== 'admin' && req.user.id !== id) {
        throw forbidden({ message: "You can only access your own data" });
    }

    const user = await userService.findUserById(id);
    res.status(200).json({
        success: true,
        data: userOutputDTO(user),
    });
});

const deleteUser = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) throw badRequest({ message: "User ID is required" });

    if (req.user.role !== 'admin' && req.user.id !== id) {
        throw forbidden({ message: "You can only access your own data" });
    }

    await userService.deleteUserById(id);
    res.status(200).json({
        success: true,
        message: 'User deleted successfully'
    });
});

module.exports = {
    register,
    getUser,
    deleteUser
}