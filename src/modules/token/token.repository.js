const { getKnex } = require("../../shared/config/database");

// Writer
const create = async (data, trx = null) => {
    const knex = trx || getKnex(); // Use the provided transaction or get a new knex instance
    const [response] = await knex("refresh_tokens")
        .insert({
            token: data.token,
            user_id: data.userId,   
            expires_at: data.expiresAt
        })
        .returning("id");

    return response.id;
};

const revokeByToken = async (token, trx = null) => {
    const knex = trx || getKnex();
    return knex("refresh_tokens")
        .where({token: token})
        .update({ revoked_at: knex.fn.now() });
}

const revokeAllByUserId = async (userId) => {
    const knex = getKnex();
    return knex("refresh_tokens")
        .where({user_id: userId})
        .update({ revoked_at: knex.fn.now() });
};

// Reader
const listByUserId = async (userId) => {
    const knex = getKnex();
    return knex("refresh_tokens")
        .select("token")
        .where({ user_id: userId })
        .where("expires_at", ">", knex.fn.now())
        .orderBy("created_at", "desc");
}

module.exports = {
    // writer
    create,
    revokeByToken,
    revokeAllByUserId,
    // reader
    listByUserId
};