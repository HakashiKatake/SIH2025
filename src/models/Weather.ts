import mongoose, { Document, Schema } from 'mongoose';

// Weather data interface
export interface IWeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  description: string;
  icon: string;
  visibility: number;
  uvIndex?: number;
  feelsLike: number;
}

// Weather forecast interface
export interface IWeatherForecast {
  date: Date;
  weather: IWeatherData;
  precipitation: {
    probability: number;
    amount: number;
  };
  minTemp: number;
  maxTemp: number;
}

// Weather cache document interface
export interface IWeatherCache extends Document {
  locationKey: string;
  latitude: number;
  longitude: number;
  current: IWeatherData;
  forecast: IWeatherForecast[];
  farmingRecommendations: string[];
  agriculturalAdvisory: {
    irrigation: string;
    pestControl: string;
    harvesting: string;
    planting: string;
    generalAdvice: string;
    soilConditions: string;
    cropProtection: string;
  };
  cropPlanningAdvice: {
    cropType: string;
    recommendation: string;
    timing: string;
    priority: 'low' | 'medium' | 'high';
    weatherFactor: string;
  }[];
  cachedAt: Date;
  expiresAt: Date;
}

// Weather alert interface
export interface IWeatherAlert extends Document {
  userId: mongoose.Types.ObjectId;
  alertType: 'rain' | 'temperature' | 'wind' | 'humidity' | 'farming_activity';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
}

// Weather cache schema
const weatherCacheSchema = new Schema<IWeatherCache>({
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
const weatherAlertSchema = new Schema<IWeatherAlert>({
  userId: {
    type: Schema.Types.ObjectId,
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

export const WeatherCache = mongoose.model<IWeatherCache>('WeatherCache', weatherCacheSchema);
export const WeatherAlert = mongoose.model<IWeatherAlert>('WeatherAlert', weatherAlertSchema);