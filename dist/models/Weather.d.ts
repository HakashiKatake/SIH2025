import mongoose, { Document } from 'mongoose';
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
export declare const WeatherCache: mongoose.Model<IWeatherCache, {}, {}, {}, mongoose.Document<unknown, {}, IWeatherCache, {}, {}> & IWeatherCache & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const WeatherAlert: mongoose.Model<IWeatherAlert, {}, {}, {}, mongoose.Document<unknown, {}, IWeatherAlert, {}, {}> & IWeatherAlert & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Weather.d.ts.map