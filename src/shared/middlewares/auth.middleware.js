const jwt = require("../services/jwt.service");
const { unauthorized, forbidden } = require("../../shared/errors/errors");

/**
 * JWT authentication middleware.
 *
 * Validates the access token from the Authorization header.
 * If the token is valid, attaches the user information to `req.user`.
 * Otherwise, throws a 401 Unauthorized error.
 */
const checkToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return next(unauthorized({ message: "Access denied" }));
    }

    try {
        const decoded = jwt.decodeAccessToken(token);
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (err) {
        console.log(err);
        next(err);
    }
}

/**
 * Role-based authorization middleware.
 *
 * It receives a list of allowed functions and checks if the user...
 * authenticated (`req.user`) has one of them. 
 * Otherwise throws an access denied error (403 Forbidden).
 *
 * @param {...string} roles - Functions authorized to access a route.
 */
const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        throw forbidden({ message: "Access denied" });
    }
    next();
};

module.exports = {
    checkToken,
    authorize
};