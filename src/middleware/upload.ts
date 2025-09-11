import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { DatabaseError } from '../utils/errors';

// File filter for image validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    // Allow common image formats
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new DatabaseError('Only JPEG, PNG, and WebP images are allowed', 400, 'INVALID_FILE_TYPE'));
    }
  } else {
    cb(new DatabaseError('Only image files are allowed', 400, 'INVALID_FILE_TYPE'));
  }
};

// Configure multer for memory storage (we'll upload directly to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit as per requirements
    files: 1 // Single file upload
  },
  fileFilter
});

// Middleware for single image upload
export const uploadSingleImage = upload.single('image');

// Error handling middleware for multer errors
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new DatabaseError('File size too large. Maximum size is 10MB', 400, 'FILE_TOO_LARGE'));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return next(new DatabaseError('Too many files. Only one file allowed', 400, 'TOO_MANY_FILES'));
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new DatabaseError('Unexpected field name. Use "image" field', 400, 'UNEXPECTED_FIELD'));
    }
  }
  next(error);
};

// Validation middleware to ensure file exists
export const validateImageUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new DatabaseError('No image file provided', 400, 'NO_FILE_PROVIDED'));
  }
  
  // Additional validation
  if (!req.file.buffer || req.file.buffer.length === 0) {
    return next(new DatabaseError('Empty file provided', 400, 'EMPTY_FILE'));
  }
  
  next();
};