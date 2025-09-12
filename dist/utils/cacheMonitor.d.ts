/**
 * Cache monitoring and performance utilities
 */
export declare class CacheMonitor {
    private static hitCount;
    private static missCount;
    private static errorCount;
    /**
     * Record a cache hit
     */
    static recordHit(): void;
    /**
     * Record a cache miss
     */
    static recordMiss(): void;
    /**
     * Record a cache error
     */
    static recordError(): void;
    /**
     * Get cache statistics
     */
    static getStats(): {
        hits: number;
        misses: number;
        errors: number;
        hitRate: number;
        totalRequests: number;
    };
    /**
     * Reset statistics
     */
    static resetStats(): void;
    /**
     * Get Redis memory usage and connection info
     */
    static getRedisInfo(): Promise<any>;
    /**
     * Get cache keys by pattern
     */
    static getKeysByPattern(pattern?: string): Promise<string[]>;
    /**
     * Clear cache by pattern
     */
    static clearCacheByPattern(pattern: string): Promise<number>;
    /**
     * Get comprehensive cache health report
     */
    static getHealthReport(): Promise<any>;
    /**
     * Generate performance recommendations
     */
    private static generateRecommendations;
    /**
     * Start periodic cache monitoring
     */
    static startMonitoring(intervalMinutes?: number): NodeJS.Timeout;
}
/**
 * Enhanced cache service with monitoring
 */
export declare class MonitoredCacheService {
    private cache;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
}
export declare const monitoredCache: MonitoredCacheService;
//# sourceMappingURL=cacheMonitor.d.ts.map