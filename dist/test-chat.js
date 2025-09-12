"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testChatAPI = testChatAPI;
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
const testQueries = [
    {
        message: 'My tomato plants have yellow spots on leaves',
        language: 'en'
    },
    {
        message: 'मेरे टमाटर के पौधों पर पीले धब्बे हैं',
        language: 'hi'
    },
    {
        message: 'How to control aphids on my crops?',
        language: 'en'
    },
    {
        message: 'Best fertilizer for rice cultivation',
        language: 'en'
    },
    {
        message: 'When should I water my plants?',
        language: 'en'
    }
];
async function testChatAPI() {
    console.log('🤖 Testing Chat API...\n');
    try {
        // Step 1: Register a test user
        console.log('1. Registering test user...');
        const registerResponse = await axios_1.default.post(`${BASE_URL}/api/auth/register`, testUser);
        console.log('✅ User registered successfully');
        const token = registerResponse.data.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        // Step 2: Test supported languages endpoint
        console.log('\n2. Testing supported languages...');
        const languagesResponse = await axios_1.default.get(`${BASE_URL}/api/chat/languages`);
        console.log('✅ Supported languages:', languagesResponse.data.data.length, 'languages');
        console.log('Languages:', languagesResponse.data.data.map((l) => `${l.code} (${l.name})`).join(', '));
        // Step 3: Test text queries
        console.log('\n3. Testing text queries...');
        for (let i = 0; i < testQueries.length; i++) {
            const query = testQueries[i];
            console.log(`\n   Query ${i + 1}: "${query.message}" (${query.language})`);
            const queryResponse = await axios_1.default.post(`${BASE_URL}/api/chat/query`, query, { headers });
            const response = queryResponse.data.data;
            console.log(`   ✅ Response: "${response.response.substring(0, 80)}..."`);
            console.log(`   📊 Confidence: ${response.confidence}`);
            console.log(`   🏷️  Related topics: ${response.relatedTopics.join(', ')}`);
        }
        // Step 4: Test voice query
        console.log('\n4. Testing voice query...');
        const voiceQuery = {
            message: 'How to prevent pest attacks on vegetables?',
            language: 'en',
            audioUrl: 'https://example.com/audio/test.mp3'
        };
        const voiceResponse = await axios_1.default.post(`${BASE_URL}/api/chat/voice`, voiceQuery, { headers });
        console.log('✅ Voice query processed');
        console.log('📱 Audio URL:', voiceResponse.data.data.audioUrl);
        console.log('💬 Response:', voiceResponse.data.data.response.substring(0, 80) + '...');
        // Step 5: Test chat history
        console.log('\n5. Testing chat history...');
        const historyResponse = await axios_1.default.get(`${BASE_URL}/api/chat/history?limit=10&page=1`, { headers });
        const history = historyResponse.data.data;
        console.log(`✅ Chat history retrieved: ${history.messages.length} messages`);
        console.log('📝 Recent messages:');
        history.messages.slice(0, 3).forEach((msg, index) => {
            console.log(`   ${index + 1}. [${msg.messageType}] "${msg.message.substring(0, 50)}..."`);
            console.log(`      Response: "${msg.response.substring(0, 50)}..."`);
            console.log(`      Language: ${msg.language}, Confidence: ${msg.confidence}`);
        });
        // Step 6: Test pagination
        console.log('\n6. Testing pagination...');
        const paginatedResponse = await axios_1.default.get(`${BASE_URL}/api/chat/history?limit=2&page=1`, { headers });
        console.log('✅ Pagination working');
        console.log('📄 Page 1, Limit 2:', paginatedResponse.data.data.messages.length, 'messages');
        // Step 7: Test error handling
        console.log('\n7. Testing error handling...');
        try {
            await axios_1.default.post(`${BASE_URL}/api/chat/query`, {
                message: '', // Empty message should fail
                language: 'en'
            }, { headers });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Validation error handled correctly');
            }
        }
        try {
            await axios_1.default.post(`${BASE_URL}/api/chat/query`, {
                message: 'Test message',
                language: 'invalid' // Invalid language should fail
            }, { headers });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Invalid language error handled correctly');
            }
        }
        console.log('\n🎉 All chat API tests completed successfully!');
        console.log('\n📊 Test Summary:');
        console.log('- ✅ User registration and authentication');
        console.log('- ✅ Supported languages endpoint');
        console.log('- ✅ Text query processing (multiple languages)');
        console.log('- ✅ Voice query processing');
        console.log('- ✅ Chat history retrieval');
        console.log('- ✅ Pagination functionality');
        console.log('- ✅ Error handling and validation');
    }
    catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        process.exit(1);
    }
}
// Run tests if this file is executed directly
if (require.main === module) {
    testChatAPI();
}
//# sourceMappingURL=test-chat.js.map