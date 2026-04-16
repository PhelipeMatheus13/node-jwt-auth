exports.up = function(knex) {
    return knex.schema.createTable("users", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("name", 255).notNullable();
        table.string("email", 254).notNullable().unique();
        table.string("password", 255).notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("users")
}