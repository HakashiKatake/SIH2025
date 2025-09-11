import express, { Request, Response } from 'express';
import { weatherService } from '../services/weatherService';
import { authenticateToken } from '../middleware/auth';
import { validateWeatherCoordinates } from '../middleware/validation';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';

const router = express.Router();

/**
 * GET /api/weather/forecast/:lat/:lon
 * Get weather forecast for specific coordinates
 */
router.get('/forecast/:lat/:lon', authenticateToken, validateWeatherCoordinates, asyncHandler(async (req: Request, res: Response) => {
  const { lat, lon } = req.params;
  
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  const location = { latitude, longitude };
  
  const forecast = await weatherService.getForecast(location);
  
  sendSuccess(res, forecast);
}));

/**
 * GET /api/weather/alerts
 * Get farming alerts for the authenticated user
 */
router.get('/alerts', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  
  if (!userId) {
    throw new AppError('User authentication required', 401, 'UNAUTHORIZED');
  }

  const alerts = await weatherService.getUserAlerts(userId);
  
  sendSuccess(res, alerts);
}));

/**
 * POST /api/weather/alerts/generate
 * Generate new farming alerts for the authenticated user
 */
router.post('/alerts/generate', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  
  if (!userId) {
    throw new AppError('User authentication required', 401, 'UNAUTHORIZED');
  }

  const alerts = await weatherService.generateFarmingAlerts(userId);
  
  sendSuccess(res, alerts);
}));

/**
 * GET /api/weather/forecast/user
 * Get weather forecast for the authenticated user's location
 */
router.get('/forecast/user', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  
  if (!userId) {
    throw new AppError('User authentication required', 401, 'UNAUTHORIZED');
  }

  // Get user's location from database
  const { User } = await import('../models/User');
  const user = await User.findById(userId);
  
  if (!user || !user.location) {
    throw new AppError(
      'User location not found. Please update your profile with location information.',
      400,
      'USER_LOCATION_NOT_FOUND'
    );
  }

  const location = {
    latitude: user.location.latitude,
    longitude: user.location.longitude
  };

  const forecast = await weatherService.getForecast(location);
  
  sendSuccess(res, forecast);
}));

/**
 * DELETE /api/weather/cache/:lat/:lon
 * Invalidate weather cache for specific coordinates (admin/testing purposes)
 */
router.delete('/cache/:lat/:lon', authenticateToken, validateWeatherCoordinates, asyncHandler(async (req: Request, res: Response) => {
  const { lat, lon } = req.params;
  
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  const location = { latitude, longitude };
  
  await weatherService.invalidateCache(location);
  
  sendSuccess(res, null);
}));

export default router;