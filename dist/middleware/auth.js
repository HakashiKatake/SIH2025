"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const User_1 = require("../models/User");
/**
 * Authentication middleware to verify JWT tokens
 */
const authenticateToken = async (req, res, next) => {
    try {
        const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
        if (!token) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'MISSING_TOKEN',
                    message: 'Access token is required'
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        // Verify the token
        const decoded = (0, jwt_1.verifyToken)(token);
        // Find the user in database
        const user = await User_1.User.findById(decoded.userId);
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_USER',
                    message: 'User not found or inactive'
                },
                timestamp: new Date().toISOString(),
                path: req.path
            });
            return;
        }
        // Attach user to request object
        req.user = user;
        req.userId = user._id.toString();
        next();
    }
    catch (error) {
        let errorCode = 'TOKEN_VERIFICATION_FAILED';
        let errorMessage = 'Token verification failed';
        if (error instanceof Error) {
            if (error.message === 'Token has expired') {
                errorCode = 'TOKEN_EXPIRED';
                errorMessage = 'Access token has expired';
            }
            else if (error.message === 'Invalid token') {
                errorCode = 'INVALID_TOKEN';
                errorMessage = 'Invalid access token';
            }
        }
        res.status(401).json({
            success: false,
            error: {
                code: errorCode,
                message: errorMessage
            },
            timestamp: new Date().toISOString(),
            path: req.path
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
        if (token) {
            const decoded = (0, jwt_1.verifyToken)(token);
            const user = await User_1.User.findById(decoded.userId);
            if (user && user.isActive) {
                req.user = user;
                req.userId = user._id.toString();
            }
        }
        next();
    }
    catch (error) {
        // For optional auth, we don't fail on token errors
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map