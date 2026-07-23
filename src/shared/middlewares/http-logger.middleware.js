const pinoHttp = require("pino-http");
const logger  = require("../utils/logger");

// easy to expand the list of ignored routes in the future
const IGNORED_ROUTES = ["/"];
 
/**
 * Express middleware that automatically logs every HTTP request/response,
 * reusing the application's shared Pino instance and its environment-based
 * configuration (level, transport, etc).
 */
const httpLogger = pinoHttp({
    // Use logger instance already configured
    logger, 

    // ignore "IGNORED_ROUTES" for logging
    autoLogging: {
        ignore: (req) => IGNORED_ROUTES.includes(req.url),
    },

    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
    },

    serializers: {
        req: (req) => ({
            method: req.method,
            url: req.url,
            userAgent: req.headers["user-agent"], // show where the request is coming from
        }),
        res: (res) => ({
            statusCode: res.statusCode,
        }),
    },
});

module.exports = httpLogger;