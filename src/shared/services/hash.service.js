const bcrypt = require("bcrypt");
const logger = require("../../shared/utils/logger");
const { internal } = require("../../shared/errors/errors");

const hash = async (value) => {
    try {
        const salt = await bcrypt.genSalt(12);
        return await bcrypt.hash(value, salt);
    } catch (error) {
        logger.error({ err: error }, "Bcrypt hashing error:");
        throw internal({ message: "Failed to process hash" });
    }
};

const compare = async (value, hashedValue) => {
    try {
        return await bcrypt.compare(value, hashedValue);
    } catch (error) {
        logger.error({ err: error }, "Bcrypt compare error:");
        throw internal({ message: "Failed to compare hash" });
    }
};

module.exports = { hash, compare };