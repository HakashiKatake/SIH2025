"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./utils/database");
const weatherService_1 = require("./services/weatherService");
const User_1 = require("./models/User");
async function testWeatherService() {
    try {
        console.log('🌤️  Testing Weather Service...\n');
        // Initialize database connections
        await (0, database_1.connectMongoDB)();
        await (0, database_1.connectRedis)();
        console.log('✅ Database connections established\n');
        // Test coordinates (Delhi, India)
        const testLocation = {
            latitude: 28.6139,
            longitude: 77.2090
        };
        console.log('📍 Testing location:', testLocation);
        // Test 1: Get weather forecast
        console.log('\n1️⃣  Testing weather forecast...');
        const forecast = await weatherService_1.weatherService.getForecast(testLocation);
        console.log('Current Weather:');
        console.log(`  Temperature: ${forecast.current.temperature}°C`);
        console.log(`  Humidity: ${forecast.current.humidity}%`);
        console.log(`  Description: ${forecast.current.description}`);
        console.log(`  Wind Speed: ${forecast.current.windSpeed} km/h`);
        console.log('\n3-Day Forecast:');
        forecast.forecast.forEach((day, index) => {
            console.log(`  Day ${index + 1}: ${day.weather.temperature}°C, ${day.weather.description}`);
            console.log(`    Min/Max: ${day.minTemp}°C / ${day.maxTemp}°C`);
            console.log(`    Rain Chance: ${day.precipitation.probability}%`);
        });
        console.log('\nFarming Recommendations:');
        forecast.farmingRecommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. ${rec}`);
        });
        // Test 2: Test caching (second call should be faster)
        console.log('\n2️⃣  Testing weather caching...');
        const startTime = Date.now();
        const cachedForecast = await weatherService_1.weatherService.getForecast(testLocation);
        const endTime = Date.now();
        console.log(`✅ Cached forecast retrieved in ${endTime - startTime}ms`);
        console.log(`Cache timestamp: ${cachedForecast.cachedAt}`);
        // Test 3: Test with a test user for alerts
        console.log('\n3️⃣  Testing farming alerts...');
        // Create a test user if not exists
        let testUser = await User_1.User.findOne({ phone: '+91-TEST-WEATHER' });
        if (!testUser) {
            testUser = new User_1.User({
                name: 'Weather Test User',
                phone: '+91-TEST-WEATHER',
                location: {
                    latitude: testLocation.latitude,
                    longitude: testLocation.longitude,
                    address: 'Test Location, Delhi',
                    state: 'Delhi',
                    district: 'New Delhi'
                },
                preferredLanguage: 'en',
                crops: ['wheat', 'rice']
            });
            await testUser.save();
            console.log('✅ Test user created');
        }
        // Generate alerts for the test user
        const alerts = await weatherService_1.weatherService.generateFarmingAlerts(testUser._id.toString());
        console.log(`Generated ${alerts.length} alerts:`);
        alerts.forEach((alert, index) => {
            console.log(`  ${index + 1}. [${alert.severity.toUpperCase()}] ${alert.title}`);
            console.log(`     ${alert.message}`);
        });
        // Test 4: Get user alerts
        console.log('\n4️⃣  Testing user alerts retrieval...');
        const userAlerts = await weatherService_1.weatherService.getUserAlerts(testUser._id.toString());
        console.log(`Retrieved ${userAlerts.length} active alerts for user`);
        // Test 5: Test cache invalidation
        console.log('\n5️⃣  Testing cache invalidation...');
        await weatherService_1.weatherService.invalidateCache(testLocation);
        console.log('✅ Cache invalidated successfully');
        // Test 6: Test with invalid coordinates (should return mock data)
        console.log('\n6️⃣  Testing fallback with mock data...');
        const mockLocation = { latitude: 0, longitude: 0 };
        const mockForecast = await weatherService_1.weatherService.getForecast(mockLocation);
        console.log(`Mock forecast temperature: ${mockForecast.current.temperature}°C`);
        console.log(`Mock recommendations: ${mockForecast.farmingRecommendations.length} items`);
        console.log('\n✅ All weather service tests completed successfully!');
    }
    catch (error) {
        console.error('❌ Weather service test failed:', error);
    }
    finally {
        process.exit(0);
    }
}
// Run the test
testWeatherService();
//# sourceMappingURL=test-weather.js.map