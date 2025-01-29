require('dotenv').config();

function getEnvVar(key, defaultValue = undefined, required = false) {
    const value = process.env[key];
    if (value === undefined) {
        if (required) {
            throw new Error(`Environment variable "${key}" is required but was not provided.`)
        }
        return defaultValue;
    }
    return value;
}

const config = {
    app: {
        isProduction: getEnvVar('NODE_ENV', 'development') === 'production',
        port: parseInt(getEnvVar('PORT', '3000'), 10), // Application port
        host: getEnvVar('HOST', '127.0.0.1'), // Application host
    },
    services: {
        auth: {
            instances: [
                'http://127.0.0.1:3001/'
            ],
            prefix: '/auth'
        },
        post: {
            instances: [
                'http://127.0.0.1:3002/'
            ],
            prefix: '/post'
        },
        payment: {
            instances: [
                'http://127.0.0.1:3003/'
            ],
            prefix: '/payment'
        }
    }
}

module.exports = { config };