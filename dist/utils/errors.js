"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRedisError = exports.handleMongooseError = exports.DatabaseError = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class DatabaseError extends Error {
    constructor(message, statusCode = 500, code = 'DATABASE_ERROR') {
        super(message);
        this.name = 'DatabaseError';
        this.statusCode = statusCode;
        this.code = code;
    }
}
exports.DatabaseError = DatabaseError;
const handleMongooseError = (error) => {
    // Validation error
    if (error instanceof mongoose_1.default.Error.ValidationError) {
        const messages = Object.values(error.errors).map((err) => err.message);
        return new DatabaseError(`Validation failed: ${messages.join(', ')}`, 400, 'VALIDATION_ERROR');
    }
    // Duplicate key error
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return new DatabaseError(`${field} already exists`, 409, 'DUPLICATE_KEY_ERROR');
    }
    // Cast error (invalid ObjectId, etc.)
    if (error instanceof mongoose_1.default.Error.CastError) {
        return new DatabaseError(`Invalid ${error.path}: ${error.value}`, 400, 'CAST_ERROR');
    }
    // Connection error
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
        return new DatabaseError('Database connection failed', 503, 'CONNECTION_ERROR');
    }
    // Default error
    return new DatabaseError(error.message || 'Database operation failed', 500, 'DATABASE_ERROR');
};
exports.handleMongooseError = handleMongooseError;
const handleRedisError = (error) => {
    if (error.code === 'ECONNREFUSED') {
        return new DatabaseError('Redis connection refused', 503, 'REDIS_CONNECTION_ERROR');
    }
    if (error.code === 'ETIMEDOUT') {
        return new DatabaseError('Redis operation timed out', 503, 'REDIS_TIMEOUT_ERROR');
    }
    return new DatabaseError(error.message || 'Redis operation failed', 500, 'REDIS_ERROR');
};
exports.handleRedisError = handleRedisError;
//# sourceMappingURL=errors.js.map