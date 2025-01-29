const express = require("express");
const AppError = require('./utils/AppError')
const { configureCors } = require('./config/corsConfig')
const Response = require('./utils/Response-Handler');
const rateLimiterMiddleware = require("./middleware/rate_limiting");
const helmet = require('helmet');
const { config } = require('./utils/Env-Utils');
const createServiceProxy = require('./middleware/proxyMiddleware');

const app = express();
// express middleware
app.use(configureCors());
app.use(express.json());
app.options(
    '/api',
    configureCors()
)
app.use(rateLimiterMiddleware);
app.use(helmet());

// Registering proxies for each services dyamically
// Object.entries(config.services).forEach(([serviceName, serviceConfig]) => {
//     app.use(`/api/v1/${serviceConfig.prefix}`, createServiceProxy(serviceName, serviceConfig.instances));
//     console.log(`[API Gateway] Proxy set up for /api/v1/${serviceName}`);
// })
app.use('/api/v1/auth', (req, res, next) => {
    console.log("Passing to proxy...");
    next();
});
Object.entries(config.services).forEach(([serviceName, serviceConfig]) => {
    app.use(`/api/v1/${serviceName}`, createServiceProxy(serviceName, serviceConfig.instances));
    console.log(`[API Gateway] Proxy set up for /api/v1/${serviceName}`);
});


// Handling error for route not found
app.use("*", (req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404, true, "ROUTE_NOTE_FOUND"))
})



// Global Error handler
app.use(Response.sendError);

module.exports = app;