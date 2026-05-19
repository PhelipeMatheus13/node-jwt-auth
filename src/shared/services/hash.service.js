const bcrypt = require("bcrypt");
const { internal } = require("../../shared/errors/errors");

const hash = async (value) => {
    try {
        const salt = await bcrypt.genSalt(12);
        return await bcrypt.hash(value, salt);
    } catch (err) {
        console.error("Bcrypt hashing error:", err);
        throw internal({ message: "Failed to process hash" });
    }
};

const compare = async (value, hashedValue) => {
    try {
        return await bcrypt.compare(value, hashedValue);
    } catch (err) {
        console.error("Bcrypt compare error:", err);
        throw internal({ message: "Failed to compare hash" });
    }
};

module.exports = { hash, compare };