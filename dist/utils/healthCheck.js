"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDatabaseHealth = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("./database");
const checkDatabaseHealth = async () => {
    const healthStatus = {
        status: 'healthy',
        services: {
            mongodb: { status: 'disconnected' },
            redis: { status: 'disconnected' }
        },
        timestamp: new Date().toISOString()
    };
    // Check MongoDB connection
    try {
        if (mongoose_1.default.connection.readyState === 1) {
            healthStatus.services.mongodb.status = 'connected';
        }
        else {
            healthStatus.services.mongodb.status = 'disconnected';
            healthStatus.services.mongodb.message = 'MongoDB not connected';
            healthStatus.status = 'unhealthy';
        }
    }
    catch (error) {
        healthStatus.services.mongodb.status = 'error';
        healthStatus.services.mongodb.message = error instanceof Error ? error.message : 'Unknown error';
        healthStatus.status = 'unhealthy';
    }
    // Check Redis connection
    try {
        if (database_1.redisClient.isOpen) {
            await database_1.redisClient.ping();
            healthStatus.services.redis.status = 'connected';
        }
        else {
            healthStatus.services.redis.status = 'disconnected';
            healthStatus.services.redis.message = 'Redis not connected';
            // Redis is optional, so don't mark overall status as unhealthy
        }
    }
    catch (error) {
        healthStatus.services.redis.status = 'error';
        healthStatus.services.redis.message = error instanceof Error ? error.message : 'Unknown error';
        // Redis is optional, so don't mark overall status as unhealthy
    }
    return healthStatus;
};
exports.checkDatabaseHealth = checkDatabaseHealth;
//# sourceMappingURL=healthCheck.js.map