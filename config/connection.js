const mongoose = require("mongoose");

const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log("Connected to the database");
    } catch (err) {
        console.error("Error trying to connect:", err);
        process.exit(1);
    }
};

module.exports = connectDB;