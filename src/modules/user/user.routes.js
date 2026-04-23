const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const checkToken = require("../../shared/middlewares/auth.middleware");

router.get("/:id", checkToken, userController.getUser);

module.exports = router;