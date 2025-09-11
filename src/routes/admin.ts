import express from 'express';
import { CacheMonitor } from '../utils/cacheMonitor';
import { DatabaseIndexingService } from '../utils/indexing';
import { authenticateToken } from '../middleware/auth';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

const router = express.Router();

/**
 * Get cache performance statistics
 * GET /api/admin/cache/stats
 */
router.get('/cache/stats', authenticateToken, async (req, res) => {
  try {
    const stats = CacheMonitor.getStats();
    res.json(createSuccessResponse(stats, 'Cache statistics retrieved successfully'));
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json(createErrorResponse('CACHE_STATS_ERROR', 'Failed to retrieve cache statistics'));
  }
});

/**
 * Get comprehensive cache health report
 * GET /api/admin/cache/health
 */
router.get('/cache/health', authenticateToken, async (req, res) => {
  try {
    const healthReport = await CacheMonitor.getHealthReport();
    res.json(createSuccessResponse(healthReport, 'Cache health report retrieved successfully'));
  } catch (error) {
    console.error('Error getting cache health report:', error);
    res.status(500).json(createErrorResponse('CACHE_HEALTH_ERROR', 'Failed to retrieve cache health report'));
  }
});

/**
 * Get database index statistics
 * GET /api/admin/database/indexes
 */
router.get('/database/indexes', authenticateToken, async (req, res) => {
  try {
    const indexStats = await DatabaseIndexingService.getIndexStats();
    res.json(createSuccessResponse(indexStats, 'Database index statistics retrieved successfully'));
  } catch (error) {
    console.error('Error getting database index stats:', error);
    res.status(500).json(createErrorResponse('INDEX_STATS_ERROR', 'Failed to retrieve database index statistics'));
  }
});

/**
 * Clear cache by pattern
 * DELETE /api/admin/cache/clear
 */
router.delete('/cache/clear', authenticateToken, async (req, res) => {
  try {
    const { pattern = '*' } = req.query;
    
    if (typeof pattern !== 'string') {
      return res.status(400).json(createErrorResponse('INVALID_PATTERN', 'Pattern must be a string'));
    }

    const clearedCount = await CacheMonitor.clearCacheByPattern(pattern);
    res.json(createSuccessResponse(
      { clearedKeys: clearedCount, pattern }, 
      `Cleared ${clearedCount} cache keys matching pattern: ${pattern}`
    ));
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json(createErrorResponse('CACHE_CLEAR_ERROR', 'Failed to clear cache'));
  }
});

/**
 * Reset cache statistics
 * POST /api/admin/cache/reset-stats
 */
router.post('/cache/reset-stats', authenticateToken, async (req, res) => {
  try {
    CacheMonitor.resetStats();
    res.json(createSuccessResponse({}, 'Cache statistics reset successfully'));
  } catch (error) {
    console.error('Error resetting cache stats:', error);
    res.status(500).json(createErrorResponse('CACHE_RESET_ERROR', 'Failed to reset cache statistics'));
  }
});

/**
 * Get cache keys by pattern
 * GET /api/admin/cache/keys
 */
router.get('/cache/keys', authenticateToken, async (req, res) => {
  try {
    const { pattern = '*', limit = '100' } = req.query;
    
    if (typeof pattern !== 'string') {
      return res.status(400).json(createErrorResponse('INVALID_PATTERN', 'Pattern must be a string'));
    }

    const keys = await CacheMonitor.getKeysByPattern(pattern);
    const limitNum = parseInt(limit as string, 10);
    const limitedKeys = keys.slice(0, limitNum);
    
    res.json(createSuccessResponse({
      keys: limitedKeys,
      total: keys.length,
      pattern,
      limit: limitNum,
      truncated: keys.length > limitNum
    }, `Retrieved ${limitedKeys.length} cache keys`));
  } catch (error) {
    console.error('Error getting cache keys:', error);
    res.status(500).json(createErrorResponse('CACHE_KEYS_ERROR', 'Failed to retrieve cache keys'));
  }
});

export default router;