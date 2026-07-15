const tokenRepository = require('./token.repository');

const deleteExpiredRefreshTokens = () => tokenRepository.deleteExpired();

const deleteRevokedRefreshTokensOlderThan = () => {
    const retentionHours = Number(process.env.RETENTION_HOURS_TOKEN_REVOKED) || 24;
    return tokenRepository.deleteRevokedOlderThan(retentionHours);
};

module.exports = {
    deleteExpiredRefreshTokens,
    deleteRevokedRefreshTokensOlderThan,
}; 