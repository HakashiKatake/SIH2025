"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cacheMonitor_1 = require("../utils/cacheMonitor");
const indexing_1 = require("../utils/indexing");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const router = express_1.default.Router();
/**
 * Get cache performance statistics
 * GET /api/admin/cache/stats
 */
router.get('/cache/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const stats = cacheMonitor_1.CacheMonitor.getStats();
        res.json((0, response_1.createSuccessResponse)(stats, 'Cache statistics retrieved successfully'));
    }
    catch (error) {
        console.error('Error getting cache stats:', error);
        res.status(500).json((0, response_1.createErrorResponse)('CACHE_STATS_ERROR', 'Failed to retrieve cache statistics'));
    }
});
/**
 * Get comprehensive cache health report
 * GET /api/admin/cache/health
 */
router.get('/cache/health', auth_1.authenticateToken, async (req, res) => {
    try {
        const healthReport = await cacheMonitor_1.CacheMonitor.getHealthReport();
        res.json((0, response_1.createSuccessResponse)(healthReport, 'Cache health report retrieved successfully'));
    }
    catch (error) {
        console.error('Error getting cache health report:', error);
        res.status(500).json((0, response_1.createErrorResponse)('CACHE_HEALTH_ERROR', 'Failed to retrieve cache health report'));
    }
});
/**
 * Get database index statistics
 * GET /api/admin/database/indexes
 */
router.get('/database/indexes', auth_1.authenticateToken, async (req, res) => {
    try {
        const indexStats = await indexing_1.DatabaseIndexingService.getIndexStats();
        res.json((0, response_1.createSuccessResponse)(indexStats, 'Database index statistics retrieved successfully'));
    }
    catch (error) {
        console.error('Error getting database index stats:', error);
        res.status(500).json((0, response_1.createErrorResponse)('INDEX_STATS_ERROR', 'Failed to retrieve database index statistics'));
    }
});
/**
 * Clear cache by pattern
 * DELETE /api/admin/cache/clear
 */
router.delete('/cache/clear', auth_1.authenticateToken, async (req, res) => {
    try {
        const { pattern = '*' } = req.query;
        if (typeof pattern !== 'string') {
            return res.status(400).json((0, response_1.createErrorResponse)('INVALID_PATTERN', 'Pattern must be a string'));
        }
        const clearedCount = await cacheMonitor_1.CacheMonitor.clearCacheByPattern(pattern);
        res.json((0, response_1.createSuccessResponse)({ clearedKeys: clearedCount, pattern }, `Cleared ${clearedCount} cache keys matching pattern: ${pattern}`));
    }
    catch (error) {
        console.error('Error clearing cache:', error);
        res.status(500).json((0, response_1.createErrorResponse)('CACHE_CLEAR_ERROR', 'Failed to clear cache'));
    }
});
/**
 * Reset cache statistics
 * POST /api/admin/cache/reset-stats
 */
router.post('/cache/reset-stats', auth_1.authenticateToken, async (req, res) => {
    try {
        cacheMonitor_1.CacheMonitor.resetStats();
        res.json((0, response_1.createSuccessResponse)({}, 'Cache statistics reset successfully'));
    }
    catch (error) {
        console.error('Error resetting cache stats:', error);
        res.status(500).json((0, response_1.createErrorResponse)('CACHE_RESET_ERROR', 'Failed to reset cache statistics'));
    }
});
/**
 * Get cache keys by pattern
 * GET /api/admin/cache/keys
 */
router.get('/cache/keys', auth_1.authenticateToken, async (req, res) => {
    try {
        const { pattern = '*', limit = '100' } = req.query;
        if (typeof pattern !== 'string') {
            return res.status(400).json((0, response_1.createErrorResponse)('INVALID_PATTERN', 'Pattern must be a string'));
        }
        const keys = await cacheMonitor_1.CacheMonitor.getKeysByPattern(pattern);
        const limitNum = parseInt(limit, 10);
        const limitedKeys = keys.slice(0, limitNum);
        res.json((0, response_1.createSuccessResponse)({
            keys: limitedKeys,
            total: keys.length,
            pattern,
            limit: limitNum,
            truncated: keys.length > limitNum
        }, `Retrieved ${limitedKeys.length} cache keys`));
    }
    catch (error) {
        console.error('Error getting cache keys:', error);
        res.status(500).json((0, response_1.createErrorResponse)('CACHE_KEYS_ERROR', 'Failed to retrieve cache keys'));
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map