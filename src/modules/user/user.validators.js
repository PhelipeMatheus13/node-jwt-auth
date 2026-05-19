const { body, validationResult } = require("express-validator");
const {unprocessable} = require("../../shared/errors/errors");

const validateRegister = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long")
        .trim(),

    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must contain at least one special character"),

    body("confirmPassword")
        .notEmpty().withMessage("Password confirmation is required")
        .custom((value, { req }) => value === req.body.password).withMessage("Passwords do not match"),

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

module.exports = { validateRegister };