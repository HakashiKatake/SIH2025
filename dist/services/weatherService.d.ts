import { IWeatherData, IWeatherForecast } from "../models/Weather";
export interface GeoLocation {
    latitude: number;
    longitude: number;
}
export interface WeatherResponse {
    location: GeoLocation;
    current: IWeatherData;
    forecast: IWeatherForecast[];
    farmingRecommendations: string[];
    agriculturalAdvisory?: {
        irrigation: string;
        pestControl: string;
        harvesting: string;
        planting: string;
        generalAdvice: string;
        soilConditions: string;
        cropProtection: string;
    };
    cropPlanningAdvice?: {
        cropType: string;
        recommendation: string;
        timing: string;
        priority: 'low' | 'medium' | 'high';
        weatherFactor: string;
    }[];
    cachedAt: Date;
    isFallback?: boolean;
}
export interface FarmingAlert {
    id: string;
    type: string;
    title: string;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    createdAt: Date;
}
declare class WeatherService {
    private redis;
    private readonly CACHE_DURATION;
    private readonly ALERT_DURATION;
    private weatherApiCircuitBreaker;
    /**
     * Get weather forecast for a location with graceful degradation
     */
    getForecast(location: GeoLocation): Promise<WeatherResponse>;
    /**
     * Get fallback weather data when API is unavailable
     */
    private getFallbackWeatherData;
    /**
     * Fetch weather data from OpenWeather API with timeout
     */
    private fetchWeatherFromAPI;
    /**
     * Parse current weather data from OpenWeather API response
     */
    private parseCurrentWeather;
    /**
     * Parse forecast weather data from OpenWeather API response
     */
    private parseForecastWeather;
    /**
     * Generate comprehensive farming recommendations based on weather data
     */
    private generateFarmingRecommendations;
    /**
     * Generate detailed agricultural advisory
     */
    private generateAgriculturalAdvisory;
    private getIrrigationAdvice;
    private getPestControlAdvice;
    private getHarvestingAdvice;
    private getPlantingAdvice;
    private getGeneralAdvice;
    private getSoilConditionsAdvice;
    private getCropProtectionAdvice;
    /**
     * Generate crop-specific planning advice
     */
    private generateCropPlanningAdvice;
    /**
     * Generate farming alerts for a user
     */
    generateFarmingAlerts(userId: string): Promise<FarmingAlert[]>;
    /**
     * Get active alerts for a user
     */
    getUserAlerts(userId: string): Promise<FarmingAlert[]>;
    /**
     * Cache weather data in MongoDB and Redis using enhanced caching service
     */
    private cacheWeatherData;
    /**
     * Get cached weather data using enhanced caching service
     */
    private getCachedWeather;
    /**
     * Check if cache is expired
     */
    private isCacheExpired;
    /**
     * Get mock weather data as fallback
     */
    private getMockWeatherData;
    /**
     * Invalidate cache for a location using enhanced caching service
     */
    invalidateCache(location: GeoLocation): Promise<void>;
}
export declare const weatherService: WeatherService;
export {};
//# sourceMappingURL=weatherService.d.ts.map