"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketplaceCache = exports.userCache = exports.weatherCache = exports.cache = exports.MarketplaceCacheService = exports.UserCacheService = exports.WeatherCacheService = exports.CacheService = exports.createRedisClient = void 0;
const database_1 = require("./database");
const errors_1 = require("./errors");
// Export function to create Redis client for services
const createRedisClient = () => database_1.redisClient;
exports.createRedisClient = createRedisClient;
class CacheService {
    constructor() {
        this.defaultTTL = 3600; // 1 hour in seconds
    }
    static getInstance() {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }
    async get(key) {
        try {
            if (!database_1.redisClient.isOpen) {
                console.warn('⚠️ Redis not connected, cache miss for key:', key);
                return null;
            }
            const value = await database_1.redisClient.get(key);
            if (!value)
                return null;
            return JSON.parse(value);
        }
        catch (error) {
            const cacheError = (0, errors_1.handleRedisError)(error);
            console.error('❌ Cache get error:', cacheError.message);
            return null; // Graceful degradation
        }
    }
    async set(key, value, ttl = this.defaultTTL) {
        try {
            if (!database_1.redisClient.isOpen) {
                console.warn('⚠️ Redis not connected, skipping cache set for key:', key);
                return false;
            }
            await database_1.redisClient.setEx(key, ttl, JSON.stringify(value));
            return true;
        }
        catch (error) {
            const cacheError = (0, errors_1.handleRedisError)(error);
            console.error('❌ Cache set error:', cacheError.message);
            return false; // Graceful degradation
        }
    }
    async del(key) {
        try {
            if (!database_1.redisClient.isOpen) {
                console.warn('⚠️ Redis not connected, skipping cache delete for key:', key);
                return false;
            }
            await database_1.redisClient.del(key);
            return true;
        }
        catch (error) {
            const cacheError = (0, errors_1.handleRedisError)(error);
            console.error('❌ Cache delete error:', cacheError.message);
            return false; // Graceful degradation
        }
    }
    async exists(key) {
        try {
            if (!database_1.redisClient.isOpen) {
                return false;
            }
            const result = await database_1.redisClient.exists(key);
            return result === 1;
        }
        catch (error) {
            const cacheError = (0, errors_1.handleRedisError)(error);
            console.error('❌ Cache exists error:', cacheError.message);
            return false; // Graceful degradation
        }
    }
    async flush() {
        try {
            if (!database_1.redisClient.isOpen) {
                console.warn('⚠️ Redis not connected, skipping cache flush');
                return false;
            }
            await database_1.redisClient.flushAll();
            return true;
        }
        catch (error) {
            const cacheError = (0, errors_1.handleRedisError)(error);
            console.error('❌ Cache flush error:', cacheError.message);
            return false; // Graceful degradation
        }
    }
    // Helper method to generate cache keys
    static generateKey(prefix, ...parts) {
        return `${prefix}:${parts.join(':')}`;
    }
}
exports.CacheService = CacheService;
// Weather-specific caching utilities
class WeatherCacheService extends CacheService {
    constructor() {
        super(...arguments);
        this.WEATHER_TTL = 3600; // 1 hour
        this.FORECAST_TTL = 21600; // 6 hours
        this.ALERT_TTL = 86400; // 24 hours
    }
    async getWeatherData(locationKey) {
        return this.get(`weather:${locationKey}`);
    }
    async setWeatherData(locationKey, data, ttl) {
        return this.set(`weather:${locationKey}`, data, ttl || this.WEATHER_TTL);
    }
    async getForecastData(locationKey) {
        return this.get(`forecast:${locationKey}`);
    }
    async setForecastData(locationKey, data) {
        return this.set(`forecast:${locationKey}`, data, this.FORECAST_TTL);
    }
    async getUserAlerts(userId) {
        return this.get(`alerts:${userId}`);
    }
    async setUserAlerts(userId, alerts) {
        return this.set(`alerts:${userId}`, alerts, this.ALERT_TTL);
    }
    async invalidateWeatherCache(locationKey) {
        await this.del(`weather:${locationKey}`);
        await this.del(`forecast:${locationKey}`);
    }
    async invalidateUserAlerts(userId) {
        await this.del(`alerts:${userId}`);
    }
}
exports.WeatherCacheService = WeatherCacheService;
// User-specific caching utilities
class UserCacheService extends CacheService {
    constructor() {
        super(...arguments);
        this.USER_PROFILE_TTL = 1800; // 30 minutes
        this.USER_PREFERENCES_TTL = 3600; // 1 hour
    }
    async getUserProfile(userId) {
        return this.get(`user:profile:${userId}`);
    }
    async setUserProfile(userId, profile) {
        return this.set(`user:profile:${userId}`, profile, this.USER_PROFILE_TTL);
    }
    async getUserPreferences(userId) {
        return this.get(`user:preferences:${userId}`);
    }
    async setUserPreferences(userId, preferences) {
        return this.set(`user:preferences:${userId}`, preferences, this.USER_PREFERENCES_TTL);
    }
    async invalidateUserCache(userId) {
        await this.del(`user:profile:${userId}`);
        await this.del(`user:preferences:${userId}`);
    }
}
exports.UserCacheService = UserCacheService;
// Marketplace-specific caching utilities
class MarketplaceCacheService extends CacheService {
    constructor() {
        super(...arguments);
        this.PRODUCT_LIST_TTL = 900; // 15 minutes
        this.SEARCH_RESULTS_TTL = 600; // 10 minutes
    }
    async getProductsByLocation(state, district) {
        const key = district ? `products:location:${state}:${district}` : `products:location:${state}`;
        return this.get(key);
    }
    async setProductsByLocation(state, products, district) {
        const key = district ? `products:location:${state}:${district}` : `products:location:${state}`;
        return this.set(key, products, this.PRODUCT_LIST_TTL);
    }
    async getSearchResults(searchTerm, filters) {
        const filterKey = filters ? JSON.stringify(filters) : 'all';
        return this.get(`search:${searchTerm}:${filterKey}`);
    }
    async setSearchResults(searchTerm, results, filters) {
        const filterKey = filters ? JSON.stringify(filters) : 'all';
        return this.set(`search:${searchTerm}:${filterKey}`, results, this.SEARCH_RESULTS_TTL);
    }
    async invalidateProductCache(sellerId) {
        if (sellerId) {
            await this.del(`products:seller:${sellerId}`);
        }
        // For simplicity, we'll let location-based caches expire naturally
        // In production, you might want to implement pattern-based deletion
    }
}
exports.MarketplaceCacheService = MarketplaceCacheService;
// Export singleton instances
exports.cache = CacheService.getInstance();
exports.weatherCache = new WeatherCacheService();
exports.userCache = new UserCacheService();
exports.marketplaceCache = new MarketplaceCacheService();
//# sourceMappingURL=cache.js.map