// This utility function is used to wrap asynchronous route handlers in Express
// making error handling more consistent and reducing code duplication(try-catch blocks)
// capturing any errors that occur in the asynchronous function and passing them to the next middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
