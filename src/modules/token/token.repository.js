const { getKnex } = require("../../shared/config/database");

// Writer
const create = async (data, trx = null) => {
    const knex = trx || getKnex(); // Use the provided transaction or get a new knex instance
    const [response] = await knex("refresh_tokens")
        .insert({
            token_hash: data.tokenHash,
            user_id: data.userId,  
            jti: data.jti,
            expires_at: data.expiresAt
        })
        .returning("id");

    return response.id;
};

const revokeById = async (id, trx = null) => {
    const knex = trx || getKnex();
    return knex("refresh_tokens")
        .where({id: id})
        .whereNull("revoked_at")
        .update({ revoked_at: knex.fn.now() });
}

const revokeAllByUserId = async (userId) => {
    const knex = getKnex();
    return knex("refresh_tokens")
        .where({user_id: userId})
        .whereNull("revoked_at")
        .update({ revoked_at: knex.fn.now() });
};

// Reader
const findByJti = async (jti) => {
    const knex = getKnex();
    return knex("refresh_tokens")
        .select("id", "token_hash", "user_id", "jti", "expires_at", "created_at", "revoked_at")
        .where({ jti: jti })
        .first();
}

module.exports = {
    // writer
    create,
    revokeById,
    revokeAllByUserId,
    // reader
    findByJti
};