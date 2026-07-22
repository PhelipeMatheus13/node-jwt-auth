const express = require("express");
const httpLogger = require("./shared/middlewares/http-logger.middleware");
const errorHandler = require("./shared/middlewares/error.middleware");
const requestContextMiddleware = require("./shared/middlewares/request-context.middleware");

// Import routes
const swaggerRoutes = require("./shared/docs/swagger.routes");
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/user/user.routes");

const app = express();

// Log every incoming request/response
app.use(httpLogger);

// Add request context middleware to propagate requestId through async calls
app.use(requestContextMiddleware);

// Transform the body of the request into JSON
app.use(express.json());

// Public route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the API",
    });
});

// config routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/api-docs", swaggerRoutes);

// handler for error
app.use(errorHandler); 

module.exports = app; // Export the app for testing