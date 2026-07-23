const bcrypt = require("bcrypt");
const logger = require("../../shared/utils/logger");
const { internal } = require("../../shared/errors/errors");

const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(12);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        logger.error({ err: error }, "Bcrypt password hashing error");
        throw internal();
    }
};

const comparePassword = async (password, hash) => {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        logger.error({ err: error }, "Bcrypt password compare error");
        throw internal();
    }
};

module.exports = { hashPassword, comparePassword };