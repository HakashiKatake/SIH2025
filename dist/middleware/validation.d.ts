import { Request, Response, NextFunction } from 'express';
/**
 * Handle validation errors from express-validator
 */
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validation rules for user registration (enhanced for role-based registration)
 */
export declare const validateUserRegistration: any[];
/**
 * Validation rules for user login (enhanced for email/phone login)
 */
export declare const validateUserLogin: any[];
/**
 * Validation rules for weather coordinates
 */
export declare const validateWeatherCoordinates: any[];
/**
 * Validation rules for chat queries
 */
export declare const validateChatQuery: any[];
/**
 * Validation rules for product creation
 */
export declare const validateProductCreation: any[];
/**
 * Validation rules for roadmap generation
 */
export declare const validateRoadmapGeneration: any[];
/**
 * Validation rules for MongoDB ObjectId parameters
 */
export declare const validateObjectId: (paramName?: string) => any[];
/**
 * Validation rules for pagination
 */
export declare const validatePagination: any[];
//# sourceMappingURL=validation.d.ts.map