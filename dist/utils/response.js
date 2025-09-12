"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorResponse = exports.createSuccessResponse = exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, statusCode = 200) => {
    const response = {
        success: true,
        data,
        timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, code, message, statusCode = 400, details) => {
    const response = {
        success: false,
        error: {
            code,
            message,
            details,
        },
        timestamp: new Date().toISOString(),
        path: res.req?.originalUrl || res.req?.url || 'unknown',
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
// Helper functions for creating response objects (not sending them)
const createSuccessResponse = (data, message) => {
    return {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString(),
    };
};
exports.createSuccessResponse = createSuccessResponse;
const createErrorResponse = (code, message, details) => {
    return {
        success: false,
        error: {
            code,
            message,
            details,
        },
        timestamp: new Date().toISOString(),
    };
};
exports.createErrorResponse = createErrorResponse;
//# sourceMappingURL=response.js.map