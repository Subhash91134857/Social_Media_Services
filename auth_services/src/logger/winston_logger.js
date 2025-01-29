const winston = require('winston');

// Define severity levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Set log level based on environment
const level = () => {
    const env = process.env.NODE_ENV || "development";
    const isDevelopment = env === "development";
    return isDevelopment ? "debug" : "warn";
};

// Define colors for each level
const colors = {
    error: "red",
    warn: "yellow",
    info: "blue",
    http: "magenta",
    debug: "white",
};
winston.addColors(colors);

// Define formats
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: "DD MMM, YYYY - HH:mm:ss:ms" }),
    winston.format.json() // No colorization for file logs
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "DD MMM, YYYY - HH:mm:ss:ms" }),
    winston.format.printf(
        (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
    )
);

// Define transports
const transports = [
    // Console transport with colorized logs
    new winston.transports.Console({
        format: consoleFormat,
    }),
    // File transport for error logs
    new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
        format: fileFormat,
    }),
    // File transport for info logs
    new winston.transports.File({
        filename: "logs/info.log",
        level: "info",
        format: fileFormat,
    }),
    // File transport for http logs
    new winston.transports.File({
        filename: "logs/http.log",
        format: winston.format.combine(
            winston.format(info => (info.level === "http" ? info : false))(),
            winston.format.json()
        ),
        level: "http",
    }),
];

// Create the logger
const logger = winston.createLogger({
    level: level(),
    levels,
    transports,
});

module.exports = logger;
