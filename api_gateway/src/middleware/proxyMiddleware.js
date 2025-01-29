const { createProxyMiddleware } = require('http-proxy-middleware');
const LoadBalancer = require('../services/LoadBalancer');

const createServiceProxy = (serviceName, serviceConfig) => {
    const loadBalancer = new LoadBalancer(serviceConfig);

    return async (req, res, next) => {
        try {
            const target = loadBalancer.getNextInstance();
            console.log(`[${serviceName}] Routing request to: ${target}`);

            const proxy = createProxyMiddleware({
                target,
                changeOrigin: true,
                logger: console,
                pathRewrite: (path, req) => {
                    console.log(req.url)
                    // Use originalUrl to ensure the full path is preserved
                    const fullPath = req.originalUrl || req.url;
                    const rewrittenPath = fullPath.replace(
                        new RegExp(`^/api/v1/${serviceName}`),
                        `/api/v1/${serviceName}`
                    );
                    console.log(`[${serviceName}] Rewritten Path: ${rewrittenPath}`);
                    return rewrittenPath;
                },
                on: {
                    onProxyReq: (proxyReq, req) => {
                        console.log(`[${serviceName}] Proxying request to: ${proxyReq.getHeader('host')}${proxyReq.path}`);
                    },
                    onProxyRes: (proxyRes, req, res) => {
                        console.log(`[${serviceName}] Response received with status: ${proxyRes.statusCode}`);
                    },
                    onError: (err, req, res) => {
                        console.error(`[${serviceName}] Proxy error: ${err.message}`);
                        res.status(503).json({ error: `${serviceName} Service Unavailable` });
                    },
                },
                proxyTimeout: 5000, // Set timeout to 5 seconds
            });

            proxy(req, res, next); // Pass request to the proxy middleware
        } catch (error) {
            console.error(`[${serviceName}] Load balancer error: ${error.message}`);
            res.status(503).json({ error: `No available instances for ${serviceName}` });
        }
    };
};

module.exports = createServiceProxy;
