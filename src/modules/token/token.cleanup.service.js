const tokenRepository = require('./token.repository');

const RETENTION_HOURS_TOKEN_REVOKED = process.env.RETENTION_HOURS_TOKEN_REVOKED || 24;

const deleteExpiredRefreshTokens = () => tokenRepository.deleteExpired();
const deleteRevokedRefreshTokensOlderThan = () => tokenRepository.deleteRevokedOlderThan(RETENTION_HOURS_TOKEN_REVOKED);

module.exports = {
    deleteExpiredRefreshTokens,
    deleteRevokedRefreshTokensOlderThan,
}; 