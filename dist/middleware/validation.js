"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePagination = exports.validateObjectId = exports.validateRoadmapGeneration = exports.validateProductCreation = exports.validateChatQuery = exports.validateWeatherCoordinates = exports.validateUserLogin = exports.validateUserRegistration = exports.handleValidationErrors = void 0;
const { body, param, query, validationResult } = require('express-validator');
const response_1 = require("../utils/response");
/**
 * Handle validation errors from express-validator
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((error) => ({
            field: error.type === 'field' ? error.path : 'unknown',
            message: error.msg,
            value: error.type === 'field' ? error.value : undefined
        }));
        (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Invalid input data', 400, formattedErrors);
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
/**
 * Validation rules for user registration (enhanced for role-based registration)
 */
exports.validateUserRegistration = [
    // Either email or phone is required
    body()
        .custom((value, { req }) => {
        if (!req.body.email && !req.body.phone) {
            throw new Error('Either email or phone number is required');
        }
        return true;
    }),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please enter a valid email address'),
    body('phone')
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please enter a valid Indian phone number'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('role')
        .optional()
        .isIn(['farmer', 'dealer', 'admin'])
        .withMessage('Role must be farmer, dealer, or admin'),
    body('language')
        .optional()
        .isIn(['en', 'hi', 'ta', 'te', 'kn', 'ml', 'gu', 'mr', 'bn', 'pa'])
        .withMessage('Invalid language'),
    // Profile validation based on role
    body('profile')
        .optional()
        .isObject()
        .withMessage('Profile must be an object'),
    body('profile.name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('profile.location')
        .optional()
        .isObject()
        .withMessage('Location must be an object'),
    body('profile.location.address')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Address cannot exceed 200 characters'),
    body('profile.location.city')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('City cannot exceed 50 characters'),
    body('profile.location.state')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('State cannot exceed 50 characters'),
    body('profile.location.coordinates.latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    body('profile.location.coordinates.longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    // Dealer-specific validation
    body('profile.businessName')
        .if(body('role').equals('dealer'))
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Business name is required for dealers'),
    body('profile.businessType')
        .if(body('role').equals('dealer'))
        .optional()
        .isIn(['retailer', 'wholesaler', 'distributor', 'processor', 'exporter'])
        .withMessage('Invalid business type'),
    // Farmer-specific validation
    body('profile.farmSize')
        .optional()
        .isFloat({ min: 0.1, max: 10000 })
        .withMessage('Farm size must be between 0.1 and 10000 acres'),
    body('profile.crops')
        .optional()
        .isArray()
        .withMessage('Crops must be an array'),
    body('profile.experience')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Experience must be between 0 and 100 years'),
    // Legacy field validation for backward compatibility
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('location.latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    body('location.longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    body('preferredLanguage')
        .optional()
        .isIn(['en', 'hi', 'ta', 'te', 'kn', 'ml', 'gu', 'mr', 'bn', 'pa'])
        .withMessage('Invalid preferred language'),
    exports.handleValidationErrors
];
/**
 * Validation rules for user login (enhanced for email/phone login)
 */
exports.validateUserLogin = [
    // Either email or phone is required
    body()
        .custom((value, { req }) => {
        if (!req.body.email && !req.body.phone) {
            throw new Error('Either email or phone number is required');
        }
        return true;
    }),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please enter a valid email address'),
    body('phone')
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please enter a valid Indian phone number'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    exports.handleValidationErrors
];
/**
 * Validation rules for weather coordinates
 */
exports.validateWeatherCoordinates = [
    param('lat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    param('lon')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    exports.handleValidationErrors
];
/**
 * Validation rules for chat queries
 */
exports.validateChatQuery = [
    body('query')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Query must be between 1 and 1000 characters'),
    body('language')
        .optional()
        .isIn(['en', 'hi', 'ta', 'te', 'kn', 'ml', 'gu', 'mr', 'bn', 'pa'])
        .withMessage('Invalid language'),
    exports.handleValidationErrors
];
/**
 * Validation rules for product creation
 */
exports.validateProductCreation = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Product name must be between 1 and 100 characters'),
    body('category')
        .isIn(['crops', 'seeds', 'tools', 'fertilizers'])
        .withMessage('Category must be one of: crops, seeds, tools, fertilizers'),
    body('price')
        .isFloat({ min: 0.01 })
        .withMessage('Price must be greater than 0'),
    body('quantity')
        .isFloat({ min: 0.01 })
        .withMessage('Quantity must be greater than 0'),
    body('unit')
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Unit must be between 1 and 20 characters'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    body('location.latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    body('location.longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    exports.handleValidationErrors
];
/**
 * Validation rules for roadmap generation
 */
exports.validateRoadmapGeneration = [
    body('cropType')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Crop type must be between 1 and 50 characters'),
    body('location.latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    body('location.longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    body('plantingDate')
        .optional()
        .isISO8601()
        .withMessage('Planting date must be a valid ISO 8601 date'),
    exports.handleValidationErrors
];
/**
 * Validation rules for MongoDB ObjectId parameters
 */
const validateObjectId = (paramName = 'id') => [
    param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName} format`),
    exports.handleValidationErrors
];
exports.validateObjectId = validateObjectId;
/**
 * Validation rules for pagination
 */
exports.validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    exports.handleValidationErrors
];
//# sourceMappingURL=validation.js.map