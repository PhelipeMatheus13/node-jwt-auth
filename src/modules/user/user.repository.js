const { getKnex } = require("../../shared/config/database");

// Writer
const create = async (userData) => {
    const knex = getKnex();
    const [response] = await knex("users")
        .insert({
            name:  userData.name,
            email: userData.email,
            password: userData.password
        })
        .returning("id");

    return response.id;
};

const deleteById = async (id) => {
    const knex = getKnex();
    return knex("users")
        .where({ id })
        .del();
};

// Reader
const existsByEmail = async(email) => {
    const knex = getKnex();
    const result = await knex("users")
        .select("id")
        .where({ email })
        .first();

    return !!result;
};

const findByEmail = async(email) => {
    const knex = getKnex();
    return knex("users")
        .select("id", "name", "email", "password", "role", "created_at", "updated_at")
        .where({email: email})
        .first();
};

const findById = async(id) => {
    const knex = getKnex();
    return knex("users")
        .select("id", "name", "email", "password", "role", "created_at", "updated_at")
        .where({id: id})
        .first();
};

module.exports = {
    // Writer
    create,
    deleteById,
    // Reader
    existsByEmail,
    findByEmail,
    findById
};