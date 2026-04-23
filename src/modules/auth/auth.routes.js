const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { validateRegister, validateLogin } = require("./auth.validators");

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

module.exports = router;