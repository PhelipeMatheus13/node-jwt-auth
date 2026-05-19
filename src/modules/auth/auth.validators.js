const { body, validationResult } = require("express-validator");
const {unprocessable} = require("../../shared/errors/errors");


// Validations for user login
const validateLogin = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(unprocessable({
                message: 'Validation failed',
                details: errors.array()
            }));
        }
        next();
    }
];

module.exports = { validateLogin };