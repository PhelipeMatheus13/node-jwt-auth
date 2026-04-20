const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
    const secret = process.env.SECRET;
    return jwt.sign({ id: userId }, secret, { expiresIn: "15m" }); // 15 minutes
};

const generateRefreshToken =  (userId) => {
    const secret = process.env.REFRESH_SECRET || process.env.SECRET;
    return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });  // 7 days
}

const decodeRefreshToken = (token) => {
    const secret = process.env.REFRESH_SECRET || process.env.SECRET;
    try {
        return jwt.verify(token, secret); // returns { id, iat, exp } 
    } catch (err) {
        throw new Error('INVALID');
    }
};


module.exports = {
    generateAccessToken,
    generateRefreshToken,
    decodeRefreshToken
}