const Redis = require("ioredis");

let redisClient;
const connectRedis = (url) => {
    redisClient = new Redis(url);


    redisClient.on('connect', () => {
        console.log("Connected to Redis successfully!");
    })

    redisClient.on('error', (err) => {
        console.log("Redis client error", err);
    })

    return redisClient;
}

module.exports = { connectRedis }