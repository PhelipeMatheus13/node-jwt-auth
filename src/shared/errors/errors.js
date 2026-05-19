class AppError extends Error {
    constructor({ statusCode = 500, code = 'INTERNAL_ERROR', message = 'Internal server error', details = null } = {}) {
        // super(message) initializes the parent class (Error), generating the "real" JS error with message and stack trace
        super(message); 
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;
        // captureStackTrace generates the stack trace and removes the internal frames from the AppError creation process
        // keeping the stack cleaner and more focused on the actual point of error in the application
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            success: false,
            error: {
                code: this.code,
                message: this.message,
                // Only add details to the object if this.details exists.
                ...(this.details && { details: this.details }),
            },
        };
    }
}

const badRequest = (options = {}) => new AppError({
    statusCode: 400,
    code: 'BAD_REQUEST',
    message: 'Bad request',
    ...options,
});

const unauthorized = (options = {}) => new AppError({
    statusCode: 401,
    code: 'UNAUTHORIZED',
    message: 'Authentication required',
    ...options,
});

const forbidden = (options = {}) => new AppError({
    statusCode: 403,
    code: 'FORBIDDEN',
    message: 'Access denied',
    ...options,
});

const notFound = (options = {}) => new AppError({
    statusCode: 404,
    code: 'NOT_FOUND',
    message: 'Resource not found', 
    ...options,
});

const conflict = (options = {}) => new AppError({
    statusCode: 409,
    code: 'CONFLICT',
    message: 'Resource conflict',
    ...options,
});

const alreadyExists = (options = {}) => new AppError({
    statusCode: 409,
    code: 'ALREADY_EXISTS',
    message: 'Resource already exists',
    ...options,
});

const unprocessable = (options = {}) => new AppError({
  statusCode: 422,
  code: 'VALIDATION_ERROR',
  message: 'Validation failed',
  ...options,
});

const internal = (options = {}) => new AppError({
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    ...options,
});

module.exports = {
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict,
    alreadyExists,
    unprocessable,
    internal,
};