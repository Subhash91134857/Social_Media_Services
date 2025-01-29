const cors = require('cors');

const configureCors = () => {
    // 
    return cors({
        // which origin are allowed to access apis
        origin: (origin, callback) => {
            const allowedOrigins = [
                'http://localhost:3001',
                'http://localhost:3002',
                'http://localhost:3003',
                'http://localhost:3000'

                //  //local development
                // we can list custome domains here
            ]
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true)
            } else {
                callback(new Error("Not allowed by cors"))
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPDATE'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept-Version'
        ],
        exposedHeaders: [
            'X-Total-Count',
            'Content-Range'
        ],
        credentials: true,
        preflightContinue: false,
        maxAge: 600, // cache pre flight responses for 10mins, sending options request multiple times
        optionsSuccessStatus: 204
    })
}

module.exports = { configureCors };