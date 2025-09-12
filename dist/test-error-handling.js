"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000';
async function testErrorHandling() {
    console.log('🧪 Testing Error Handling Implementation...\n');
    try {
        // Test 1: 404 Error for non-existent route
        console.log('1. Testing 404 error for non-existent route...');
        try {
            await axios_1.default.get(`${BASE_URL}/api/nonexistent`);
        }
        catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ 404 error handled correctly');
                console.log('Response:', JSON.stringify(error.response.data, null, 2));
            }
            else {
                console.log('❌ Unexpected error:', error.response?.data || error.message);
            }
        }
        console.log('\n2. Testing validation error...');
        try {
            await axios_1.default.post(`${BASE_URL}/api/auth/register`, {
                name: '', // Invalid name
                phone: '123', // Invalid phone
                password: '12' // Too short password
            });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Validation error handled correctly');
                console.log('Response:', JSON.stringify(error.response.data, null, 2));
            }
            else {
                console.log('❌ Unexpected error:', error.response?.data || error.message);
            }
        }
        console.log('\n3. Testing malformed JSON...');
        try {
            await axios_1.default.post(`${BASE_URL}/api/auth/login`, 'invalid json', {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ JSON syntax error handled correctly');
                console.log('Response:', JSON.stringify(error.response.data, null, 2));
            }
            else {
                console.log('❌ Unexpected error:', error.response?.data || error.message);
            }
        }
        console.log('\n4. Testing authentication error...');
        try {
            await axios_1.default.get(`${BASE_URL}/api/auth/profile`, {
                headers: { 'Authorization': 'Bearer invalid_token' }
            });
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Authentication error handled correctly');
                console.log('Response:', JSON.stringify(error.response.data, null, 2));
            }
            else {
                console.log('❌ Unexpected error:', error.response?.data || error.message);
            }
        }
        console.log('\n5. Testing weather service with invalid coordinates...');
        try {
            await axios_1.default.get(`${BASE_URL}/api/weather/forecast/invalid/invalid`);
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Parameter validation error handled correctly');
                console.log('Response:', JSON.stringify(error.response.data, null, 2));
            }
            else {
                console.log('❌ Unexpected error:', error.response?.data || error.message);
            }
        }
    }
    catch (error) {
        console.error('❌ Test setup error:', error);
    }
}
// Run the test
testErrorHandling().then(() => {
    console.log('\n🏁 Error handling tests completed');
}).catch(console.error);
//# sourceMappingURL=test-error-handling.js.map