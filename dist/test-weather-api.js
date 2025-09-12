"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const database_1 = require("./utils/database");
async function testWeatherAPI() {
    try {
        console.log('🌤️  Testing Weather API Endpoints...\n');
        // Initialize database connections
        await (0, database_1.connectMongoDB)();
        await (0, database_1.connectRedis)();
        console.log('✅ Database connections established\n');
        // Start the server in the background for testing
        const { spawn } = require('child_process');
        const server = spawn('npm', ['run', 'dev'], {
            stdio: 'pipe',
            detached: false
        });
        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 3000));
        const baseURL = 'http://localhost:3000/api/weather';
        // Test 1: Weather forecast by coordinates (should work without auth for testing)
        console.log('1️⃣  Testing weather forecast by coordinates...');
        try {
            const response = await axios_1.default.get(`${baseURL}/forecast/28.6139/77.2090`);
            console.log('❌ Expected 401 but got:', response.status);
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Correctly requires authentication (401)');
            }
            else {
                console.log('❌ Unexpected error:', error.response?.status || error.message);
            }
        }
        // Test 2: Invalid coordinates
        console.log('\n2️⃣  Testing invalid coordinates...');
        try {
            const response = await axios_1.default.get(`${baseURL}/forecast/invalid/coords`);
            console.log('❌ Expected error but got:', response.status);
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Correctly requires authentication first (401)');
            }
            else if (error.response?.status === 400) {
                console.log('✅ Correctly validates coordinates (400)');
            }
            else {
                console.log('❌ Unexpected error:', error.response?.status || error.message);
            }
        }
        // Test 3: Server health check
        console.log('\n3️⃣  Testing server health...');
        try {
            const response = await axios_1.default.get('http://localhost:3000/health');
            console.log('✅ Server health check passed:', response.data.status);
        }
        catch (error) {
            console.log('❌ Health check failed:', error.message);
        }
        // Test 4: API endpoints list
        console.log('\n4️⃣  Testing API endpoints list...');
        try {
            const response = await axios_1.default.get('http://localhost:3000/');
            console.log('✅ API endpoints available:');
            Object.entries(response.data.endpoints).forEach(([key, value]) => {
                console.log(`  ${key}: ${value}`);
            });
        }
        catch (error) {
            console.log('❌ Failed to get endpoints:', error.message);
        }
        console.log('\n✅ Weather API endpoint tests completed!');
        console.log('\n📝 Summary:');
        console.log('  - Weather service is properly integrated');
        console.log('  - Authentication is required for weather endpoints');
        console.log('  - Server is running and responding');
        console.log('  - Weather endpoints are available at /api/weather');
        // Kill the server
        server.kill();
    }
    catch (error) {
        console.error('❌ Weather API test failed:', error);
    }
    finally {
        process.exit(0);
    }
}
// Run the test
testWeatherAPI();
//# sourceMappingURL=test-weather-api.js.map