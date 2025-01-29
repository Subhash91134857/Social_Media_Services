// const rateLimit = require('express-rate-limit');
// const AppError = require('../utils/App-Error')
// const { RedisStore } = require('rate-limit-redis');
// const { redisClient } = require('../app');

// const createBasicRateLimiter = (maxRequests, time) => {
//     return rateLimit({
//         max: maxRequests,
//         windowMs: time,
//         message: 'Too many request, please try again later',
//         standardHeaders: true,
//         legacyHeaders: false,
//         keyGenerator: (req) => {
//             return req.clientIp || req.ip || req.headers['x-forwarded-for'] || 'unkonwn';
//         },
//         handler: (_, __, ___, options) => {
//             throw new AppError(
//                 options.statusCode || 500,
//                 `There are too many requests. You are only allowed ${options.max
//                 } requests per ${options.windowMs / 60000} minutes.`
//             );
//         },
//         store: new RedisStore({
//             sendCommand: (...args) => redisClient.sendCommand(...args),
//         })
//     })
// }

// module.exports = { createBasicRateLimiter }


// We are now using rate-limiter-flexible

const { connectRedis } = require('../config/redisConfig')
const { config } = require('../utils/Env-Utils')
const { RateLimiterRedis } = require('rate-limiter-flexible');
// Intialize redis client
const redisClient = connectRedis(config.Redis.url);
const rateLimiterMiddleware = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 10,
    duration: 1, // Time window in seconds (1 second)
    blockDuration: 60,
})

module.exports = rateLimiterMiddleware 