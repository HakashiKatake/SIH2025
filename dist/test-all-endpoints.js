"use strict";
/**
 * Comprehensive API Endpoint Testing Script
 * Tests all integrated services and endpoints
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAllTests = runAllTests;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;
// Test user credentials
const testUser = {
    name: 'Test Farmer',
    phone: '+919876543210',
    location: {
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'New Delhi, India',
        state: 'Delhi',
        district: 'Central Delhi'
    },
    preferredLanguage: 'en'
};
const testCredentials = {
    phone: '+919876543210',
    password: 'testpassword123'
};
let authToken = '';
let userId = '';
// Color codes for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};
function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}
function logSuccess(message) {
    log(`✅ ${message}`, colors.green);
}
function logError(message) {
    log(`❌ ${message}`, colors.red);
}
function logInfo(message) {
    log(`ℹ️  ${message}`, colors.blue);
}
function logWarning(message) {
    log(`⚠️  ${message}`, colors.yellow);
}
async function testEndpoint(name, testFn) {
    try {
        log(`\n${colors.bold}Testing: ${name}${colors.reset}`);
        await testFn();
        logSuccess(`${name} - PASSED`);
    }
    catch (error) {
        logError(`${name} - FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
async function testHealthCheck() {
    const response = await axios_1.default.get(`${BASE_URL}/health`);
    if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (response.data.status !== 'healthy') {
        throw new Error(`Expected healthy status, got ${response.data.status}`);
    }
    logInfo(`Health Status: ${response.data.status}`);
}
async function testRootEndpoint() {
    const response = await axios_1.default.get(BASE_URL);
    if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.message || !response.data.endpoints) {
        throw new Error('Missing expected response structure');
    }
    logInfo(`API Version: ${response.data.version}`);
    logInfo(`Available endpoints: ${Object.keys(response.data.endpoints).length}`);
}
async function testUserRegistration() {
    const response = await axios_1.default.post(`${API_BASE}/auth/register`, {
        ...testUser,
        password: testCredentials.password
    });
    if (response.status !== 201) {
        throw new Error(`Expected status 201, got ${response.status}`);
    }
    if (!response.data.success || !response.data.data.token) {
        throw new Error('Registration failed or missing token');
    }
    authToken = response.data.data.token;
    userId = response.data.data.user.id;
    logInfo(`User registered with ID: ${userId}`);
}
async function testUserLogin() {
    const response = await axios_1.default.post(`${API_BASE}/auth/login`, testCredentials);
    if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success || !response.data.data.token) {
        throw new Error('Login failed or missing token');
    }
    authToken = response.data.data.token;
    logInfo('User logged in successfully');
}
async function testAuthenticatedEndpoint(url, method = 'GET', data) {
    const config = {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    };
    let response;
    if (method === 'POST') {
        response = await axios_1.default.post(url, data, config);
    }
    else {
        response = await axios_1.default.get(url, config);
    }
    return response;
}
async function testUserProfile() {
    const response = await testAuthenticatedEndpoint(`${API_BASE}/auth/profile`);
    if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success || !response.data.data.user) {
        throw new Error('Failed to get user profile');
    }
    logInfo(`Profile retrieved for: ${response.data.data.user.name}`);
}
async function testWeatherForecast() {
    const lat = testUser.location.latitude;
    const lon = testUser.location.longitude;
    const response = await testAuthenticatedEndpoint(`${API_BASE}/weather/forecast/${lat}/${lon}`);
    if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success || !response.data.data.current) {
        throw new Error('Failed to get weather forecast');
    }
    logInfo(`Weather retrieved for: ${response.data.data.location.name}`);
}
async function testChatQuery() {
    const response = await testAuthenticatedEndpoint(`${API_BASE}/chat/query`, 'POST', {
        query: 'What is the best time to plant tomatoes?',
        language: 'en'
    });
    if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success || !response.data.data.response) {
        throw new Error('Failed to get chat response');
    }
    logInfo(`Chat response length: ${response.data.data.response.length} characters`);
}
async function testMarketplaceProductListing() {
    const productData = {
        name: 'Fresh Tomatoes',
        category: 'crops',
        price: 50,
        quantity: 100,
        unit: 'kg',
        description: 'Fresh organic tomatoes from my farm',
        location: testUser.location
    };
    const response = await testAuthenticatedEndpoint(`${API_BASE}/marketplace/products`, 'POST', productData);
    if (response.status !== 201) {
        throw new Error(`Expected status 201, got ${response.status}`);
    }
    if (!response.data.success || !response.data.data.product) {
        throw new Error('Failed to create product listing');
    }
    logInfo(`Product listed with ID: ${response.data.data.product.id}`);
    return response.data.data.product.id;
}
async function testMarketplaceSearch() {
    const response = await testAuthenticatedEndpoint(`${API_BASE}/marketplace/products?category=crops&limit=5`);
    if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success || !Array.isArray(response.data.data.products)) {
        throw new Error('Failed to search products');
    }
    logInfo(`Found ${response.data.data.products.length} products`);
}
async function testRoadmapGeneration() {
    const roadmapData = {
        cropType: 'tomato',
        location: testUser.location,
        plantingDate: new Date().toISOString()
    };
    const response = await testAuthenticatedEndpoint(`${API_BASE}/roadmap/generate`, 'POST', roadmapData);
    if (response.status !== 201) {
        throw new Error(`Expected status 201, got ${response.status}`);
    }
    if (!response.data.success || !response.data.data.roadmap) {
        throw new Error('Failed to generate roadmap');
    }
    logInfo(`Roadmap generated with ${response.data.data.roadmap.milestones.length} milestones`);
    return response.data.data.roadmap.id;
}
async function testNotifications() {
    const response = await testAuthenticatedEndpoint(`${API_BASE}/notifications`);
    if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success || !Array.isArray(response.data.data.notifications)) {
        throw new Error('Failed to get notifications');
    }
    logInfo(`Retrieved ${response.data.data.notifications.length} notifications`);
}
async function testCropAnalysis() {
    // Create a simple test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
        0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    const formData = new form_data_1.default();
    formData.append('image', testImageBuffer, {
        filename: 'test-crop.png',
        contentType: 'image/png'
    });
    formData.append('cropType', 'tomato');
    formData.append('location', JSON.stringify(testUser.location));
    const response = await axios_1.default.post(`${API_BASE}/crops/analyze`, formData, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            ...formData.getHeaders()
        }
    });
    if (response.status !== 201) {
        throw new Error(`Expected status 201, got ${response.status}`);
    }
    if (!response.data.success || !response.data.data.analysisResult) {
        throw new Error('Failed to analyze crop image');
    }
    logInfo(`Crop analysis completed with ${response.data.data.analysisResult.confidence}% confidence`);
    return response.data.data.id;
}
async function testCropAnalysisHistory() {
    const response = await testAuthenticatedEndpoint(`${API_BASE}/crops/history`);
    if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success || !Array.isArray(response.data.data.analyses)) {
        throw new Error('Failed to get crop analysis history');
    }
    logInfo(`Retrieved ${response.data.data.analyses.length} crop analyses`);
}
async function runAllTests() {
    log(`${colors.bold}🧪 Starting Comprehensive API Testing${colors.reset}`);
    log(`${colors.blue}Base URL: ${BASE_URL}${colors.reset}`);
    // Basic connectivity tests
    await testEndpoint('Health Check', testHealthCheck);
    await testEndpoint('Root Endpoint', testRootEndpoint);
    // Authentication tests
    await testEndpoint('User Registration', testUserRegistration);
    await testEndpoint('User Login', testUserLogin);
    await testEndpoint('User Profile', testUserProfile);
    // Service tests (require authentication)
    await testEndpoint('Weather Forecast', testWeatherForecast);
    await testEndpoint('Chat Query', testChatQuery);
    await testEndpoint('Marketplace Product Listing', testMarketplaceProductListing);
    await testEndpoint('Marketplace Search', testMarketplaceSearch);
    await testEndpoint('Roadmap Generation', testRoadmapGeneration);
    await testEndpoint('Notifications', testNotifications);
    await testEndpoint('Crop Analysis', testCropAnalysis);
    await testEndpoint('Crop Analysis History', testCropAnalysisHistory);
    log(`\n${colors.bold}🎉 All tests completed!${colors.reset}`);
    log(`${colors.green}Check the results above for any failures.${colors.reset}`);
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    log('\n👋 Test interrupted by user');
    process.exit(0);
});
process.on('unhandledRejection', (reason, promise) => {
    logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    process.exit(1);
});
// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch((error) => {
        logError(`Test suite failed: ${error.message}`);
        process.exit(1);
    });
}
//# sourceMappingURL=test-all-endpoints.js.map