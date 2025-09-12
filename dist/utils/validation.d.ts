import { Request, Response, NextFunction } from 'express';
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
/**
 * Validation result interface
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}
/**
 * Validate user registration data
 */
export declare const validateRegistration: (data: any) => ValidationResult;
/**
 * Validate user login data
 */
export declare const validateLogin: (data: any) => ValidationResult;
/**
 * Express middleware for validation
 */
export declare const validateRequest: (validationFn: (data: any) => ValidationResult) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map