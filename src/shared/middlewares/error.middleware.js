// Error handling middleware
// This middleware padronizes error responses and handles unexpected errors gracefully.
const errorHandler = (err, req, res, next) => {
    // check for a known error
    if (err.isOperational) {
        return res.status(err.statusCode).json(err.toJSON());
    }

    console.error('Unexpected error: ', err);
    return res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
        },
    });
};

module.exports = errorHandler;
