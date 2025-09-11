import axios from "axios";
import mongoose from "mongoose";
import { config } from "../utils/config";
import {
  WeatherCache,
  WeatherAlert,
  IWeatherData,
  IWeatherForecast,
} from "../models/Weather";
import { User } from "../models/User";
import { createRedisClient, weatherCache } from "../utils/cache";
import {
  CircuitBreaker,
  withTimeout,
  getWeatherFallbackData,
} from "../utils/gracefulDegradation";
import { ExternalServiceError } from "../middleware/errorHandler";

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

class WeatherService {
  private redis = createRedisClient();
  private readonly CACHE_DURATION = 3600; // 1 hour in seconds
  private readonly ALERT_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private weatherApiCircuitBreaker = new CircuitBreaker(3, 30000); // 3 failures, 30s recovery

  /**
   * Get weather forecast for a location with graceful degradation
   */
  async getForecast(location: GeoLocation): Promise<WeatherResponse> {
    const locationKey = `${location.latitude.toFixed(
      4
    )},${location.longitude.toFixed(4)}`;

    try {
      // Check cache first
      const cachedData = await this.getCachedWeather(locationKey);
      if (cachedData && !this.isCacheExpired(cachedData.cachedAt)) {
        return {
          location,
          current: cachedData.current,
          forecast: cachedData.forecast,
          farmingRecommendations: cachedData.farmingRecommendations,
          cachedAt: cachedData.cachedAt,
        };
      }

      // Use circuit breaker for API calls
      const weatherData = await this.weatherApiCircuitBreaker.execute(
        () => this.fetchWeatherFromAPI(location),
        () => Promise.resolve(this.getFallbackWeatherData(location, cachedData))
      );

      // Cache the data if it's not fallback data
      if (!weatherData.isFallback) {
        await this.cacheWeatherData(locationKey, location, weatherData);
      }

      return weatherData;
    } catch (error) {
      console.error("Weather service error:", error);

      // Try to return cached data even if expired
      const cachedData = await this.getCachedWeather(locationKey);
      if (cachedData) {
        console.log("Returning expired cached data due to service failure");
        return {
          location,
          current: cachedData.current,
          forecast: cachedData.forecast,
          farmingRecommendations: [
            ...cachedData.farmingRecommendations,
            "Weather data may be outdated due to service issues",
          ],
          cachedAt: cachedData.cachedAt,
        };
      }

      // Return fallback data as last resort
      return this.getFallbackWeatherData(location);
    }
  }

  /**
   * Get fallback weather data when API is unavailable
   */
  private getFallbackWeatherData(
    location: GeoLocation,
    cachedData?: any
  ): WeatherResponse {
    const fallbackData = getWeatherFallbackData(
      location.latitude,
      location.longitude
    );

    return {
      location,
      current: fallbackData.current,
      forecast: fallbackData.forecast,
      farmingRecommendations: fallbackData.farmingRecommendations,
      agriculturalAdvisory: {
        irrigation: "Weather data unavailable. Follow standard irrigation practices.",
        pestControl: "Weather data unavailable. Monitor conditions before application.",
        harvesting: "Weather data unavailable. Check crop maturity manually.",
        planting: "Weather data unavailable. Follow seasonal guidelines.",
        generalAdvice: "Weather service temporarily unavailable. Use local observations.",
        soilConditions: "Monitor soil moisture manually.",
        cropProtection: "Follow standard crop protection measures."
      },
      cropPlanningAdvice: [],
      cachedAt: new Date(),
      isFallback: true,
    };
  }

  /**
   * Fetch weather data from OpenWeather API with timeout
   */
  private async fetchWeatherFromAPI(
    location: GeoLocation
  ): Promise<WeatherResponse> {
    const { latitude, longitude } = location;

    try {
      // Fetch current weather with timeout
      const currentResponse = await withTimeout(
        () =>
          axios.get(`${config.weatherApi.baseUrl}/weather`, {
            params: {
              lat: latitude,
              lon: longitude,
              appid: config.weatherApi.key,
              units: "metric",
            },
            timeout: 5000,
          }),
        10000,
        "Weather API request timed out"
      );

      // Fetch 5-day forecast with timeout
      const forecastResponse = await withTimeout(
        () =>
          axios.get(`${config.weatherApi.baseUrl}/forecast`, {
            params: {
              lat: latitude,
              lon: longitude,
              appid: config.weatherApi.key,
              units: "metric",
            },
            timeout: 5000,
          }),
        10000,
        "Weather forecast API request timed out"
      );

      const current = this.parseCurrentWeather(currentResponse.data);
      const forecast = this.parseForecastWeather(forecastResponse.data);
      const farmingRecommendations = this.generateFarmingRecommendations(
        current,
        forecast
      );
      const agriculturalAdvisory = this.generateAgriculturalAdvisory(
        current,
        forecast
      );
      const cropPlanningAdvice = this.generateCropPlanningAdvice(
        current,
        forecast
      );

      return {
        location,
        current,
        forecast,
        farmingRecommendations,
        agriculturalAdvisory,
        cropPlanningAdvice,
        cachedAt: new Date(),
        isFallback: false,
      };
    } catch (error: any) {
      console.error("Weather API fetch error:", error);

      if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
        throw new ExternalServiceError(
          "Weather API",
          "Weather service is currently unavailable"
        );
      }

      if (error.response?.status === 401) {
        throw new ExternalServiceError(
          "Weather API",
          "Weather API authentication failed"
        );
      }

      if (error.response?.status === 429) {
        throw new ExternalServiceError(
          "Weather API",
          "Weather API rate limit exceeded"
        );
      }

      throw new ExternalServiceError(
        "Weather API",
        error.message || "Weather API request failed"
      );
    }
  }

  /**
   * Parse current weather data from OpenWeather API response
   */
  private parseCurrentWeather(data: any): IWeatherData {
    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || 0,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      visibility: data.visibility / 1000, // Convert to km
      uvIndex: data.uvi || undefined,
      feelsLike: Math.round(data.main.feels_like),
    };
  }

  /**
   * Parse forecast weather data from OpenWeather API response
   */
  private parseForecastWeather(data: any): IWeatherForecast[] {
    const forecasts: IWeatherForecast[] = [];
    const dailyData = new Map<string, any[]>();

    // Group forecast data by day
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split("T")[0];

      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, []);
      }
      dailyData.get(dateKey)!.push(item);
    });

    // Process first 3 days
    let dayCount = 0;
    for (const [dateKey, dayItems] of dailyData) {
      if (dayCount >= 3) break;

      const midDayItem = dayItems[Math.floor(dayItems.length / 2)];
      const temps = dayItems.map((item) => item.main.temp);

      forecasts.push({
        date: new Date(dateKey),
        weather: {
          temperature: Math.round(midDayItem.main.temp),
          humidity: midDayItem.main.humidity,
          pressure: midDayItem.main.pressure,
          windSpeed: midDayItem.wind?.speed || 0,
          windDirection: midDayItem.wind?.deg || 0,
          description: midDayItem.weather[0].description,
          icon: midDayItem.weather[0].icon,
          visibility: midDayItem.visibility / 1000,
          feelsLike: Math.round(midDayItem.main.feels_like),
        },
        precipitation: {
          probability: (midDayItem.pop || 0) * 100,
          amount: midDayItem.rain?.["3h"] || midDayItem.snow?.["3h"] || 0,
        },
        minTemp: Math.round(Math.min(...temps)),
        maxTemp: Math.round(Math.max(...temps)),
      });

      dayCount++;
    }

    return forecasts;
  }

  /**
   * Generate comprehensive farming recommendations based on weather data
   */
  private generateFarmingRecommendations(
    current: IWeatherData,
    forecast: IWeatherForecast[]
  ): string[] {
    const recommendations: string[] = [];

    // Temperature-based recommendations
    if (current.temperature > 35) {
      recommendations.push(
        "High temperature alert: Increase irrigation frequency and provide shade for sensitive crops"
      );
      recommendations.push(
        "Monitor crops for heat stress during peak afternoon hours (12-4 PM)"
      );
    } else if (current.temperature < 10) {
      recommendations.push(
        "Low temperature warning: Protect crops from frost and consider covering sensitive plants"
      );
      recommendations.push(
        "Use frost protection methods like mulching or row covers"
      );
    } else if (current.temperature >= 25 && current.temperature <= 30) {
      recommendations.push(
        "Optimal temperature for most crop activities - good time for field work"
      );
    }

    // Humidity recommendations
    if (current.humidity > 80) {
      recommendations.push(
        "High humidity: Monitor for fungal diseases and ensure good air circulation"
      );
      recommendations.push(
        "Avoid overhead irrigation to prevent disease spread"
      );
    } else if (current.humidity < 30) {
      recommendations.push(
        "Low humidity: Increase irrigation and consider mulching to retain soil moisture"
      );
      recommendations.push(
        "Water plants early morning or evening to reduce evaporation"
      );
    }

    // Rain predictions and irrigation advice
    const rainForecast = forecast.find((f) => f.precipitation.probability > 70);
    const heavyRainForecast = forecast.find((f) => f.precipitation.amount > 10);
    
    if (heavyRainForecast) {
      recommendations.push(
        "Heavy rain expected: Ensure proper drainage and postpone field activities"
      );
      recommendations.push(
        "Harvest ready crops before rain if possible"
      );
    } else if (rainForecast) {
      recommendations.push(
        "Rain expected: Postpone spraying activities and fertilizer application"
      );
      recommendations.push(
        "Good time for transplanting after rain stops"
      );
    } else if (forecast.every((f) => f.precipitation.probability < 20)) {
      recommendations.push(
        "Dry weather ahead: Plan irrigation schedule and check soil moisture levels"
      );
      recommendations.push(
        "Consider drought-resistant crop varieties for new plantings"
      );
    }

    // Wind recommendations
    if (current.windSpeed > 20) {
      recommendations.push(
        "Strong winds: Secure tall crops and avoid pesticide application"
      );
      recommendations.push(
        "Check greenhouse structures and irrigation systems"
      );
    } else if (current.windSpeed > 15) {
      recommendations.push(
        "Moderate winds: Good for natural pollination but avoid spraying"
      );
    } else if (current.windSpeed < 5) {
      recommendations.push(
        "Low wind conditions: Ideal for pesticide and fertilizer application"
      );
    }

    // UV Index recommendations
    if (current.uvIndex && current.uvIndex > 8) {
      recommendations.push(
        "High UV levels: Provide shade for sensitive crops and avoid midday field work"
      );
    }

    // Seasonal and general advice
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 2 && currentMonth <= 4) { // March-May
      recommendations.push(
        "Spring season: Good time for land preparation and summer crop sowing"
      );
    } else if (currentMonth >= 5 && currentMonth <= 8) { // June-September
      recommendations.push(
        "Monsoon season: Focus on kharif crops and water management"
      );
    } else if (currentMonth >= 9 && currentMonth <= 11) { // October-December
      recommendations.push(
        "Post-monsoon: Ideal for rabi crop sowing and harvest of kharif crops"
      );
    } else { // December-February
      recommendations.push(
        "Winter season: Focus on rabi crop management and harvest preparation"
      );
    }

    // Default recommendation if no specific conditions
    if (recommendations.length === 0) {
      recommendations.push(
        "Weather conditions are favorable for normal farming activities"
      );
    }

    return recommendations;
  }

  /**
   * Generate detailed agricultural advisory
   */
  private generateAgriculturalAdvisory(
    current: IWeatherData,
    forecast: IWeatherForecast[]
  ): any {
    const rainExpected = forecast.some(f => f.precipitation.probability > 60);
    const heavyRainExpected = forecast.some(f => f.precipitation.amount > 10);
    const dryPeriod = forecast.every(f => f.precipitation.probability < 20);
    const highTemp = current.temperature > 32;
    const lowHumidity = current.humidity < 40;
    const highWind = current.windSpeed > 15;

    return {
      irrigation: this.getIrrigationAdvice(current, rainExpected, dryPeriod, highTemp, lowHumidity),
      pestControl: this.getPestControlAdvice(current, rainExpected, highWind),
      harvesting: this.getHarvestingAdvice(current, forecast, rainExpected, heavyRainExpected),
      planting: this.getPlantingAdvice(current, forecast, rainExpected),
      generalAdvice: this.getGeneralAdvice(current, forecast),
      soilConditions: this.getSoilConditionsAdvice(current, rainExpected, dryPeriod),
      cropProtection: this.getCropProtectionAdvice(current, forecast, highTemp, highWind)
    };
  }

  private getIrrigationAdvice(current: IWeatherData, rainExpected: boolean, dryPeriod: boolean, highTemp: boolean, lowHumidity: boolean): string {
    if (rainExpected) {
      return "Reduce irrigation as rain is expected. Check soil drainage to prevent waterlogging.";
    }
    if (dryPeriod && (highTemp || lowHumidity)) {
      return "Increase irrigation frequency due to dry conditions and high evaporation. Water early morning or evening.";
    }
    if (current.humidity > 70) {
      return "Moderate irrigation needed. Soil moisture appears adequate. Avoid overwatering.";
    }
    return "Normal irrigation schedule recommended. Monitor soil moisture levels regularly.";
  }

  private getPestControlAdvice(current: IWeatherData, rainExpected: boolean, highWind: boolean): string {
    if (rainExpected) {
      return "Postpone pesticide application due to expected rain. Wait for dry conditions.";
    }
    if (highWind) {
      return "Avoid pesticide spraying due to strong winds. Risk of drift and uneven application.";
    }
    if (current.windSpeed < 5 && current.humidity < 80) {
      return "Excellent conditions for pesticide application. Low wind and moderate humidity ideal.";
    }
    return "Good conditions for pest control activities. Monitor weather before application.";
  }

  private getHarvestingAdvice(current: IWeatherData, forecast: IWeatherForecast[], rainExpected: boolean, heavyRainExpected: boolean): string {
    if (heavyRainExpected) {
      return "Urgent: Harvest ready crops immediately before heavy rain. Risk of crop damage and quality loss.";
    }
    if (rainExpected) {
      return "Consider harvesting ready crops before rain. Ensure proper drying facilities.";
    }
    if (current.humidity < 60 && current.windSpeed < 15) {
      return "Excellent harvesting conditions. Low humidity ideal for crop drying and storage.";
    }
    return "Good harvesting weather. Ensure crops are properly dried before storage.";
  }

  private getPlantingAdvice(current: IWeatherData, forecast: IWeatherForecast[], rainExpected: boolean): string {
    if (rainExpected && current.temperature > 20 && current.temperature < 35) {
      return "Good time for planting. Expected rain will provide natural irrigation for new seedlings.";
    }
    if (current.temperature > 35) {
      return "Avoid planting in extreme heat. Wait for cooler conditions or provide shade protection.";
    }
    if (current.temperature < 15) {
      return "Cold conditions may affect germination. Consider protected cultivation or wait for warmer weather.";
    }
    return "Suitable conditions for planting. Ensure adequate soil preparation and irrigation.";
  }

  private getGeneralAdvice(current: IWeatherData, forecast: IWeatherForecast[]): string {
    const tempTrend = forecast.length > 0 ? 
      (forecast[0].weather.temperature > current.temperature ? "rising" : "falling") : "stable";
    
    return `Temperature ${tempTrend}. Monitor weather closely for next 3 days. Plan field activities accordingly.`;
  }

  private getSoilConditionsAdvice(current: IWeatherData, rainExpected: boolean, dryPeriod: boolean): string {
    if (rainExpected) {
      return "Soil moisture will improve with expected rain. Ensure proper drainage to prevent waterlogging.";
    }
    if (dryPeriod) {
      return "Soil may become dry. Consider mulching to retain moisture and reduce evaporation.";
    }
    if (current.temperature > 25 && current.temperature < 30) {
      return "Soil temperature optimal for root development. Good conditions for plant growth.";
    }
    return "Monitor soil moisture and temperature. Adjust irrigation and cultivation practices as needed.";
  }

  private getCropProtectionAdvice(current: IWeatherData, forecast: IWeatherForecast[], highTemp: boolean, highWind: boolean): string {
    if (highTemp && current.uvIndex && current.uvIndex > 7) {
      return "Provide shade protection for sensitive crops. High UV and temperature can cause stress.";
    }
    if (highWind) {
      return "Secure tall and climbing crops. Strong winds can cause physical damage and lodging.";
    }
    const hailRisk = forecast.some(f => f.weather.description.toLowerCase().includes('storm'));
    if (hailRisk) {
      return "Storm conditions possible. Consider protective covers for valuable crops.";
    }
    return "Normal crop protection measures sufficient. Monitor for pest and disease pressure.";
  }

  /**
   * Generate crop-specific planning advice
   */
  private generateCropPlanningAdvice(
    current: IWeatherData,
    forecast: IWeatherForecast[]
  ): any[] {
    const advice = [];
    const rainExpected = forecast.some(f => f.precipitation.probability > 60);
    const currentMonth = new Date().getMonth();
    
    // Rice advice
    if (rainExpected && current.temperature > 20 && current.temperature < 35) {
      advice.push({
        cropType: "Rice",
        recommendation: "Ideal conditions for rice transplanting. Expected rain will provide necessary water.",
        timing: "Next 2-3 days before rain",
        priority: "high",
        weatherFactor: "Upcoming rain and optimal temperature"
      });
    }

    // Wheat advice (winter crop)
    if (currentMonth >= 10 || currentMonth <= 2) {
      if (current.temperature < 25 && current.humidity > 50) {
        advice.push({
          cropType: "Wheat",
          recommendation: "Good conditions for wheat sowing and growth. Cool temperature favorable.",
          timing: "Current week",
          priority: "medium",
          weatherFactor: "Cool temperature and adequate humidity"
        });
      }
    }

    // Tomato advice
    if (current.temperature > 30 || (current.uvIndex && current.uvIndex > 7)) {
      advice.push({
        cropType: "Tomato",
        recommendation: "Protect tomato plants from heat stress. Provide shade and increase watering.",
        timing: "Immediate action required",
        priority: "high",
        weatherFactor: "High temperature and UV exposure"
      });
    }

    // Cotton advice (if applicable season)
    if (currentMonth >= 3 && currentMonth <= 6) {
      if (current.temperature > 25 && !rainExpected) {
        advice.push({
          cropType: "Cotton",
          recommendation: "Good conditions for cotton sowing. Ensure adequate irrigation setup.",
          timing: "This week",
          priority: "medium",
          weatherFactor: "Warm temperature and dry conditions"
        });
      }
    }

    // Sugarcane advice
    if (rainExpected && current.temperature > 25) {
      advice.push({
        cropType: "Sugarcane",
        recommendation: "Excellent time for sugarcane planting. Rain will help establishment.",
        timing: "Before expected rain",
        priority: "medium",
        weatherFactor: "Warm temperature and expected rainfall"
      });
    }

    // Vegetable crops general advice
    if (current.temperature < 30 && current.humidity > 40 && current.humidity < 80) {
      advice.push({
        cropType: "Leafy Vegetables",
        recommendation: "Favorable conditions for leafy vegetable cultivation. Good growth expected.",
        timing: "Current conditions",
        priority: "low",
        weatherFactor: "Moderate temperature and humidity"
      });
    }

    return advice;
  }

  /**
   * Generate farming alerts for a user
   */
  async generateFarmingAlerts(userId: string): Promise<FarmingAlert[]> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.location) {
        return [];
      }

      const location = {
        latitude: user.location.latitude,
        longitude: user.location.longitude,
      };

      const weather = await this.getForecast(location);
      const alerts: any[] = [];

      // Temperature alerts
      if (weather.current.temperature > 40) {
        alerts.push({
          userId: user._id as mongoose.Types.ObjectId,
          alertType: "temperature",
          title: "Extreme Heat Warning",
          message: `Temperature is ${weather.current.temperature}°C. Increase irrigation and provide shade for crops.`,
          severity: "critical",
          location,
          isActive: true,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + this.ALERT_DURATION),
        });
      }

      // Rain alerts
      const heavyRainForecast = weather.forecast.find(
        (f) => f.precipitation.probability > 80 && f.precipitation.amount > 10
      );
      if (heavyRainForecast) {
        alerts.push({
          userId: user._id as mongoose.Types.ObjectId,
          alertType: "rain",
          title: "Heavy Rain Alert",
          message: `Heavy rain expected on ${heavyRainForecast.date.toDateString()}. Ensure proper drainage and postpone field activities.`,
          severity: "high",
          location,
          isActive: true,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + this.ALERT_DURATION),
        });
      }

      // Wind alerts
      if (weather.current.windSpeed > 20) {
        alerts.push({
          userId: user._id as mongoose.Types.ObjectId,
          alertType: "wind",
          title: "Strong Wind Warning",
          message: `Wind speed is ${weather.current.windSpeed} km/h. Secure tall crops and avoid spraying.`,
          severity: "medium",
          location,
          isActive: true,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + this.ALERT_DURATION),
        });
      }

      // Save alerts to database
      const savedAlerts = await WeatherAlert.insertMany(alerts);

      return savedAlerts.map((alert) => ({
        id: (alert._id as mongoose.Types.ObjectId).toString(),
        type: alert.alertType,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        createdAt: alert.createdAt,
      }));
    } catch (error) {
      console.error("Error generating farming alerts:", error);
      return [];
    }
  }

  /**
   * Get active alerts for a user
   */
  async getUserAlerts(userId: string): Promise<FarmingAlert[]> {
    try {
      const alerts = await WeatherAlert.find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      return alerts.map((alert) => ({
        id: (alert._id as mongoose.Types.ObjectId).toString(),
        type: alert.alertType,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        createdAt: alert.createdAt,
      }));
    } catch (error) {
      console.error("Error fetching user alerts:", error);
      return [];
    }
  }

  /**
   * Cache weather data in MongoDB and Redis using enhanced caching service
   */
  private async cacheWeatherData(
    locationKey: string,
    location: GeoLocation,
    weatherData: WeatherResponse
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + this.CACHE_DURATION * 1000);

    try {
      // Cache in MongoDB
      await WeatherCache.findOneAndUpdate(
        { locationKey },
        {
          locationKey,
          latitude: location.latitude,
          longitude: location.longitude,
          current: weatherData.current,
          forecast: weatherData.forecast,
          farmingRecommendations: weatherData.farmingRecommendations,
          agriculturalAdvisory: weatherData.agriculturalAdvisory,
          cropPlanningAdvice: weatherData.cropPlanningAdvice,
          cachedAt: weatherData.cachedAt,
          expiresAt,
        },
        { upsert: true, new: true }
      );

      // Cache in Redis using enhanced weather cache service
      await weatherCache.setWeatherData(locationKey, weatherData);
      await weatherCache.setForecastData(locationKey, {
        forecast: weatherData.forecast,
        cachedAt: weatherData.cachedAt
      });
    } catch (error) {
      console.error("Error caching weather data:", error);
    }
  }

  /**
   * Get cached weather data using enhanced caching service
   */
  private async getCachedWeather(locationKey: string): Promise<any> {
    try {
      // Try enhanced Redis cache first
      const redisData = await weatherCache.getWeatherData(locationKey);
      if (redisData) {
        return redisData;
      }

      // Fallback to MongoDB
      const mongoData = await WeatherCache.findOne({ locationKey });
      if (mongoData) {
        // Cache in Redis for next time
        await weatherCache.setWeatherData(locationKey, mongoData);
        return mongoData;
      }

      return null;
    } catch (error) {
      console.error("Error getting cached weather:", error);
      return null;
    }
  }

  /**
   * Check if cache is expired
   */
  private isCacheExpired(cachedAt: Date): boolean {
    const now = new Date();
    const cacheAge = now.getTime() - cachedAt.getTime();
    return cacheAge > this.CACHE_DURATION * 1000;
  }

  /**
   * Get mock weather data as fallback
   */
  private getMockWeatherData(location: GeoLocation): WeatherResponse {
    const current: IWeatherData = {
      temperature: 28,
      humidity: 65,
      pressure: 1013,
      windSpeed: 8,
      windDirection: 180,
      description: "partly cloudy",
      icon: "02d",
      visibility: 10,
      feelsLike: 30,
    };

    const forecast: IWeatherForecast[] = [
      {
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        weather: { ...current, temperature: 30 },
        precipitation: { probability: 20, amount: 0 },
        minTemp: 22,
        maxTemp: 32,
      },
      {
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        weather: { ...current, temperature: 26, description: "light rain" },
        precipitation: { probability: 70, amount: 5 },
        minTemp: 20,
        maxTemp: 28,
      },
      {
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        weather: { ...current, temperature: 29 },
        precipitation: { probability: 10, amount: 0 },
        minTemp: 23,
        maxTemp: 31,
      },
    ];

    const farmingRecommendations = this.generateFarmingRecommendations(current, forecast);
    const agriculturalAdvisory = this.generateAgriculturalAdvisory(current, forecast);
    const cropPlanningAdvice = this.generateCropPlanningAdvice(current, forecast);

    return {
      location,
      current,
      forecast,
      farmingRecommendations,
      agriculturalAdvisory,
      cropPlanningAdvice,
      cachedAt: new Date(),
    };
  }

  /**
   * Invalidate cache for a location using enhanced caching service
   */
  async invalidateCache(location: GeoLocation): Promise<void> {
    const locationKey = `${location.latitude.toFixed(
      4
    )},${location.longitude.toFixed(4)}`;

    try {
      // Use enhanced cache service for invalidation
      await weatherCache.invalidateWeatherCache(locationKey);
      await WeatherCache.deleteOne({ locationKey });
    } catch (error) {
      console.error("Error invalidating weather cache:", error);
    }
  }
}

export const weatherService = new WeatherService();
