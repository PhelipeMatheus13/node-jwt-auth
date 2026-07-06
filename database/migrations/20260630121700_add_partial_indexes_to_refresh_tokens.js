exports.up = function (knex) {
    return knex.raw(`
        CREATE INDEX idx_refresh_tokens_expires_at
        ON refresh_tokens (expires_at)
        WHERE revoked_at IS NULL
    `)
    .then(() =>
        knex.raw(`
            CREATE INDEX idx_refresh_tokens_revoked_at
            ON refresh_tokens (revoked_at)
            WHERE revoked_at IS NOT NULL
        `)
    );
};

exports.down = function (knex) {
    return knex.raw(`DROP INDEX IF EXISTS idx_refresh_tokens_revoked_at`)
        .then(() => knex.raw(`DROP INDEX IF EXISTS idx_refresh_tokens_expires_at`));
};