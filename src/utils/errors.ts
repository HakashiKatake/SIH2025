import mongoose from 'mongoose';

export class DatabaseError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'DATABASE_ERROR') {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const handleMongooseError = (error: any): DatabaseError => {
  // Validation error
  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    return new DatabaseError(
      `Validation failed: ${messages.join(', ')}`,
      400,
      'VALIDATION_ERROR'
    );
  }

  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return new DatabaseError(
      `${field} already exists`,
      409,
      'DUPLICATE_KEY_ERROR'
    );
  }

  // Cast error (invalid ObjectId, etc.)
  if (error instanceof mongoose.Error.CastError) {
    return new DatabaseError(
      `Invalid ${error.path}: ${error.value}`,
      400,
      'CAST_ERROR'
    );
  }

  // Connection error
  if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
    return new DatabaseError(
      'Database connection failed',
      503,
      'CONNECTION_ERROR'
    );
  }

  // Default error
  return new DatabaseError(
    error.message || 'Database operation failed',
    500,
    'DATABASE_ERROR'
  );
};

export const handleRedisError = (error: any): DatabaseError => {
  if (error.code === 'ECONNREFUSED') {
    return new DatabaseError(
      'Redis connection refused',
      503,
      'REDIS_CONNECTION_ERROR'
    );
  }

  if (error.code === 'ETIMEDOUT') {
    return new DatabaseError(
      'Redis operation timed out',
      503,
      'REDIS_TIMEOUT_ERROR'
    );
  }

  return new DatabaseError(
    error.message || 'Redis operation failed',
    500,
    'REDIS_ERROR'
  );
};