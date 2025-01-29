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
    database: {
        url: getEnvVar('DATABASE_URL', "", true),
    },
    tokens: {
        accessToken: {
            secret: getEnvVar('ACCESS_TOKEN_SECRET', '', true), // Access token secret
            expiry: getEnvVar('ACCESS_TOKEN_EXPIRY', '15m'), // Access token expiry
        },
        refreshToken: {
            secret: getEnvVar('REFRESH_TOKEN_SECRET', '', true), // Refresh token secret
            expiry: getEnvVar('REFRESH_TOKEN_EXPIRY', '7d'), // Refresh token expiry
        },
        temporaryToken: {
            expiry: getEnvVar('USER_TEMPORARY_TOKEN_EXPIRY', '1h'), // Temporary token expiry
        },
    },
    brevo: {
        host: getEnvVar('MAILTRAP_SMTP_HOST', '', true),
        port: parseInt(getEnvVar("MAILTRAP_SMTP_PORT", '', true)),
        user: getEnvVar("MAILTRAP_SMTP_USER", '', true),
        pass: getEnvVar("MAILTRAP_SMTP_PASS", '', true),

    },
    Redis: {
        url: getEnvVar('REDIS_URL'),
    }
}

module.exports = { config };