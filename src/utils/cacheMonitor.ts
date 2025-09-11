import { redisClient } from './database';
import { cache } from './cache';

/**
 * Cache monitoring and performance utilities
 */
export class CacheMonitor {
  private static hitCount = 0;
  private static missCount = 0;
  private static errorCount = 0;

  /**
   * Record a cache hit
   */
  static recordHit(): void {
    this.hitCount++;
  }

  /**
   * Record a cache miss
   */
  static recordMiss(): void {
    this.missCount++;
  }

  /**
   * Record a cache error
   */
  static recordError(): void {
    this.errorCount++;
  }

  /**
   * Get cache statistics
   */
  static getStats(): {
    hits: number;
    misses: number;
    errors: number;
    hitRate: number;
    totalRequests: number;
  } {
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
  static resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
    this.errorCount = 0;
  }

  /**
   * Get Redis memory usage and connection info
   */
  static async getRedisInfo(): Promise<any> {
    try {
      if (!redisClient.isOpen) {
        return { status: 'disconnected' };
      }

      const info = await redisClient.info('memory');
      const keyCount = await redisClient.dbSize();
      
      // Parse memory info
      const memoryLines = info.split('\r\n');
      const memoryInfo: any = {};
      
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
    } catch (error) {
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get cache keys by pattern
   */
  static async getKeysByPattern(pattern: string = '*'): Promise<string[]> {
    try {
      if (!redisClient.isOpen) {
        return [];
      }

      const keys = await redisClient.keys(pattern);
      return keys;
    } catch (error) {
      console.error('Error getting cache keys:', error);
      return [];
    }
  }

  /**
   * Clear cache by pattern
   */
  static async clearCacheByPattern(pattern: string): Promise<number> {
    try {
      if (!redisClient.isOpen) {
        return 0;
      }

      const keys = await redisClient.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      await redisClient.del(keys);
      return keys.length;
    } catch (error) {
      console.error('Error clearing cache by pattern:', error);
      return 0;
    }
  }

  /**
   * Get comprehensive cache health report
   */
  static async getHealthReport(): Promise<any> {
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
  private static generateRecommendations(stats: any, redisInfo: any): string[] {
    const recommendations: string[] = [];

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
  static startMonitoring(intervalMinutes: number = 15): NodeJS.Timeout {
    console.log(`🔍 Starting cache monitoring (every ${intervalMinutes} minutes)`);
    
    return setInterval(async () => {
      const report = await this.getHealthReport();
      console.log('📊 Cache Health Report:', JSON.stringify(report, null, 2));
    }, intervalMinutes * 60 * 1000);
  }
}

/**
 * Enhanced cache service with monitoring
 */
export class MonitoredCacheService {
  private cache = cache;

  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.cache.get<T>(key);
      if (result) {
        CacheMonitor.recordHit();
      } else {
        CacheMonitor.recordMiss();
      }
      return result;
    } catch (error) {
      CacheMonitor.recordError();
      throw error;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      return await this.cache.set(key, value, ttl);
    } catch (error) {
      CacheMonitor.recordError();
      throw error;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      return await this.cache.del(key);
    } catch (error) {
      CacheMonitor.recordError();
      throw error;
    }
  }
}

// Export singleton
export const monitoredCache = new MonitoredCacheService();