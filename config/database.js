require("dotenv").config();

const environment = process.env.NODE_ENV || "development";

const configurations = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: "./database/migrations",
    },
  },
  test: {
    client: "pg",
    connection: {
      host: "localhost",
      port: 5433,
      user: "test",
      password: "test",
      database: "jwtauth_test",
    },
    pool: { min: 1, max: 5 },
    migrations: {
      directory: "./database/migrations",
    },
  },
};

const config = configurations[environment];
if (!config) {
  throw new Error(`Unknown environment: ${environment}`);
}

const knex = require("knex")(config);
let _knex = knex;

const getKnex = () => _knex;
const setKnexInstance = (newKnex) => {
  _knex = newKnex;
};

const checkConnection = async () => {
  try {
    await _knex.raw("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return false;
  }
};

module.exports = {
  getKnex,
  setKnexInstance,
  checkConnection,
  config,
};