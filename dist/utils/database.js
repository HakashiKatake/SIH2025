"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeConnections = exports.connectRedis = exports.redisClient = exports.connectMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const redis_1 = require("redis");
const config_1 = require("./config");
const errors_1 = require("./errors");
const indexing_1 = require("./indexing");
// MongoDB connection
const connectMongoDB = async () => {
    try {
        await mongoose_1.default.connect(config_1.config.mongoUri);
        console.log('✅ MongoDB connected successfully');
        // Create essential indexes for optimal query performance
        try {
            await indexing_1.DatabaseIndexingService.createEssentialIndexes();
        }
        catch (indexError) {
            console.warn('⚠️ Warning: Some indexes could not be created:', indexError);
            // Don't fail startup for index creation issues
        }
        // Handle connection events
        mongoose_1.default.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });
    }
    catch (error) {
        const dbError = (0, errors_1.handleMongooseError)(error);
        console.error('❌ MongoDB connection failed:', dbError.message);
        process.exit(1);
    }
};
exports.connectMongoDB = connectMongoDB;
// Redis connection
exports.redisClient = (0, redis_1.createClient)({
    url: config_1.config.redisUrl,
});
const connectRedis = async () => {
    try {
        await exports.redisClient.connect();
        console.log('✅ Redis connected successfully');
        // Handle Redis events
        exports.redisClient.on('error', (error) => {
            console.error('❌ Redis connection error:', error);
        });
        exports.redisClient.on('disconnect', () => {
            console.warn('⚠️ Redis disconnected');
        });
        exports.redisClient.on('reconnecting', () => {
            console.log('🔄 Redis reconnecting...');
        });
    }
    catch (error) {
        const redisError = (0, errors_1.handleRedisError)(error);
        console.error('❌ Redis connection failed:', redisError.message);
        // Don't exit process for Redis failures - app can work without cache
        console.warn('⚠️ Continuing without Redis cache');
    }
};
exports.connectRedis = connectRedis;
// Graceful shutdown
const closeConnections = async () => {
    try {
        await mongoose_1.default.connection.close();
        console.log('✅ MongoDB connection closed');
        if (exports.redisClient.isOpen) {
            await exports.redisClient.quit();
            console.log('✅ Redis connection closed');
        }
    }
    catch (error) {
        console.error('❌ Error closing database connections:', error);
    }
};
exports.closeConnections = closeConnections;
// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, closing database connections...');
    await (0, exports.closeConnections)();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, closing database connections...');
    await (0, exports.closeConnections)();
    process.exit(0);
});
//# sourceMappingURL=database.js.map