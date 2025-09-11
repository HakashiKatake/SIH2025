import { redisClient } from './database';
import { handleRedisError } from './errors';

// Export function to create Redis client for services
export const createRedisClient = () => redisClient;

export class CacheService {
  private static instance: CacheService;
  private defaultTTL = 3600; // 1 hour in seconds

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!redisClient.isOpen) {
        console.warn('⚠️ Redis not connected, cache miss for key:', key);
        return null;
      }

      const value = await redisClient.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      const cacheError = handleRedisError(error);
      console.error('❌ Cache get error:', cacheError.message);
      return null; // Graceful degradation
    }
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<boolean> {
    try {
      if (!redisClient.isOpen) {
        console.warn('⚠️ Redis not connected, skipping cache set for key:', key);
        return false;
      }

      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      const cacheError = handleRedisError(error);
      console.error('❌ Cache set error:', cacheError.message);
      return false; // Graceful degradation
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (!redisClient.isOpen) {
        console.warn('⚠️ Redis not connected, skipping cache delete for key:', key);
        return false;
      }

      await redisClient.del(key);
      return true;
    } catch (error) {
      const cacheError = handleRedisError(error);
      console.error('❌ Cache delete error:', cacheError.message);
      return false; // Graceful degradation
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!redisClient.isOpen) {
        return false;
      }

      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      const cacheError = handleRedisError(error);
      console.error('❌ Cache exists error:', cacheError.message);
      return false; // Graceful degradation
    }
  }

  async flush(): Promise<boolean> {
    try {
      if (!redisClient.isOpen) {
        console.warn('⚠️ Redis not connected, skipping cache flush');
        return false;
      }

      await redisClient.flushAll();
      return true;
    } catch (error) {
      const cacheError = handleRedisError(error);
      console.error('❌ Cache flush error:', cacheError.message);
      return false; // Graceful degradation
    }
  }

  // Helper method to generate cache keys
  static generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}

// Weather-specific caching utilities
export class WeatherCacheService extends CacheService {
  private readonly WEATHER_TTL = 3600; // 1 hour
  private readonly FORECAST_TTL = 21600; // 6 hours
  private readonly ALERT_TTL = 86400; // 24 hours

  async getWeatherData(locationKey: string): Promise<any> {
    return this.get(`weather:${locationKey}`);
  }

  async setWeatherData(locationKey: string, data: any, ttl?: number): Promise<boolean> {
    return this.set(`weather:${locationKey}`, data, ttl || this.WEATHER_TTL);
  }

  async getForecastData(locationKey: string): Promise<any> {
    return this.get(`forecast:${locationKey}`);
  }

  async setForecastData(locationKey: string, data: any): Promise<boolean> {
    return this.set(`forecast:${locationKey}`, data, this.FORECAST_TTL);
  }

  async getUserAlerts(userId: string): Promise<any> {
    return this.get(`alerts:${userId}`);
  }

  async setUserAlerts(userId: string, alerts: any): Promise<boolean> {
    return this.set(`alerts:${userId}`, alerts, this.ALERT_TTL);
  }

  async invalidateWeatherCache(locationKey: string): Promise<void> {
    await this.del(`weather:${locationKey}`);
    await this.del(`forecast:${locationKey}`);
  }

  async invalidateUserAlerts(userId: string): Promise<void> {
    await this.del(`alerts:${userId}`);
  }
}

// User-specific caching utilities
export class UserCacheService extends CacheService {
  private readonly USER_PROFILE_TTL = 1800; // 30 minutes
  private readonly USER_PREFERENCES_TTL = 3600; // 1 hour

  async getUserProfile(userId: string): Promise<any> {
    return this.get(`user:profile:${userId}`);
  }

  async setUserProfile(userId: string, profile: any): Promise<boolean> {
    return this.set(`user:profile:${userId}`, profile, this.USER_PROFILE_TTL);
  }

  async getUserPreferences(userId: string): Promise<any> {
    return this.get(`user:preferences:${userId}`);
  }

  async setUserPreferences(userId: string, preferences: any): Promise<boolean> {
    return this.set(`user:preferences:${userId}`, preferences, this.USER_PREFERENCES_TTL);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.del(`user:profile:${userId}`);
    await this.del(`user:preferences:${userId}`);
  }
}

// Marketplace-specific caching utilities
export class MarketplaceCacheService extends CacheService {
  private readonly PRODUCT_LIST_TTL = 900; // 15 minutes
  private readonly SEARCH_RESULTS_TTL = 600; // 10 minutes

  async getProductsByLocation(state: string, district?: string): Promise<any> {
    const key = district ? `products:location:${state}:${district}` : `products:location:${state}`;
    return this.get(key);
  }

  async setProductsByLocation(state: string, products: any, district?: string): Promise<boolean> {
    const key = district ? `products:location:${state}:${district}` : `products:location:${state}`;
    return this.set(key, products, this.PRODUCT_LIST_TTL);
  }

  async getSearchResults(searchTerm: string, filters?: any): Promise<any> {
    const filterKey = filters ? JSON.stringify(filters) : 'all';
    return this.get(`search:${searchTerm}:${filterKey}`);
  }

  async setSearchResults(searchTerm: string, results: any, filters?: any): Promise<boolean> {
    const filterKey = filters ? JSON.stringify(filters) : 'all';
    return this.set(`search:${searchTerm}:${filterKey}`, results, this.SEARCH_RESULTS_TTL);
  }

  async invalidateProductCache(sellerId?: string): Promise<void> {
    if (sellerId) {
      await this.del(`products:seller:${sellerId}`);
    }
    // For simplicity, we'll let location-based caches expire naturally
    // In production, you might want to implement pattern-based deletion
  }
}

// Export singleton instances
export const cache = CacheService.getInstance();
export const weatherCache = new WeatherCacheService();
export const userCache = new UserCacheService();
export const marketplaceCache = new MarketplaceCacheService();