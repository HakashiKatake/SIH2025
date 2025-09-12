"use strict";
/**
 * Verification script for Task 11: Add essential caching
 * This script verifies that all components of task 11 are implemented correctly
 */
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./utils/database");
const cache_1 = require("./utils/cache");
const indexing_1 = require("./utils/indexing");
const cacheMonitor_1 = require("./utils/cacheMonitor");
async function verifyTask11Implementation() {
    console.log('🔍 Verifying Task 11: Add essential caching implementation...\n');
    const results = {
        redisCaching: false,
        responseCompression: false,
        databaseIndexing: false,
        overallSuccess: false
    };
    try {
        // Connect to databases
        await (0, database_1.connectMongoDB)();
        await (0, database_1.connectRedis)();
        // 1. Verify Redis caching for weather data
        console.log('1️⃣ Verifying Redis caching for weather data...');
        // Test basic cache operations
        const testKey = 'test:verification';
        const testData = { message: 'Task 11 verification', timestamp: new Date() };
        await cache_1.cache.set(testKey, testData, 60);
        const cachedResult = await cache_1.cache.get(testKey);
        if (cachedResult && JSON.stringify(cachedResult) === JSON.stringify(testData)) {
            console.log('✅ Basic Redis caching working');
        }
        else {
            console.log('❌ Basic Redis caching failed');
            return results;
        }
        // Test weather-specific caching
        const weatherData = {
            location: { latitude: 28.6139, longitude: 77.2090 },
            current: { temperature: 25, humidity: 60 },
            forecast: [],
            farmingRecommendations: ['Test recommendation'],
            cachedAt: new Date()
        };
        await cache_1.weatherCache.setWeatherData('test-location', weatherData);
        const cachedWeather = await cache_1.weatherCache.getWeatherData('test-location');
        if (cachedWeather && cachedWeather.current.temperature === 25) {
            console.log('✅ Weather-specific caching working');
            results.redisCaching = true;
        }
        else {
            console.log('❌ Weather-specific caching failed');
            return results;
        }
        // Test user and marketplace caching
        const userProfile = { id: 'test-user', name: 'Test Farmer' };
        await cache_1.userCache.setUserProfile('test-user', userProfile);
        const cachedProfile = await cache_1.userCache.getUserProfile('test-user');
        const products = [{ id: '1', name: 'Rice', price: 50 }];
        await cache_1.marketplaceCache.setProductsByLocation('Delhi', products);
        const cachedProducts = await cache_1.marketplaceCache.getProductsByLocation('Delhi');
        if (cachedProfile && cachedProducts) {
            console.log('✅ User and marketplace caching working');
        }
        else {
            console.log('❌ User and marketplace caching failed');
            return results;
        }
        // 2. Verify response compression (check if compression middleware is configured)
        console.log('\n2️⃣ Verifying response compression...');
        // Check if compression is imported and configured in main app
        const fs = require('fs');
        const indexContent = fs.readFileSync('./src/index.ts', 'utf8');
        if (indexContent.includes('compression') &&
            indexContent.includes('app.use(compression')) {
            console.log('✅ Response compression middleware configured');
            results.responseCompression = true;
        }
        else {
            console.log('❌ Response compression middleware not found');
            return results;
        }
        // 3. Verify database indexing
        console.log('\n3️⃣ Verifying database indexing...');
        // Check if indexing service is working
        const indexStats = await indexing_1.DatabaseIndexingService.getIndexStats();
        let totalIndexes = 0;
        let collectionsWithIndexes = 0;
        Object.entries(indexStats).forEach(([collection, stats]) => {
            if (!stats.error && stats.indexCount > 0) {
                totalIndexes += stats.indexCount;
                collectionsWithIndexes++;
                console.log(`   ${collection}: ${stats.indexCount} indexes`);
            }
        });
        if (totalIndexes > 20 && collectionsWithIndexes >= 5) {
            console.log('✅ Database indexing working (found ' + totalIndexes + ' indexes across ' + collectionsWithIndexes + ' collections)');
            results.databaseIndexing = true;
        }
        else {
            console.log('❌ Insufficient database indexes found');
            return results;
        }
        // 4. Verify cache monitoring
        console.log('\n4️⃣ Verifying cache monitoring...');
        const cacheStats = cacheMonitor_1.CacheMonitor.getStats();
        const redisInfo = await cacheMonitor_1.CacheMonitor.getRedisInfo();
        if (typeof cacheStats.hits === 'number' && redisInfo.status) {
            console.log('✅ Cache monitoring working');
        }
        else {
            console.log('❌ Cache monitoring failed');
            return results;
        }
        // All checks passed
        results.overallSuccess = true;
        console.log('\n🎉 Task 11 Implementation Verification Results:');
        console.log('   ✅ Redis caching for weather data: IMPLEMENTED');
        console.log('   ✅ Basic response compression: IMPLEMENTED');
        console.log('   ✅ Simple database indexing: IMPLEMENTED');
        console.log('   ✅ Cache monitoring and utilities: IMPLEMENTED');
        console.log('\n✅ Task 11: Add essential caching - COMPLETED SUCCESSFULLY');
        // Clean up test data
        await cache_1.cache.del(testKey);
        await cache_1.weatherCache.invalidateWeatherCache('test-location');
        await cache_1.userCache.invalidateUserCache('test-user');
    }
    catch (error) {
        console.error('❌ Verification failed:', error);
    }
    finally {
        process.exit(results.overallSuccess ? 0 : 1);
    }
}
// Run verification
verifyTask11Implementation();
//# sourceMappingURL=verify-task-11.js.map