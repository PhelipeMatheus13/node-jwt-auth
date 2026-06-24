exports.up = function(knex) {
    return knex.schema.table("refresh_tokens", (table) => {
        table
            .timestamp("revoked_at")
            .nullable()
            .defaultTo(null);
    });
};

exports.down = function(knex) {
    return knex.schema.table("refresh_tokens", (table) => {
        table.dropColumn("revoked_at");
    });
};