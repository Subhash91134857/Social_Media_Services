const { createServer } = require("http");
const  app  = require("./src/app");
const { config } = require('./src/utils/Env-Utils');
const logger = require('./src/logger/winston_logger');
const { connectDB, closeDB } = require("./src/config/dbConfig")
const mongoose = require("mongoose");



process.on('uncaughtException', (err) => {
    console.log('💥 Uncaught Exception! Shutting down...');
    console.log(`name: ${err.name} message: ${err.message}`);
    console.log(err);
    process.exit(1);
});

let PORT = config.app.port;
app.set('port', PORT);
const server = createServer(app);


let DB_URL = config.database.url;
console.log(DB_URL);
const MAX_DB_CONNECTION_ATTEMPT = 3;
let dbAttempts = 0;
// start server
const start = async (DB_URL) => {
    logger.info("Starting server...");
    mongoose.connection.on("error", (error) => {
        logger.error(`MongoDB error: ${error.message}`);
        if (dbAttempts < MAX_DB_CONNECTION_ATTEMPT) {
            dbAttempts += 1;
            logger.warn(`Retrying MongoDB connection (${dbAttempts}/${MAX_DB_CONNECTION_ATTEMPT})...`);
            setTimeout(() => connectDB(DB_URL), 2000); // Retry after a short delay
        } else {
            logger.error("Max connection attempts reached. Exiting application...");
            process.exit(1);
        }
    });
    server.listen(PORT, () => connectDB(DB_URL));
}

// Event listener for server error
const onError = (error) => {
    if (error.syscall !== 'listen') throw error;
    const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

    // Handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            // console.log(`❌ ${bind} requires elevated privileges`);
            logger.error(`❌ ${bind} requires elevated privileges`)
            process.exit(1);
        case 'EADDRINUSE':
            PORT += 1;
            logger.error(`⚠️ ${bind} is already in use, trying ${PORT}`)
            server.listen(PORT);
            break;
        default:
            throw error;
    }
};

const onListening = () => {
    const address = server.address();
    const bind = typeof address === 'string' ? `pipe ${address}` : `port ${address.port}`;
    logger.info(`🚀 We are live on ${bind}`)
};

process.on('unhandledRejection', (err) => {
    console.log('🛑 Unhandled Rejection! Shutting down...');
    console.log(`error: ${err.name} message: ${err.message}`);
    console.log(err);
    server.close(() => {
        process.exit(1);
    });
});

start(DB_URL);
server.on('error', onError)
server.on('listening', onListening);