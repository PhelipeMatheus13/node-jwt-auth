const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const checkToken = require("../../shared/middlewares/auth.middleware");
const { validateRegister } = require("./user.validators");


router.post("/register", validateRegister, userController.register);
router.get("/:id", checkToken, userController.getUser);

module.exports = router;