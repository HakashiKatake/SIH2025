import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../utils/jwt';
import { User, IUser } from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
    }
  }
}

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
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
    const decoded: JWTPayload = verifyToken(token);
    
    // Find the user in database
    const user = await User.findById(decoded.userId);
    
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
    req.userId = (user._id as any).toString();
    
    next();
  } catch (error) {
    let errorCode = 'TOKEN_VERIFICATION_FAILED';
    let errorMessage = 'Token verification failed';
    
    if (error instanceof Error) {
      if (error.message === 'Token has expired') {
        errorCode = 'TOKEN_EXPIRED';
        errorMessage = 'Access token has expired';
      } else if (error.message === 'Invalid token') {
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

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded: JWTPayload = verifyToken(token);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
        req.userId = (user._id as any).toString();
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't fail on token errors
    next();
  }
};