import express, { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { generateTokens, verifyToken, JWTPayload } from '../utils/jwt';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user with role-specific profile
 */
router.post('/register', validateUserRegistration, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    email,
    phone,
    password,
    role,
    profile,
    language,
    // Legacy fields for backward compatibility
    name,
    location,
    preferredLanguage,
    farmSize,
    crops
  } = req.body;

  // Check if user already exists
  const existingUserQuery: any = {};
  if (phone) {
    existingUserQuery.phone = phone.trim();
  }
  if (email) {
    existingUserQuery.email = email.trim().toLowerCase();
  }

  if (Object.keys(existingUserQuery).length > 0) {
    const existingUser = await User.findOne({
      $or: [
        { phone: existingUserQuery.phone },
        { email: existingUserQuery.email }
      ].filter(Boolean)
    });
    
    if (existingUser) {
      throw new AppError('User with this email or phone number already exists', 409, 'USER_EXISTS');
    }
  }

  // Create new user with enhanced structure
  const userData: Partial<IUser> = {
    password,
    role: role || 'farmer', // Default to farmer for backward compatibility
    language: language || preferredLanguage || 'en',
    isVerified: false,
    isActive: true
  };

  // Set email or phone
  if (email) {
    userData.email = email.trim().toLowerCase();
  }
  if (phone) {
    userData.phone = phone.trim();
  }

  // Handle profile data
  if (profile) {
    userData.profile = profile;
  } else if (name && location) {
    // Legacy support - convert old format to new profile structure
    if (role === 'dealer') {
      userData.profile = {
        name: name.trim(),
        businessName: name.trim(), // Default business name to user name
        businessType: 'retailer', // Default business type
        location: {
          address: location.address?.trim() || '',
          city: location.district?.trim() || '',
          state: location.state?.trim() || '',
          country: 'India',
          coordinates: {
            latitude: location.latitude || 0,
            longitude: location.longitude || 0
          }
        },
        serviceAreas: [],
        certifications: []
      };
    } else {
      // Default to farmer profile
      userData.profile = {
        name: name.trim(),
        farmSize: farmSize || undefined,
        location: {
          address: location.address?.trim() || '',
          city: location.district?.trim() || '',
          state: location.state?.trim() || '',
          country: 'India',
          coordinates: {
            latitude: location.latitude || 0,
            longitude: location.longitude || 0
          }
        },
        crops: crops ? crops.map((crop: string) => crop.trim()) : [],
        experience: 0,
        certifications: []
      };
    }

    // Keep legacy fields for backward compatibility
    userData.name = name.trim();
    userData.location = location;
    userData.preferredLanguage = preferredLanguage;
    userData.farmSize = farmSize;
    userData.crops = crops;
  }

  const user = new User(userData);
  await user.save();

  // Generate tokens
  const tokenPayload: JWTPayload = {
    userId: (user._id as any).toString(),
    phone: user.phone,
    email: user.email,
    name: user.profile?.name || user.name || ''
  };

  const tokens = generateTokens(tokenPayload);

  sendSuccess(res, {
    user: user.toJSON(),
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken
  }, 201);
}));

/**
 * POST /api/auth/login
 * Authenticate user with email or phone and return tokens
 */
router.post('/login', validateUserLogin, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, phone, password } = req.body;

  // Build query to find user by email or phone
  const loginQuery: any = {};
  if (email) {
    loginQuery.email = email.trim().toLowerCase();
  }
  if (phone) {
    loginQuery.phone = phone.trim();
  }

  if (!email && !phone) {
    throw new AppError('Email or phone number is required', 400, 'MISSING_CREDENTIALS');
  }

  // Find user by email or phone (include password for comparison)
  const user = await User.findOne({
    $or: [
      { email: loginQuery.email },
      { phone: loginQuery.phone }
    ].filter(Boolean)
  }).select('+password');
  
  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Compare password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Generate tokens
  const tokenPayload: JWTPayload = {
    userId: (user._id as any).toString(),
    phone: user.phone,
    email: user.email,
    name: user.profile?.name || user.name || ''
  };

  const tokens = generateTokens(tokenPayload);

  sendSuccess(res, {
    user: user.toJSON(),
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });
}));

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
  }

  // Verify refresh token
  const decoded: JWTPayload = verifyToken(refreshToken);
  
  // Find user to ensure they still exist and are active
  const user = await User.findById(decoded.userId);
  
  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', 401, 'INVALID_USER');
  }

  // Generate new tokens
  const tokenPayload: JWTPayload = {
    userId: (user._id as any).toString(),
    phone: user.phone,
    email: user.email,
    name: user.profile?.name || user.name || ''
  };

  const tokens = generateTokens(tokenPayload);

  sendSuccess(res, { tokens });
}));

/**
 * GET /api/auth/profile
 * Get current user profile (protected route)
 */
router.get('/profile', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not found in request', 401, 'USER_NOT_FOUND');
  }

  sendSuccess(res, { user: req.user.toJSON() });
}));

/**
 * PUT /api/auth/profile
 * Update current user profile (protected route)
 */
router.put('/profile', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not found in request', 401, 'USER_NOT_FOUND');
  }

  const allowedUpdates = ['name', 'email', 'location', 'preferredLanguage', 'farmSize', 'crops'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw new AppError(
      `Invalid updates. Allowed fields: ${allowedUpdates.join(', ')}`,
      400,
      'INVALID_UPDATES'
    );
  }

  // Apply updates
  updates.forEach(update => {
    if (req.body[update] !== undefined) {
      (req.user as any)[update] = req.body[update];
    }
  });

  await req.user.save();

  sendSuccess(res, { user: req.user.toJSON() });
}));

export default router;