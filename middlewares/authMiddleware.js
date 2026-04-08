const jwt = require("jsonwebtoken");

function checkToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ msg: "Access denied" });
    }

    try {
        // Verify token
        const secret = process.env.SECRET;
        jwt.verify(token, secret);
        next(); // Continue to the next middleware or route handler
    } catch (err) {
        console.log(err);
        return res.status(400).json({ msg: "Invalid token" });
    }
}

module.exports = checkToken;