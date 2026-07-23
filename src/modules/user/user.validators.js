const { body, validationResult } = require("express-validator");
const {unprocessable} = require("../../shared/errors/errors");

/**
 * Request validation middleware for user registration.
 *
 * Validates the required fields and returns validation errors
 * if any input does not meet the expected criteria.
 */
const validateRegister = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required").bail()
        .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required").bail()
        .normalizeEmail()
        .isEmail().withMessage("Please provide a valid email address"),

    body("password")
        .notEmpty().withMessage("Password is required").bail()
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long").bail()
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must contain at least one special character"),

    body("confirmPassword")
        .notEmpty().withMessage("Password confirmation is required").bail()
        .custom((value, { req }) => value === req.body.password).withMessage("Passwords do not match"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(unprocessable({
                message: "Validation failed",
                details: errors.array().map(error => ({
                    field: error.path,
                    message: error.msg,
                })),
            }));
        }
        next();
    }
];

module.exports = { validateRegister };