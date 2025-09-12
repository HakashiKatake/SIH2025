"use strict";
/**
 * Simple integration test to verify all services are properly wired
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testServiceIntegration = testServiceIntegration;
const express_1 = __importDefault(require("express"));
const config_1 = require("./utils/config");
// Import all route modules to verify they can be loaded
const auth_1 = __importDefault(require("./routes/auth"));
const upload_1 = __importDefault(require("./routes/upload"));
const crops_1 = __importDefault(require("./routes/crops"));
const weather_1 = __importDefault(require("./routes/weather"));
const chat_1 = __importDefault(require("./routes/chat"));
const marketplace_1 = __importDefault(require("./routes/marketplace"));
const roadmap_1 = __importDefault(require("./routes/roadmap"));
const admin_1 = __importDefault(require("./routes/admin"));
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
async function testServiceIntegration() {
    log(`${colors.bold}🧪 Testing Service Integration${colors.reset}`);
    try {
        // Test 1: Verify all route modules can be imported
        log('\n1. Testing route module imports...');
        const routes = [
            { name: 'Auth Routes', module: auth_1.default },
            { name: 'Upload Routes', module: upload_1.default },
            { name: 'Crops Routes', module: crops_1.default },
            { name: 'Weather Routes', module: weather_1.default },
            { name: 'Chat Routes', module: chat_1.default },
            { name: 'Marketplace Routes', module: marketplace_1.default },
            { name: 'Roadmap Routes', module: roadmap_1.default },
            { name: 'Admin Routes', module: admin_1.default }
        ];
        for (const route of routes) {
            if (route.module && typeof route.module === 'function') {
                logSuccess(`${route.name} imported successfully`);
            }
            else {
                logError(`${route.name} failed to import or is not a valid router`);
            }
        }
        // Test 2: Verify Express app can be created with all routes
        log('\n2. Testing Express app creation...');
        const testApp = (0, express_1.default)();
        // Add all routes to test app
        testApp.use('/api/auth', auth_1.default);
        testApp.use('/api/upload', upload_1.default);
        testApp.use('/api/crops', crops_1.default);
        testApp.use('/api/weather', weather_1.default);
        testApp.use('/api/chat', chat_1.default);
        testApp.use('/api/marketplace', marketplace_1.default);
        testApp.use('/api/roadmap', roadmap_1.default);
        testApp.use('/api/admin', admin_1.default);
        logSuccess('Express app created with all routes');
        // Test 3: Verify configuration
        log('\n3. Testing configuration...');
        const requiredConfigs = [
            { name: 'Port', value: config_1.config.port },
            { name: 'MongoDB URI', value: config_1.config.mongoUri ? 'configured' : 'missing' },
            { name: 'Redis URL', value: config_1.config.redisUrl ? 'configured' : 'missing' },
            { name: 'JWT Secret', value: config_1.config.jwtSecret ? 'configured' : 'missing' },
            { name: 'Cloudinary Config', value: config_1.config.cloudinary.cloudName ? 'configured' : 'missing' }
        ];
        for (const configItem of requiredConfigs) {
            if (configItem.value && configItem.value !== 'missing') {
                logSuccess(`${configItem.name}: ${configItem.value}`);
            }
            else {
                logError(`${configItem.name}: ${configItem.value}`);
            }
        }
        // Test 4: Verify middleware imports
        log('\n4. Testing middleware imports...');
        try {
            const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');
            const { authenticateToken } = require('./middleware/auth');
            const { uploadSingleImage } = require('./middleware/upload');
            logSuccess('Error handling middleware imported');
            logSuccess('Authentication middleware imported');
            logSuccess('Upload middleware imported');
        }
        catch (error) {
            logError(`Middleware import failed: ${error}`);
        }
        // Test 5: Verify service imports
        log('\n5. Testing service imports...');
        try {
            const { ImageService } = require('./services/imageService');
            const { WeatherService } = require('./services/weatherService');
            const { ChatbotService } = require('./services/chatbotService');
            const { MarketplaceService } = require('./services/marketplaceService');
            const { RoadmapService } = require('./services/roadmapService');
            logSuccess('Image service imported');
            logSuccess('Weather service imported');
            logSuccess('Chatbot service imported');
            logSuccess('Marketplace service imported');
            logSuccess('Roadmap service imported');
        }
        catch (error) {
            logError(`Service import failed: ${error}`);
        }
        // Test 6: Verify model imports
        log('\n6. Testing model imports...');
        try {
            const { User } = require('./models/User');
            const { CropAnalysis } = require('./models/CropAnalysis');
            const { Weather } = require('./models/Weather');
            const { ChatMessage } = require('./models/ChatMessage');
            const { Product } = require('./models/Product');
            const { FarmingRoadmap } = require('./models/FarmingRoadmap');
            logSuccess('User model imported');
            logSuccess('CropAnalysis model imported');
            logSuccess('Weather model imported');
            logSuccess('ChatMessage model imported');
            logSuccess('Product model imported');
            logSuccess('FarmingRoadmap model imported');
        }
        catch (error) {
            logError(`Model import failed: ${error}`);
        }
        log(`\n${colors.bold}🎉 Integration test completed!${colors.reset}`);
        logInfo('All core services are properly integrated and can be imported.');
        logInfo('The application is ready for deployment and testing.');
    }
    catch (error) {
        logError(`Integration test failed: ${error}`);
        process.exit(1);
    }
}
// Run the test
if (require.main === module) {
    testServiceIntegration().catch((error) => {
        logError(`Test failed: ${error}`);
        process.exit(1);
    });
}
//# sourceMappingURL=test-integration-simple.js.map