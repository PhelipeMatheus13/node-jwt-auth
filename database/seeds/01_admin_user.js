const bcrypt = require("bcrypt");

exports.seed = async function(knex) {
  await knex("users").del();

  const password = "Admin@123";
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  await knex("users").insert({
    name: "Admin",
    email: "admin@example.com",
    password: hashedPassword,
    role: "admin",
  });
};