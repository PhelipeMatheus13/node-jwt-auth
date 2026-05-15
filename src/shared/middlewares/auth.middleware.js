const jwt = require("jsonwebtoken");
const { unauthorized } = require("../../shared/errors/errors");

function checkToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return next(unauthorized({ message: "Access denied" }));
    }

    try {
        // Verify token
        const secret = process.env.SECRET;
        jwt.verify(token, secret);
        next(); // Continue to the next middleware or route handler
    } catch (err) {
        console.log(err);
        if (err.name === 'TokenExpiredError') {
           return next(unauthorized({ message: "Invalid expired", code: "TOKEN_EXPIRED" }));
        }
        return next(unauthorized({ message: "Invalid token", code: "INVALID_TOKEN" }));
    }
}

module.exports = checkToken;