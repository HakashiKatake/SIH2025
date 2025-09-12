"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoredCache = exports.MonitoredCacheService = exports.CacheMonitor = void 0;
const database_1 = require("./database");
const cache_1 = require("./cache");
/**
 * Cache monitoring and performance utilities
 */
class CacheMonitor {
    /**
     * Record a cache hit
     */
    static recordHit() {
        this.hitCount++;
    }
    /**
     * Record a cache miss
     */
    static recordMiss() {
        this.missCount++;
    }
    /**
     * Record a cache error
     */
    static recordError() {
        this.errorCount++;
    }
    /**
     * Get cache statistics
     */
    static getStats() {
        const totalRequests = this.hitCount + this.missCount;
        const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;
        return {
            hits: this.hitCount,
            misses: this.missCount,
            errors: this.errorCount,
            hitRate: Math.round(hitRate * 100) / 100,
            totalRequests
        };
    }
    /**
     * Reset statistics
     */
    static resetStats() {
        this.hitCount = 0;
        this.missCount = 0;
        this.errorCount = 0;
    }
    /**
     * Get Redis memory usage and connection info
     */
    static async getRedisInfo() {
        try {
            if (!database_1.redisClient.isOpen) {
                return { status: 'disconnected' };
            }
            const info = await database_1.redisClient.info('memory');
            const keyCount = await database_1.redisClient.dbSize();
            // Parse memory info
            const memoryLines = info.split('\r\n');
            const memoryInfo = {};
            memoryLines.forEach(line => {
                if (line.includes(':')) {
                    const [key, value] = line.split(':');
                    memoryInfo[key] = value;
                }
            });
            return {
                status: 'connected',
                keyCount,
                usedMemory: memoryInfo.used_memory_human || 'unknown',
                usedMemoryPeak: memoryInfo.used_memory_peak_human || 'unknown',
                memoryFragmentationRatio: memoryInfo.mem_fragmentation_ratio || 'unknown'
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Get cache keys by pattern
     */
    static async getKeysByPattern(pattern = '*') {
        try {
            if (!database_1.redisClient.isOpen) {
                return [];
            }
            const keys = await database_1.redisClient.keys(pattern);
            return keys;
        }
        catch (error) {
            console.error('Error getting cache keys:', error);
            return [];
        }
    }
    /**
     * Clear cache by pattern
     */
    static async clearCacheByPattern(pattern) {
        try {
            if (!database_1.redisClient.isOpen) {
                return 0;
            }
            const keys = await database_1.redisClient.keys(pattern);
            if (keys.length === 0) {
                return 0;
            }
            await database_1.redisClient.del(keys);
            return keys.length;
        }
        catch (error) {
            console.error('Error clearing cache by pattern:', error);
            return 0;
        }
    }
    /**
     * Get comprehensive cache health report
     */
    static async getHealthReport() {
        const stats = this.getStats();
        const redisInfo = await this.getRedisInfo();
        const weatherKeys = await this.getKeysByPattern('weather:*');
        const userKeys = await this.getKeysByPattern('user:*');
        const searchKeys = await this.getKeysByPattern('search:*');
        return {
            timestamp: new Date().toISOString(),
            performance: stats,
            redis: redisInfo,
            keyDistribution: {
                weather: weatherKeys.length,
                user: userKeys.length,
                search: searchKeys.length,
                total: redisInfo.keyCount || 0
            },
            recommendations: this.generateRecommendations(stats, redisInfo)
        };
    }
    /**
     * Generate performance recommendations
     */
    static generateRecommendations(stats, redisInfo) {
        const recommendations = [];
        if (stats.hitRate < 50) {
            recommendations.push('Cache hit rate is low. Consider increasing TTL values or reviewing cache strategy.');
        }
        if (stats.errors > stats.totalRequests * 0.1) {
            recommendations.push('High cache error rate detected. Check Redis connection stability.');
        }
        if (redisInfo.status === 'disconnected') {
            recommendations.push('Redis is disconnected. Cache functionality is degraded.');
        }
        if (redisInfo.keyCount > 10000) {
            recommendations.push('High number of cache keys. Consider implementing cache cleanup policies.');
        }
        if (recommendations.length === 0) {
            recommendations.push('Cache performance is healthy.');
        }
        return recommendations;
    }
    /**
     * Start periodic cache monitoring
     */
    static startMonitoring(intervalMinutes = 15) {
        console.log(`🔍 Starting cache monitoring (every ${intervalMinutes} minutes)`);
        return setInterval(async () => {
            const report = await this.getHealthReport();
            console.log('📊 Cache Health Report:', JSON.stringify(report, null, 2));
        }, intervalMinutes * 60 * 1000);
    }
}
exports.CacheMonitor = CacheMonitor;
CacheMonitor.hitCount = 0;
CacheMonitor.missCount = 0;
CacheMonitor.errorCount = 0;
/**
 * Enhanced cache service with monitoring
 */
class MonitoredCacheService {
    constructor() {
        this.cache = cache_1.cache;
    }
    async get(key) {
        try {
            const result = await this.cache.get(key);
            if (result) {
                CacheMonitor.recordHit();
            }
            else {
                CacheMonitor.recordMiss();
            }
            return result;
        }
        catch (error) {
            CacheMonitor.recordError();
            throw error;
        }
    }
    async set(key, value, ttl) {
        try {
            return await this.cache.set(key, value, ttl);
        }
        catch (error) {
            CacheMonitor.recordError();
            throw error;
        }
    }
    async del(key) {
        try {
            return await this.cache.del(key);
        }
        catch (error) {
            CacheMonitor.recordError();
            throw error;
        }
    }
}
exports.MonitoredCacheService = MonitoredCacheService;
// Export singleton
exports.monitoredCache = new MonitoredCacheService();
//# sourceMappingURL=cacheMonitor.js.map