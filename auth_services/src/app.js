const express = require("express");
// const { createBasicRateLimiter } = require('./middleware/rate_limiting')
const AppError = require('./utils/App-Error')
const { configureCors } = require('./config/coreConfig')
const Response = require('./utils/Response-Handler');
const morganMiddleware = require('./middleware/morgan_logger');
const compression = require("compression")
const helmet = require('helmet');
// const { RateLimiterRedis } = require('rate-limiter-flexible');
const { config } = require('./utils/Env-Utils')
// const { connectRedis } = require('./config/redisConfig');
const rateLimiterMiddleware = require('./middleware/rate_limiting')

const { routes } = require('./routes/index')
const app = express();



// Rate Limiting Middleware
app.use(async (req, res, next) => {
    try {
        await rateLimiterMiddleware.consume(req.ip); // Consume a point for the incoming IP
        next(); // Proceed if within the limit
    } catch (rateLimiterRes) {
        const retryAfter = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
        res.set('Retry-After', retryAfter); // Inform client when they can retry
        next(new AppError(429, `Too many requests. Please try again in ${retryAfter} seconds.`));
    }
});

// express middleware
app.use(configureCors());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static('public'))
// app.use(createBasicRateLimiter(100, 15 * 60 * 1000))
app.options(
    '/api',
    configureCors()
)


// response compression
app.use(compression());

// securing header
app.use(helmet());
// for logging 
app.use(morganMiddleware);

routes(app);

// Handling error for route not found
app.use("*", (req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404, true, "ROUTE_NOTE_FOUND"))
})

// intializing routes


// Global Error handler
app.use(Response.sendError);

module.exports = app;