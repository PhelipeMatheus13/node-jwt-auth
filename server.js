const app = require("./app");
const { checkConnection } = require("./config/database");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    console.log("Connecting to database...");
    const isConnected = await checkConnection();

    if (!isConnected) {
        console.error("❌ Failed to connect to database. Exiting...");
        process.exit(1);
    }

    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};

startServer();