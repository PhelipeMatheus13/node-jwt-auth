const tokenRepository = require("./token.repository");

const saveRefreshToken = (data, trx = null) => tokenRepository.create(data, trx);
const revokeRefreshTokenById = (id, trx = null) => tokenRepository.revokeById(id, trx);
const revokeAllRefreshTokensByUserId = (userId) => tokenRepository.revokeAllByUserId(userId);
const findRefreshTokenByJti = (jti) => tokenRepository.findByJti(jti);

module.exports = {
    saveRefreshToken,
    revokeRefreshTokenById,
    revokeAllRefreshTokensByUserId,
    findRefreshTokenByJti
};