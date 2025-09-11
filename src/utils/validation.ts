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
export const validateRegistration = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push({ field: 'name', message: 'Name is required and must be a string' });
  } else if (data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  } else if (data.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Name cannot exceed 100 characters' });
  }

  // Phone validation
  if (!data.phone || typeof data.phone !== 'string') {
    errors.push({ field: 'phone', message: 'Phone number is required and must be a string' });
  } else if (!/^[6-9]\d{9}$/.test(data.phone.trim())) {
    errors.push({ field: 'phone', message: 'Please enter a valid Indian phone number' });
  }

  // Email validation (optional)
  if (data.email && typeof data.email === 'string') {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
  }

  // Password validation
  if (!data.password || typeof data.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required and must be a string' });
  } else if (data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  // Location validation
  if (!data.location || typeof data.location !== 'object') {
    errors.push({ field: 'location', message: 'Location is required and must be an object' });
  } else {
    const { latitude, longitude, address, state, district } = data.location;

    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      errors.push({ field: 'location.latitude', message: 'Latitude must be a number between -90 and 90' });
    }

    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      errors.push({ field: 'location.longitude', message: 'Longitude must be a number between -180 and 180' });
    }

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      errors.push({ field: 'location.address', message: 'Address is required' });
    } else if (address.trim().length > 200) {
      errors.push({ field: 'location.address', message: 'Address cannot exceed 200 characters' });
    }

    if (!state || typeof state !== 'string' || state.trim().length === 0) {
      errors.push({ field: 'location.state', message: 'State is required' });
    } else if (state.trim().length > 50) {
      errors.push({ field: 'location.state', message: 'State cannot exceed 50 characters' });
    }

    if (!district || typeof district !== 'string' || district.trim().length === 0) {
      errors.push({ field: 'location.district', message: 'District is required' });
    } else if (district.trim().length > 50) {
      errors.push({ field: 'location.district', message: 'District cannot exceed 50 characters' });
    }
  }

  // Preferred language validation
  const validLanguages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'gu', 'mr', 'bn', 'pa'];
  if (!data.preferredLanguage || !validLanguages.includes(data.preferredLanguage)) {
    errors.push({ 
      field: 'preferredLanguage', 
      message: `Preferred language must be one of: ${validLanguages.join(', ')}` 
    });
  }

  // Farm size validation (optional)
  if (data.farmSize !== undefined) {
    if (typeof data.farmSize !== 'number' || data.farmSize < 0.1 || data.farmSize > 10000) {
      errors.push({ field: 'farmSize', message: 'Farm size must be a number between 0.1 and 10000 acres' });
    }
  }

  // Crops validation (optional)
  if (data.crops !== undefined) {
    if (!Array.isArray(data.crops)) {
      errors.push({ field: 'crops', message: 'Crops must be an array' });
    } else {
      data.crops.forEach((crop: any, index: number) => {
        if (typeof crop !== 'string' || crop.trim().length === 0) {
          errors.push({ field: `crops[${index}]`, message: 'Each crop must be a non-empty string' });
        } else if (crop.trim().length > 50) {
          errors.push({ field: `crops[${index}]`, message: 'Crop name cannot exceed 50 characters' });
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate user login data
 */
export const validateLogin = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Phone validation
  if (!data.phone || typeof data.phone !== 'string') {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  } else if (!/^[6-9]\d{9}$/.test(data.phone.trim())) {
    errors.push({ field: 'phone', message: 'Please enter a valid Indian phone number' });
  }

  // Password validation
  if (!data.password || typeof data.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Express middleware for validation
 */
export const validateRequest = (validationFn: (data: any) => ValidationResult) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validationFn(req.body);
    
    if (!result.isValid) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: result.errors
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
      return;
    }
    
    next();
  };
};