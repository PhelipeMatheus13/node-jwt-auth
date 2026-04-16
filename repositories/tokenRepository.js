const { getKnex } = require("../config/database");

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

// Reader
const existsByToken = async (token) => {
    const knex = getKnex();
    const result = await knex("refresh_tokens")
        .select("id")
        .where({ token })
        .first();

    return !!result;
};


module.exports = {
    // writer
    create,
    deleteByToken,
    // reader
    existsByToken,
};