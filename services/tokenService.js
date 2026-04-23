const tokenRepository = require("../repositories/tokenRepository");

const saveRefreshToken = (data) => tokenRepository.create(data);
const refreshTokenExists = (token) => tokenRepository.existsByToken(token);
const revokeRefreshToken = (token) => tokenRepository.deleteByToken(token);

module.exports = {
    saveRefreshToken,
    refreshTokenExists,
    revokeRefreshToken,
};