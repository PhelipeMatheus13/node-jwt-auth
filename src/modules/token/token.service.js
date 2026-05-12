const tokenRepository = require("./token.repository");

const saveRefreshToken = (data) => tokenRepository.create(data);
const revokeRefreshToken = (token) => tokenRepository.deleteByToken(token);
const revokeAllRefreshTokensByUserId = (userId) => tokenRepository.deleteAllByUserId(userId);
const listRefreshTokensByUserId = (userId) =>tokenRepository.listByUserId(userId);

module.exports = {
    saveRefreshToken,
    revokeRefreshToken,
    revokeAllRefreshTokensByUserId,
    listRefreshTokensByUserId,
};