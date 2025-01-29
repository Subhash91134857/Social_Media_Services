const morgan = require('morgan');
const logger = require('../logger/winston_logger');
const { config } = require('../utils/Env-Utils');

// Stream object for morgan to use winston's http logger
const stream = {
    write: (message) => logger.http(message.trim()), // Logs HTTP requests to the `http` level
};

// Skip logging based on the environment
const skip = () => {
    const env = config.app.isProduction || "development";
    return env !== "development"; // Skip logging in production
};

// Setup morgan with the custom format
const morganMiddleware = morgan(
    ":remote-addr :method :url :status - :response-time ms", // Log format
    { stream, skip }
);

module.exports = morganMiddleware;
