const tokenCleanupService = require('../../../../src/modules/token/token.cleanup.service');
const tokenRepository = require('../../../../src/modules/token/token.repository');

jest.mock('../../../../src/modules/token/token.repository');

describe('Token cleanup service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('deleteExpiredRefreshTokens', () => {
        it('should throw an error if tokenRepository.deleteExpired fails', async () => {
            tokenRepository.deleteExpired.mockRejectedValue(new Error('Failed to delete expired tokens'));
            
            await expect(tokenCleanupService.deleteExpiredRefreshTokens())
                .rejects.toThrow('Failed to delete expired tokens');
        });

        it('should call tokenRepository.deleteExpired', async () => {
            tokenRepository.deleteExpired.mockResolvedValue(1);
        
            await tokenCleanupService.deleteExpiredRefreshTokens();

            expect(tokenRepository.deleteExpired).toHaveBeenCalled();
        });
    });

    describe('deleteRevokedRefreshTokensOlderThan', () => {
        it('should throw an error if tokenRepository.deleteRevokedOlderThan fails', async () => {
            tokenRepository.deleteRevokedOlderThan.mockRejectedValue(new Error('Failed to delete revoked tokens'));

            await expect(tokenCleanupService.deleteRevokedRefreshTokensOlderThan())
                .rejects.toThrow('Failed to delete revoked tokens');
        });
        
        it('should call tokenRepository.deleteRevokedOlderThan with the correct retention hours', async () => {
            const retentionHours = process.env.RETENTION_HOURS_TOKEN_REVOKED || 24;

            tokenRepository.deleteRevokedOlderThan.mockResolvedValue(1);
            await tokenCleanupService.deleteRevokedRefreshTokensOlderThan();

            expect(tokenRepository.deleteRevokedOlderThan)
                .toHaveBeenCalledWith(retentionHours);
        });
    }); 
});