const logger = require("../utils/logger");

/**
 * Global error handling middleware.
 *
 * Handles operational errors and returns standardized error responses.
 * Unexpected errors are logged and returned as a 500 Internal Server Error.
 */
const errorHandler = (err, req, res, next) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json(err.toJSON());
    }

    logger.error({ err }, "Unexpected error");
    return res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_ERROR",
            message: "Internal server error",
        },
    });
};

module.exports = errorHandler;
