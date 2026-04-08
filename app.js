require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

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

// string connection to the database
const dbConnection = process.env.MONGODB_URI;

mongoose.connect(dbConnection)
    .then(() => {
    app.listen(3000, () => {
        console.log("Connected to the database");
        console.log("Server running on port 3000");
    });
    })
    .catch((err) => console.log("Error trying to connect:", err));