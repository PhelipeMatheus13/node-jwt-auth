const { PostgreSqlContainer } = require("@testcontainers/postgresql");
const knexBuilder = require("knex");
const path = require("path");

async function setupTestDatabase({ migrationDirectory }) {
    // defines a default value for the directory
    const directory = migrationDirectory || path.join(process.cwd(), "database", "migrations");

    // start the PostgreSQL container
    const container = await new PostgreSqlContainer("postgres:15-alpine") // light image for postgres
        .withDatabase("node_jwt_auth_local") 
        .withUsername("postgres") 
        .withPassword("mysecretpassword")
        .withExposedPorts(5432) 
        .start();

    // config knex - Creates an isolated Knex instance.
    // New instance: new pool, new configuration, new client pg
    const knex = knexBuilder({
        client: "pg",
        connection: {
            host: container.getHost(),
            port: container.getMappedPort(5432), // get the mapped port for PostgreSQL
            user: container.getUsername(),
            password: container.getPassword(),
            database: container.getDatabase(),
        },
        migrations: {
            directory: directory,
        },
    });

    // run migrations
    await knex.migrate.latest();

    // function for stopping the container and cleaning up resources
    const stop = async() => {
        await knex.destroy();   // close knex connection
        await container.stop(); // stop the container
    };

    // return the knex instance, container reference, and stop function for cleanup
    return { knex, container, stop };
}

module.exports = { setupTestDatabase };
