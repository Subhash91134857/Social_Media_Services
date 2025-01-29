const mongoose = require("mongoose");
const logger = require("../logger/winston_logger");

const connectDB = async (DB_URL) => {
    try {
        const connectionInstance = await mongoose.connect(DB_URL, {

        });
        logger.info(`☘️ MongoDB Connected! Db host: ${connectionInstance.connection.host}`);
    } catch (error) {
        logger.error("MongoDB connection error: ", error);
        throw error;
    }
};

const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed gracefully.");
    } catch (error) {
        logger.error(`Error while closing MongoDB connection: ${error.message}`);
    }
};

module.exports = { connectDB, disconnectDB };
