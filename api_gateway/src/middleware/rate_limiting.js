const { RateLimiterMemory } = require('rate-limiter-flexible');


const rateLimiter = new RateLimiterMemory({
    points: 50,
    duration: 1
})

const rateLimiterMiddleware = (req, res, next) => {
    rateLimiter.consume(req.ip).then(() => {
        next();
    }).catch(() => {
        res.status(429).json({ erro: 'Too many requests' });
    })
}

module.exports = rateLimiterMiddleware;
