const pino = require("pino");
const { getContext } = require("./request-context");

const isTest = process.env.NODE_ENV === "test";
const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Application-wide Pino logger instance.
 * Log level and output format adapt automatically based on NODE_ENV:
 * silent in tests, pretty-printed in development, raw JSON in production
 * (and any other unmapped environment, as a safe default)
 */
const logger = pino({
    // Set the log level based on the environment
    // Allows passing the log level via environment variable for testing purposes (userful for testing)
    level: process.env.LOG_LEVEL || (isTest ? "silent" : isDevelopment ? "debug" : "info"),
    // Use pino-pretty printing in development for better readability
    transport: isDevelopment
        ? {
            target: "pino-pretty",
            options: {
                colorize: true,
                customColors: "error:red,warn:yellow,info:green,debug:blue",
                translateTime: "SYS:dd-mm-yyyy HH:MM:ss", // Uses pt-BR format for date and time
                ignore: "pid,hostname",
                singleLine: true,
                errorLikeObjectKeys: ["err", "error"],
            },
        }
        // If it's not development, then just raw JSON
        : undefined,

    // Redact sensitive information from logs, including passwords and tokens
    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "req.body.password",
            "req.body.refreshToken",
            "password",
            "*.password",
        ],
        censor: "**REDACTED**",
    }, 
    
    // Must return a NEW object (not the live context reference) 
    // mixinMergeStrategy mutates whatever mixin returns, which would permanently
    // pollute the AsyncLocalStorage store with fields from any single log call. 
    // Now returns a fresh copy on each log call (dies shortly after being used in that specific log)
    mixin: () => {
        const context = getContext();
        return context ? { ...context } : {};
    },
});

module.exports = logger;