const { getKnex } = require("../../shared/config/database");

// Writer
const create = async (data) => {
    const knex = getKnex();
    const [response] = await knex("refresh_tokens")
        .insert({
            token: data.token,
            user_id: data.userId,   
            expires_at: data.expiresAt
        })
        .returning("id");

    return response.id;
};

const deleteByToken = async (token) => {
    const knex = getKnex();
    return knex("refresh_tokens")
        .where({token: token})
        .del();
};

const deleteAllByUserId = async (userId) => {
    const knex = getKnex();
    return knex("refresh_tokens")
        .where({user_id: userId})
        .del();
}

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
    deleteByToken,
    deleteAllByUserId,
    // reader
    listByUserId,
};