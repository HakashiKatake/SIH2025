"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const response_1 = require("../utils/response");
const router = express_1.default.Router();
/**
 * POST /api/auth/register
 * Register a new user with role-specific profile
 */
router.post('/register', validation_1.validateUserRegistration, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, phone, password, role, profile, language, 
    // Legacy fields for backward compatibility
    name, location, preferredLanguage, farmSize, crops } = req.body;
    // Check if user already exists
    const existingUserQuery = {};
    if (phone) {
        existingUserQuery.phone = phone.trim();
    }
    if (email) {
        existingUserQuery.email = email.trim().toLowerCase();
    }
    if (Object.keys(existingUserQuery).length > 0) {
        const existingUser = await User_1.User.findOne({
            $or: [
                { phone: existingUserQuery.phone },
                { email: existingUserQuery.email }
            ].filter(Boolean)
        });
        if (existingUser) {
            throw new errorHandler_1.AppError('User with this email or phone number already exists', 409, 'USER_EXISTS');
        }
    }
    // Create new user with enhanced structure
    const userData = {
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
    }
    else if (name && location) {
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
        }
        else {
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
                crops: crops ? crops.map((crop) => crop.trim()) : [],
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
    const user = new User_1.User(userData);
    await user.save();
    // Generate tokens
    const tokenPayload = {
        userId: user._id.toString(),
        phone: user.phone,
        email: user.email,
        name: user.profile?.name || user.name || ''
    };
    const tokens = (0, jwt_1.generateTokens)(tokenPayload);
    (0, response_1.sendSuccess)(res, {
        user: user.toJSON(),
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
    }, 201);
}));
/**
 * POST /api/auth/login
 * Authenticate user with email or phone and return tokens
 */
router.post('/login', validation_1.validateUserLogin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, phone, password } = req.body;
    // Build query to find user by email or phone
    const loginQuery = {};
    if (email) {
        loginQuery.email = email.trim().toLowerCase();
    }
    if (phone) {
        loginQuery.phone = phone.trim();
    }
    if (!email && !phone) {
        throw new errorHandler_1.AppError('Email or phone number is required', 400, 'MISSING_CREDENTIALS');
    }
    // Find user by email or phone (include password for comparison)
    const user = await User_1.User.findOne({
        $or: [
            { email: loginQuery.email },
            { phone: loginQuery.phone }
        ].filter(Boolean)
    }).select('+password');
    if (!user || !user.isActive) {
        throw new errorHandler_1.AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }
    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new errorHandler_1.AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }
    // Generate tokens
    const tokenPayload = {
        userId: user._id.toString(),
        phone: user.phone,
        email: user.email,
        name: user.profile?.name || user.name || ''
    };
    const tokens = (0, jwt_1.generateTokens)(tokenPayload);
    (0, response_1.sendSuccess)(res, {
        user: user.toJSON(),
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
    });
}));
/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new errorHandler_1.AppError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
    }
    // Verify refresh token
    const decoded = (0, jwt_1.verifyToken)(refreshToken);
    // Find user to ensure they still exist and are active
    const user = await User_1.User.findById(decoded.userId);
    if (!user || !user.isActive) {
        throw new errorHandler_1.AppError('User not found or inactive', 401, 'INVALID_USER');
    }
    // Generate new tokens
    const tokenPayload = {
        userId: user._id.toString(),
        phone: user.phone,
        email: user.email,
        name: user.profile?.name || user.name || ''
    };
    const tokens = (0, jwt_1.generateTokens)(tokenPayload);
    (0, response_1.sendSuccess)(res, { tokens });
}));
/**
 * GET /api/auth/profile
 * Get current user profile (protected route)
 */
router.get('/profile', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not found in request', 401, 'USER_NOT_FOUND');
    }
    (0, response_1.sendSuccess)(res, { user: req.user.toJSON() });
}));
/**
 * PUT /api/auth/profile
 * Update current user profile (protected route)
 */
router.put('/profile', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('User not found in request', 401, 'USER_NOT_FOUND');
    }
    const allowedUpdates = ['name', 'email', 'location', 'preferredLanguage', 'farmSize', 'crops'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
        throw new errorHandler_1.AppError(`Invalid updates. Allowed fields: ${allowedUpdates.join(', ')}`, 400, 'INVALID_UPDATES');
    }
    // Apply updates
    updates.forEach(update => {
        if (req.body[update] !== undefined) {
            req.user[update] = req.body[update];
        }
    });
    await req.user.save();
    (0, response_1.sendSuccess)(res, { user: req.user.toJSON() });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map