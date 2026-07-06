// starting point
// when running the command npm start, the package.json file that is already configured will run this file and start the server
const app = require("./app");
const { checkConnection } = require("./shared/config/database");
const { startTokenCleanupJob, stopTokenCleanupJob } = require("./shared/jobs/tokenCleanup.job");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    console.log("Connecting to database...");
    const isConnected = await checkConnection();

    if (!isConnected) {
        console.error("❌ Failed to connect to database. Exiting...");
        process.exit(1);
    }

    console.log("✅ Database connected successfully");

    startTokenCleanupJob();
    console.log("🧹 Token cleanup job scheduled");

    const gracefulShutdown = () => {
        console.log("Shutting down gracefully...");
        stopTokenCleanupJob();
        process.exit(0);
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};

// execute the function 
startServer(); 