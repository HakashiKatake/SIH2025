"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testChatAPISimple = testChatAPISimple;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./utils/config");
const BASE_URL = `http://localhost:${config_1.config.port}`;
// Test data
const testUser = {
    name: 'Test Farmer',
    phone: '+919876543210',
    location: {
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'Bangalore, Karnataka'
    },
    preferredLanguage: 'en'
};
async function testChatAPISimple() {
    console.log('🤖 Testing Chat API (Simple)...\n');
    try {
        // Step 1: Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios_1.default.get(`${BASE_URL}/health`);
        console.log('✅ Health check passed:', healthResponse.data.status);
        // Step 2: Register a test user
        console.log('\n2. Registering test user...');
        const registerResponse = await axios_1.default.post(`${BASE_URL}/api/auth/register`, testUser);
        console.log('✅ User registered successfully');
        const token = registerResponse.data.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        // Step 3: Test supported languages endpoint
        console.log('\n3. Testing supported languages...');
        const languagesResponse = await axios_1.default.get(`${BASE_URL}/api/chat/languages`);
        console.log('✅ Supported languages:', languagesResponse.data.data.length, 'languages');
        // Step 4: Test a simple text query
        console.log('\n4. Testing simple text query...');
        const queryResponse = await axios_1.default.post(`${BASE_URL}/api/chat/query`, {
            message: 'How to control pests on my crops?',
            language: 'en'
        }, { headers });
        const response = queryResponse.data.data;
        console.log('✅ Query processed successfully');
        console.log('💬 Response:', response.response.substring(0, 100) + '...');
        console.log('📊 Confidence:', response.confidence);
        console.log('🏷️  Related topics:', response.relatedTopics.join(', '));
        // Step 5: Test chat history
        console.log('\n5. Testing chat history...');
        const historyResponse = await axios_1.default.get(`${BASE_URL}/api/chat/history?limit=5`, { headers });
        console.log('✅ Chat history retrieved:', historyResponse.data.data.messages.length, 'messages');
        console.log('\n🎉 Chat API test completed successfully!');
    }
    catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        process.exit(1);
    }
}
// Run tests if this file is executed directly
if (require.main === module) {
    testChatAPISimple();
}
//# sourceMappingURL=test-chat-simple.js.map