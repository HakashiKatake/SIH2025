"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const API_BASE = 'http://localhost:3000/api';
async function testCropAnalysisAPI() {
    try {
        console.log('🧪 Testing Crop Analysis API...');
        // Step 1: Register a test user
        console.log('\n👤 Registering test user...');
        const registerResponse = await axios_1.default.post(`${API_BASE}/auth/register`, {
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
        });
        const { token } = registerResponse.data.data;
        console.log('✅ User registered successfully');
        // Step 2: Create a test image file (simple 1x1 pixel PNG)
        const testImageBuffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
            0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x01, 0x5C, 0xC2, 0x8A, 0x8B, 0x00, 0x00, 0x00, 0x00, 0x49,
            0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);
        // Step 3: Test crop analysis endpoint
        console.log('\n🌱 Testing crop analysis endpoint...');
        const formData = new form_data_1.default();
        formData.append('image', testImageBuffer, {
            filename: 'test-crop.png',
            contentType: 'image/png'
        });
        formData.append('cropType', 'tomato');
        formData.append('location', JSON.stringify({
            latitude: 28.6139,
            longitude: 77.2090,
            address: 'New Delhi, India'
        }));
        const analysisResponse = await axios_1.default.post(`${API_BASE}/crops/analyze`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });
        console.log('✅ Crop analysis completed');
        console.log('Analysis Result:', JSON.stringify(analysisResponse.data.data, null, 2));
        const analysisId = analysisResponse.data.data.id;
        // Step 4: Test analysis history endpoint
        console.log('\n📋 Testing analysis history endpoint...');
        const historyResponse = await axios_1.default.get(`${API_BASE}/crops/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Analysis history retrieved');
        console.log(`Found ${historyResponse.data.data.analyses.length} analyses`);
        console.log('Pagination:', historyResponse.data.data.pagination);
        // Step 5: Test specific analysis details endpoint
        console.log('\n🔍 Testing analysis details endpoint...');
        const detailsResponse = await axios_1.default.get(`${API_BASE}/crops/analysis/${analysisId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Analysis details retrieved');
        console.log('Health Status:', detailsResponse.data.data.analysisResult.healthStatus);
        // Step 6: Test recommendations endpoint
        console.log('\n💡 Testing recommendations endpoint...');
        const recommendationsResponse = await axios_1.default.get(`${API_BASE}/crops/recommendations/${analysisId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Recommendations retrieved');
        console.log('Immediate Actions:', recommendationsResponse.data.data.recommendations.immediate.length);
        console.log('Short-term Actions:', recommendationsResponse.data.data.recommendations.shortTerm.length);
        console.log('Long-term Actions:', recommendationsResponse.data.data.recommendations.longTerm.length);
        // Step 7: Test filtering
        console.log('\n🔍 Testing history filtering...');
        const filteredResponse = await axios_1.default.get(`${API_BASE}/crops/history?cropType=tomato&limit=5`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Filtered history retrieved');
        console.log(`Found ${filteredResponse.data.data.analyses.length} tomato analyses`);
        console.log('\n✅ All Crop Analysis API tests passed!');
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error('❌ API Test failed:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
        }
        else {
            console.error('❌ Test failed:', error);
        }
    }
}
// Check if server is running before testing
async function checkServerHealth() {
    try {
        const response = await axios_1.default.get(`${API_BASE.replace('/api', '')}/health`);
        console.log('✅ Server is running');
        return true;
    }
    catch (error) {
        console.log('❌ Server is not running. Please start the server with: npm run dev');
        return false;
    }
}
async function runTests() {
    const serverRunning = await checkServerHealth();
    if (serverRunning) {
        await testCropAnalysisAPI();
    }
}
runTests();
//# sourceMappingURL=test-crop-api.js.map