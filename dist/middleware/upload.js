"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateImageUpload = exports.handleUploadError = exports.uploadSingleImage = void 0;
const multer_1 = __importDefault(require("multer"));
const errors_1 = require("../utils/errors");
// File filter for image validation
const fileFilter = (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
        // Allow common image formats
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new errors_1.DatabaseError('Only JPEG, PNG, and WebP images are allowed', 400, 'INVALID_FILE_TYPE'));
        }
    }
    else {
        cb(new errors_1.DatabaseError('Only image files are allowed', 400, 'INVALID_FILE_TYPE'));
    }
};
// Configure multer for memory storage (we'll upload directly to Cloudinary)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit as per requirements
        files: 1 // Single file upload
    },
    fileFilter
});
// Middleware for single image upload
exports.uploadSingleImage = upload.single('image');
// Error handling middleware for multer errors
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return next(new errors_1.DatabaseError('File size too large. Maximum size is 10MB', 400, 'FILE_TOO_LARGE'));
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return next(new errors_1.DatabaseError('Too many files. Only one file allowed', 400, 'TOO_MANY_FILES'));
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new errors_1.DatabaseError('Unexpected field name. Use "image" field', 400, 'UNEXPECTED_FIELD'));
        }
    }
    next(error);
};
exports.handleUploadError = handleUploadError;
// Validation middleware to ensure file exists
const validateImageUpload = (req, res, next) => {
    if (!req.file) {
        return next(new errors_1.DatabaseError('No image file provided', 400, 'NO_FILE_PROVIDED'));
    }
    // Additional validation
    if (!req.file.buffer || req.file.buffer.length === 0) {
        return next(new errors_1.DatabaseError('Empty file provided', 400, 'EMPTY_FILE'));
    }
    next();
};
exports.validateImageUpload = validateImageUpload;
//# sourceMappingURL=upload.js.map