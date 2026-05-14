require("dotenv").config();
const express = require("express");
const errorHandler = require("./shared/errors/error.middleware")

// Import routes
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/user/user.routes");

const app = express();

// Middleware for JSON
app.use(express.json());

// Public route
app.get("/", (req, res) => {
    res.status(200).json({ msg: "Welcome to the API" });
});

// config routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// handler for error
app.use(errorHandler);

module.exports = app; // Export the app for testing