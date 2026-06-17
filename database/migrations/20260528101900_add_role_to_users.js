exports.up = function(knex) {
    return knex.schema.table("users", (table) => {
        table
            .enu("role", ["admin", "user"], {
                useNative: true, // Create real enum type in PostgreSQL
                enumName: "user_role_enum",
            })
            .notNullable()
            .defaultTo("user");
    });
};

exports.down = function(knex) {
    return knex.schema.table("users", (table) => {
        table.dropColumn("role");
    })
    .then(() => knex.raw('DROP TYPE IF EXISTS "user_role_enum"')); // Drop the enum type in PostgreSQL
};