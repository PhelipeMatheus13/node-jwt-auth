// starting point
// when running the command npm start, the package.json file that is already configured will run this file and start the server
require("dotenv").config({ quiet: true });
const app = require("./app");
const { checkConnection } = require("./shared/config/database");
const { startTokenCleanupJob, stopTokenCleanupJob } = require("./shared/jobs/tokenCleanup.job");
const logger  = require("./shared/utils/logger");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    logger.info("Connecting to database...");
    const isConnected = await checkConnection();

    if (!isConnected) {
        logger.error("❌ Failed to connect to database. Exiting...");
        process.exit(1);
    }

    logger.info("✅ Database connected successfully");

    startTokenCleanupJob();
    logger.info("🧹 Token cleanup job scheduled");

    const gracefulShutdown = () => {
        logger.info("Shutting down gracefully...");
        stopTokenCleanupJob();
        process.exit(0);
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

    app.listen(PORT, () => {
        logger.info(`🚀 Server running on port ${PORT}`);
    });
};

// execute the function 
startServer(); 