const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const {checkToken, authorize} = require("../../shared/middlewares/auth.middleware");
const { validateRegister } = require("./user.validators");

// TODO: add swagger documentation for user routes
router.post("/register", validateRegister, userController.register);
router.get("/:id", checkToken, authorize("admin", "user"), userController.getUser);

module.exports = router;