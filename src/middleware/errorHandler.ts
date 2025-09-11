import { Request, Response, NextFunction } from 'express';
import { DatabaseError } from '../utils/errors';
import { sendError } from '../utils/response';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * External service error class
 */
export class ExternalServiceError extends AppError {
  public serviceName: string;

  constructor(serviceName: string, message: string, statusCode: number = 502) {
    super(message, statusCode, 'EXTERNAL_SERVICE_ERROR');
    this.serviceName = serviceName;
    this.name = 'ExternalServiceError';
  }
}

/**
 * Global error handling middleware
 */
export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
    sendError(res, error.code, error.message, error.statusCode);
    return;
  }

  if (error instanceof DatabaseError) {
    sendError(res, error.code, error.message, error.statusCode);
    return;
  }

  if (error instanceof ExternalServiceError) {
    sendError(
      res, 
      error.code, 
      `${error.serviceName} service unavailable: ${error.message}`, 
      error.statusCode,
      { serviceName: error.serviceName }
    );
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    sendError(res, 'INVALID_TOKEN', 'Invalid authentication token', 401);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    sendError(res, 'TOKEN_EXPIRED', 'Authentication token has expired', 401);
    return;
  }

  // Handle multer errors (file upload)
  if (error.name === 'MulterError') {
    let message = 'File upload error';
    let statusCode = 400;

    switch ((error as any).code) {
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

    sendError(res, 'FILE_UPLOAD_ERROR', message, statusCode);
    return;
  }

  // Handle syntax errors (malformed JSON)
  if (error instanceof SyntaxError && 'body' in error) {
    sendError(res, 'INVALID_JSON', 'Invalid JSON in request body', 400);
    return;
  }

  // Default error response
  sendError(
    res,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'production' 
      ? 'An internal server error occurred' 
      : error.message,
    500,
    process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
  );
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};