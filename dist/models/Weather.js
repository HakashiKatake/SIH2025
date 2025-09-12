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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherAlert = exports.WeatherCache = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Weather cache schema
const weatherCacheSchema = new mongoose_1.Schema({
    locationKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    current: {
        temperature: { type: Number, required: true },
        humidity: { type: Number, required: true },
        pressure: { type: Number, required: true },
        windSpeed: { type: Number, required: true },
        windDirection: { type: Number, required: true },
        description: { type: String, required: true },
        icon: { type: String, required: true },
        visibility: { type: Number, required: true },
        uvIndex: { type: Number },
        feelsLike: { type: Number, required: true }
    },
    forecast: [{
            date: { type: Date, required: true },
            weather: {
                temperature: { type: Number, required: true },
                humidity: { type: Number, required: true },
                pressure: { type: Number, required: true },
                windSpeed: { type: Number, required: true },
                windDirection: { type: Number, required: true },
                description: { type: String, required: true },
                icon: { type: String, required: true },
                visibility: { type: Number, required: true },
                uvIndex: { type: Number },
                feelsLike: { type: Number, required: true }
            },
            precipitation: {
                probability: { type: Number, required: true },
                amount: { type: Number, required: true }
            },
            minTemp: { type: Number, required: true },
            maxTemp: { type: Number, required: true }
        }],
    farmingRecommendations: [{ type: String }],
    agriculturalAdvisory: {
        irrigation: { type: String },
        pestControl: { type: String },
        harvesting: { type: String },
        planting: { type: String },
        generalAdvice: { type: String },
        soilConditions: { type: String },
        cropProtection: { type: String }
    },
    cropPlanningAdvice: [{
            cropType: { type: String, required: true },
            recommendation: { type: String, required: true },
            timing: { type: String, required: true },
            priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
            weatherFactor: { type: String, required: true }
        }],
    cachedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    }
});
// Weather alert schema
const weatherAlertSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    alertType: {
        type: String,
        enum: ['rain', 'temperature', 'wind', 'humidity', 'farming_activity'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    }
});
// Create indexes for better performance
weatherCacheSchema.index({ latitude: 1, longitude: 1 });
weatherCacheSchema.index({ cachedAt: -1 });
weatherCacheSchema.index({ expiresAt: 1 });
// Additional indexes for weather alerts
weatherAlertSchema.index({ userId: 1, isActive: 1 });
weatherAlertSchema.index({ createdAt: -1 });
weatherAlertSchema.index({ alertType: 1, isActive: 1 });
weatherAlertSchema.index({ severity: 1, isActive: 1 });
weatherAlertSchema.index({ userId: 1, alertType: 1, isActive: 1 });
weatherAlertSchema.index({ expiresAt: 1 });
exports.WeatherCache = mongoose_1.default.model('WeatherCache', weatherCacheSchema);
exports.WeatherAlert = mongoose_1.default.model('WeatherAlert', weatherAlertSchema);
//# sourceMappingURL=Weather.js.map