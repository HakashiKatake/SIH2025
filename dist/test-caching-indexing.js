"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./utils/database");
const cache_1 = require("./utils/cache");
const indexing_1 = require("./utils/indexing");
const User_1 = require("./models/User");
const Product_1 = require("./models/Product");
async function testCachingAndIndexing() {
    console.log('🧪 Testing Enhanced Caching and Indexing...\n');
    try {
        // Connect to databases
        await (0, database_1.connectMongoDB)();
        await (0, database_1.connectRedis)();
        // Test 1: Basic Cache Operations
        console.log('1️⃣ Testing Basic Cache Operations...');
        const testData = { message: 'Hello Cache!', timestamp: new Date() };
        await cache_1.cache.set('test:basic', testData, 60);
        const cachedData = await cache_1.cache.get('test:basic');
        if (cachedData && JSON.stringify(cachedData) === JSON.stringify(testData)) {
            console.log('✅ Basic cache operations working');
        }
        else {
            console.log('❌ Basic cache operations failed');
        }
        // Test 2: Weather Cache Service
        console.log('\n2️⃣ Testing Weather Cache Service...');
        const weatherData = {
            location: { latitude: 28.6139, longitude: 77.2090 },
            current: { temperature: 25, humidity: 60, description: 'clear sky' },
            forecast: [],
            farmingRecommendations: ['Test recommendation'],
            cachedAt: new Date()
        };
        await cache_1.weatherCache.setWeatherData('28.6139,77.2090', weatherData);
        const cachedWeather = await cache_1.weatherCache.getWeatherData('28.6139,77.2090');
        if (cachedWeather && cachedWeather.current.temperature === 25) {
            console.log('✅ Weather cache service working');
        }
        else {
            console.log('❌ Weather cache service failed');
        }
        // Test 3: User Cache Service
        console.log('\n3️⃣ Testing User Cache Service...');
        const userProfile = {
            id: 'test-user-123',
            name: 'Test Farmer',
            location: { state: 'Delhi', district: 'New Delhi' },
            preferredLanguage: 'en'
        };
        await cache_1.userCache.setUserProfile('test-user-123', userProfile);
        const cachedProfile = await cache_1.userCache.getUserProfile('test-user-123');
        if (cachedProfile && cachedProfile.name === 'Test Farmer') {
            console.log('✅ User cache service working');
        }
        else {
            console.log('❌ User cache service failed');
        }
        // Test 4: Marketplace Cache Service
        console.log('\n4️⃣ Testing Marketplace Cache Service...');
        const products = [
            { id: '1', name: 'Rice', category: 'crops', price: 50 },
            { id: '2', name: 'Wheat', category: 'crops', price: 45 }
        ];
        await cache_1.marketplaceCache.setProductsByLocation('Delhi', products, 'New Delhi');
        const cachedProducts = await cache_1.marketplaceCache.getProductsByLocation('Delhi', 'New Delhi');
        if (cachedProducts && cachedProducts.length === 2) {
            console.log('✅ Marketplace cache service working');
        }
        else {
            console.log('❌ Marketplace cache service failed');
        }
        // Test 5: Database Index Statistics
        console.log('\n5️⃣ Testing Database Index Statistics...');
        const indexStats = await indexing_1.DatabaseIndexingService.getIndexStats();
        console.log('📊 Index Statistics:');
        Object.entries(indexStats).forEach(([collection, stats]) => {
            if (stats.error) {
                console.log(`   ${collection}: ${stats.error}`);
            }
            else {
                console.log(`   ${collection}: ${stats.indexCount} indexes`);
                stats.indexes.forEach((idx) => {
                    console.log(`     - ${idx.name}: ${JSON.stringify(idx.key)}`);
                });
            }
        });
        // Test 6: Query Performance Test (if data exists)
        console.log('\n6️⃣ Testing Query Performance...');
        const userCount = await User_1.User.countDocuments();
        const productCount = await Product_1.Product.countDocuments();
        if (userCount > 0) {
            const startTime = Date.now();
            await User_1.User.find({ isActive: true }).limit(10);
            const userQueryTime = Date.now() - startTime;
            console.log(`✅ User query completed in ${userQueryTime}ms`);
        }
        else {
            console.log('ℹ️ No users found for performance testing');
        }
        if (productCount > 0) {
            const startTime = Date.now();
            await Product_1.Product.find({ isActive: true }).limit(10);
            const productQueryTime = Date.now() - startTime;
            console.log(`✅ Product query completed in ${productQueryTime}ms`);
        }
        else {
            console.log('ℹ️ No products found for performance testing');
        }
        // Test 7: Cache Invalidation
        console.log('\n7️⃣ Testing Cache Invalidation...');
        await cache_1.userCache.invalidateUserCache('test-user-123');
        const invalidatedProfile = await cache_1.userCache.getUserProfile('test-user-123');
        if (!invalidatedProfile) {
            console.log('✅ Cache invalidation working');
        }
        else {
            console.log('❌ Cache invalidation failed');
        }
        console.log('\n🎉 Caching and Indexing tests completed!');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
    }
    finally {
        process.exit(0);
    }
}
// Run the test
testCachingAndIndexing();
//# sourceMappingURL=test-caching-indexing.js.map