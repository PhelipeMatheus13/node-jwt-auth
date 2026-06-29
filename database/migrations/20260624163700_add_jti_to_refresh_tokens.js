exports.up = function(knex) {
    return knex.schema.table("refresh_tokens", (table) => {
        table
            .uuid("jti")
            .notNullable()
            .unique();
    });
};

exports.down = function(knex) {
    return knex.schema.table("refresh_tokens", (table) => {
        table.dropColumn("jti");
    });
};