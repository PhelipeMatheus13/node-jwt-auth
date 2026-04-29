const bcrypt = require("bcrypt");

const hash = async (value) => {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(value, salt);
}

const compare = async (value, hashedValue) => {
    return await bcrypt.compare(value, hashedValue);
}

module.exports = {
    hash,
    compare
}