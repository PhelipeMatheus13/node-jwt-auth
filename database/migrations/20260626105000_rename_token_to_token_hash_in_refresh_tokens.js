exports.up = async function (knex) {
    await knex.schema.alterTable("refresh_tokens", (table) => {
        table.renameColumn("token", "token_hash");
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable("refresh_tokens", (table) => {
        table.renameColumn("token_hash", "token");
    });
};