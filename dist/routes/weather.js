"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const weatherService_1 = require("../services/weatherService");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const response_1 = require("../utils/response");
const router = express_1.default.Router();
/**
 * GET /api/weather/forecast/:lat/:lon
 * Get weather forecast for specific coordinates
 */
router.get('/forecast/:lat/:lon', auth_1.authenticateToken, validation_1.validateWeatherCoordinates, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { lat, lon } = req.params;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const location = { latitude, longitude };
    const forecast = await weatherService_1.weatherService.getForecast(location);
    (0, response_1.sendSuccess)(res, forecast);
}));
/**
 * GET /api/weather/alerts
 * Get farming alerts for the authenticated user
 */
router.get('/alerts', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        throw new errorHandler_1.AppError('User authentication required', 401, 'UNAUTHORIZED');
    }
    const alerts = await weatherService_1.weatherService.getUserAlerts(userId);
    (0, response_1.sendSuccess)(res, alerts);
}));
/**
 * POST /api/weather/alerts/generate
 * Generate new farming alerts for the authenticated user
 */
router.post('/alerts/generate', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        throw new errorHandler_1.AppError('User authentication required', 401, 'UNAUTHORIZED');
    }
    const alerts = await weatherService_1.weatherService.generateFarmingAlerts(userId);
    (0, response_1.sendSuccess)(res, alerts);
}));
/**
 * GET /api/weather/forecast/user
 * Get weather forecast for the authenticated user's location
 */
router.get('/forecast/user', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        throw new errorHandler_1.AppError('User authentication required', 401, 'UNAUTHORIZED');
    }
    // Get user's location from database
    const { User } = await Promise.resolve().then(() => __importStar(require('../models/User')));
    const user = await User.findById(userId);
    if (!user || !user.location) {
        throw new errorHandler_1.AppError('User location not found. Please update your profile with location information.', 400, 'USER_LOCATION_NOT_FOUND');
    }
    const location = {
        latitude: user.location.latitude,
        longitude: user.location.longitude
    };
    const forecast = await weatherService_1.weatherService.getForecast(location);
    (0, response_1.sendSuccess)(res, forecast);
}));
/**
 * DELETE /api/weather/cache/:lat/:lon
 * Invalidate weather cache for specific coordinates (admin/testing purposes)
 */
router.delete('/cache/:lat/:lon', auth_1.authenticateToken, validation_1.validateWeatherCoordinates, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { lat, lon } = req.params;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const location = { latitude, longitude };
    await weatherService_1.weatherService.invalidateCache(location);
    (0, response_1.sendSuccess)(res, null);
}));
exports.default = router;
//# sourceMappingURL=weather.js.map