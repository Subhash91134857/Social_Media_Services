const { createServer } = require("http");
const app = require("./src/app");
const { config } = require('./src/utils/Env-Utils');

process.on('uncaughtException', (err) => {
    console.log('💥 Uncaught Exception! Shutting down...');
    console.log(`name: ${err.name} message: ${err.message}`);
    console.log(err);
    process.exit(1);
});

let PORT = config.app.port;
app.set('PORT', PORT);
const server = createServer(app);

// Event listener for server error
const onError = (error) => {
    if (error.syscall !== 'listen') throw error;
    const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

    // Handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.log(`❌ ${bind} requires elevated privileges`);
            process.exit(1);
        case 'EADDRINUSE':
            PORT += 1;
            console.log(`⚠️ ${bind} is already in use, trying ${PORT}`);
            server.listen(PORT);
            break;
        default:
            throw error;
    }
};

const onListening = () => {
    const address = server.address();
    const bind = typeof address === 'string' ? `pipe ${address}` : `port ${address.port}`;
    console.log(`🚀 We are live on ${bind}`);
};

process.on('unhandledRejection', (err) => {
    console.log('🛑 Unhandled Rejection! Shutting down...');
    console.log(`error: ${err.name} message: ${err.message}`);
    console.log(err);
    server.close(() => {
        process.exit(1);
    });
});

server.listen(PORT);
server.on('error', onError)
server.on('listening', onListening);