"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.asyncHandler = exports.globalErrorHandler = exports.ExternalServiceError = exports.AppError = void 0;
const errors_1 = require("../utils/errors");
const response_1 = require("../utils/response");
/**
 * Custom error class for application errors
 */
class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * External service error class
 */
class ExternalServiceError extends AppError {
    constructor(serviceName, message, statusCode = 502) {
        super(message, statusCode, 'EXTERNAL_SERVICE_ERROR');
        this.serviceName = serviceName;
        this.name = 'ExternalServiceError';
    }
}
exports.ExternalServiceError = ExternalServiceError;
/**
 * Global error handling middleware
 */
const globalErrorHandler = (error, req, res, next) => {
    // Log error for debugging
    console.error('Error occurred:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    // Handle different types of errors
    if (error instanceof AppError) {
        (0, response_1.sendError)(res, error.code, error.message, error.statusCode);
        return;
    }
    if (error instanceof errors_1.DatabaseError) {
        (0, response_1.sendError)(res, error.code, error.message, error.statusCode);
        return;
    }
    if (error instanceof ExternalServiceError) {
        (0, response_1.sendError)(res, error.code, `${error.serviceName} service unavailable: ${error.message}`, error.statusCode, { serviceName: error.serviceName });
        return;
    }
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        (0, response_1.sendError)(res, 'INVALID_TOKEN', 'Invalid authentication token', 401);
        return;
    }
    if (error.name === 'TokenExpiredError') {
        (0, response_1.sendError)(res, 'TOKEN_EXPIRED', 'Authentication token has expired', 401);
        return;
    }
    // Handle multer errors (file upload)
    if (error.name === 'MulterError') {
        let message = 'File upload error';
        let statusCode = 400;
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'File size too large';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Too many files uploaded';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected file field';
                break;
            default:
                message = error.message;
        }
        (0, response_1.sendError)(res, 'FILE_UPLOAD_ERROR', message, statusCode);
        return;
    }
    // Handle syntax errors (malformed JSON)
    if (error instanceof SyntaxError && 'body' in error) {
        (0, response_1.sendError)(res, 'INVALID_JSON', 'Invalid JSON in request body', 400);
        return;
    }
    // Default error response
    (0, response_1.sendError)(res, 'INTERNAL_ERROR', process.env.NODE_ENV === 'production'
        ? 'An internal server error occurred'
        : error.message, 500, process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined);
};
exports.globalErrorHandler = globalErrorHandler;
/**
 * Async error wrapper for route handlers
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
/**
 * 404 handler for unmatched routes
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
    next(error);
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map