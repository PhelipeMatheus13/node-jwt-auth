const tokenRepository = require("./token.repository");

const saveRefreshToken = (data, trx = null) => tokenRepository.create(data, trx);
const revokeRefreshToken = (token, trx = null) => tokenRepository.revokeByToken(token, trx);
const revokeAllRefreshTokensByUserId = (userId) => tokenRepository.revokeAllByUserId(userId);
const listRefreshTokensByUserId = (userId) => tokenRepository.listByUserId(userId);

module.exports = {
    saveRefreshToken,
    revokeRefreshToken,
    revokeAllRefreshTokensByUserId,
    listRefreshTokensByUserId,
};