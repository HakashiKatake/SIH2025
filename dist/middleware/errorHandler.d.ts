import { Request, Response, NextFunction } from 'express';
/**
 * Custom error class for application errors
 */
export declare class AppError extends Error {
    statusCode: number;
    code: string;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, code?: string);
}
/**
 * External service error class
 */
export declare class ExternalServiceError extends AppError {
    serviceName: string;
    constructor(serviceName: string, message: string, statusCode?: number);
}
/**
 * Global error handling middleware
 */
export declare const globalErrorHandler: (error: Error, req: Request, res: Response, next: NextFunction) => void;
/**
 * Async error wrapper for route handlers
 */
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * 404 handler for unmatched routes
 */
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map