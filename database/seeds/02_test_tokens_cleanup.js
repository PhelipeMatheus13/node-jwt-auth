const { randomUUID } = require("crypto");

exports.seed = async function(knex) {
    // clear table first
    await knex("refresh_tokens").del();

    // Get the admin user to associate tokens with
    const admin = await knex("users")
        .where({ email: "admin@example.com" })
        .first();

    if (!admin) {
        throw new Error("Admin user not found. Run the admin seed first.");
    }

    const now = new Date();
    const hoursAgo = (h) => new Date(now.getTime() - h * 60 * 60 * 1000);

    // 1. Two expired (non-revoked) tokens - these should be removed by deleteExpired
    const expiredTokens = [
        {
            token_hash: "expired_hash_1",
            user_id: admin.id,
            jti: randomUUID(),
            expires_at: hoursAgo(3),   // expired 3 hours ago
            revoked_at: null,
            created_at: hoursAgo(48),
        },
        {
            token_hash: "expired_hash_2",
            user_id: admin.id,
            jti: randomUUID(),
            expires_at: hoursAgo(5),
            revoked_at: null,
            created_at: hoursAgo(72),
        },
    ];

    // 2. Two revoked tokens older than 24 hours → removed by deleteRevokedOlderThan
    const revokedTokens = [
        {
            token_hash: "revoked_old_hash_1",
            user_id: admin.id,
            jti: randomUUID(),
            expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // expires in the future, but was revoked
            revoked_at: hoursAgo(26),
            created_at: hoursAgo(72),
        },
        {
            token_hash: "revoked_old_hash_2",
            user_id: admin.id,
            jti: randomUUID(),
            expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            revoked_at: hoursAgo(30),
            created_at: hoursAgo(96),
        },
    ];

    await knex("refresh_tokens").insert([...expiredTokens, ...revokedTokens]);
};