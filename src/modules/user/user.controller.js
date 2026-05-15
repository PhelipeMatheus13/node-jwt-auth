const asyncHandler = require("../../shared/utils/async.util");
const userService = require("./user.service");
const {badRequest} = require("../../shared/errors/errors");

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    await userService.createUser({ name, email, password });
    res.status(201).json({
        success: true,
        message: 'User created successfully'
    });
});

// Private route, protected by auth.middleware
const getUser = asyncHandler(async (req, res) =>  {
    const id = req.params.id;
    if (!id) throw badRequest({ message: "User ID is required" });
    const user = await userService.findUserById(id);
    res.status(200).json({
        success: true,
        data: user,
    });
});

module.exports = {
    register,
    getUser,
}