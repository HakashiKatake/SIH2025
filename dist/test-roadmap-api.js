"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000/api';
// Test user credentials
const testUser = {
    name: 'Roadmap Test Farmer',
    phone: '9876543210',
    password: 'password123',
    location: {
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Test Farm, New Delhi',
        state: 'Delhi',
        district: 'Central Delhi'
    },
    preferredLanguage: 'en',
    farmSize: 2.5,
    crops: ['rice', 'wheat']
};
let authToken = '';
let roadmapId = '';
let milestoneId = '';
async function testRoadmapAPI() {
    try {
        console.log('🌱 Testing Roadmap API Endpoints...\n');
        // Test 1: Register user
        console.log('📋 Test 1: Register Test User');
        try {
            const registerResponse = await axios_1.default.post(`${BASE_URL}/auth/register`, testUser);
            console.log('✅ User registered successfully');
            console.log('   User ID:', registerResponse.data.data.user.id);
        }
        catch (error) {
            if (error.response?.status === 400 && error.response?.data?.error?.code === 'USER_EXISTS') {
                console.log('ℹ️  User already exists, proceeding with login');
            }
            else {
                throw error;
            }
        }
        // Test 2: Login user
        console.log('\n📋 Test 2: Login User');
        const loginResponse = await axios_1.default.post(`${BASE_URL}/auth/login`, {
            phone: testUser.phone,
            password: testUser.password
        });
        authToken = loginResponse.data.data.token;
        console.log('✅ User logged in successfully');
        console.log('   Token received:', authToken.substring(0, 20) + '...');
        // Set default authorization header
        axios_1.default.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        // Test 3: Generate Rice Roadmap
        console.log('\n📋 Test 3: Generate Rice Roadmap');
        const riceRoadmapData = {
            cropType: 'rice',
            variety: 'Basmati',
            location: {
                latitude: 28.6139,
                longitude: 77.2090,
                address: 'Test Farm, New Delhi',
                state: 'Delhi',
                district: 'Central Delhi'
            },
            farmSize: 2.5,
            sowingDate: new Date('2024-06-15').toISOString(),
            preferredLanguage: 'en'
        };
        const generateResponse = await axios_1.default.post(`${BASE_URL}/roadmap/generate`, riceRoadmapData);
        roadmapId = generateResponse.data.data.roadmap.id;
        milestoneId = generateResponse.data.data.roadmap.milestones[0].id;
        console.log('✅ Rice roadmap generated successfully');
        console.log('   Roadmap ID:', roadmapId);
        console.log('   Crop Type:', generateResponse.data.data.roadmap.cropType);
        console.log('   Total Milestones:', generateResponse.data.data.roadmap.totalMilestones);
        console.log('   First Milestone:', generateResponse.data.data.roadmap.milestones[0].title);
        // Test 4: Get User Roadmaps
        console.log('\n📋 Test 4: Get User Roadmaps');
        const roadmapsResponse = await axios_1.default.get(`${BASE_URL}/roadmap`);
        console.log('✅ Retrieved user roadmaps');
        console.log('   Count:', roadmapsResponse.data.data.count);
        console.log('   Roadmaps:', roadmapsResponse.data.data.roadmaps.map((r) => `${r.cropType} (${r.currentStage})`).join(', '));
        // Test 5: Get Roadmap Details
        console.log('\n📋 Test 5: Get Roadmap Details');
        const detailsResponse = await axios_1.default.get(`${BASE_URL}/roadmap/${roadmapId}`);
        console.log('✅ Retrieved roadmap details');
        console.log('   Crop Type:', detailsResponse.data.data.roadmap.cropType);
        console.log('   Current Stage:', detailsResponse.data.data.roadmap.currentStage);
        console.log('   Completion:', detailsResponse.data.data.roadmap.completionPercentage + '%');
        // Test 6: Update Milestone Progress
        console.log('\n📋 Test 6: Update Milestone Progress');
        const progressUpdate = {
            status: 'completed',
            completedDate: new Date().toISOString(),
            notes: 'API test - milestone completed successfully'
        };
        const progressResponse = await axios_1.default.put(`${BASE_URL}/roadmap/${roadmapId}/milestones/${milestoneId}/progress`, progressUpdate);
        console.log('✅ Milestone progress updated');
        console.log('   New completion:', progressResponse.data.data.roadmap.completionPercentage + '%');
        console.log('   Current stage:', progressResponse.data.data.roadmap.currentStage);
        // Test 7: Get Upcoming Milestones
        console.log('\n📋 Test 7: Get Upcoming Milestones');
        const upcomingResponse = await axios_1.default.get(`${BASE_URL}/roadmap/milestones/upcoming?days=30`);
        console.log('✅ Retrieved upcoming milestones');
        console.log('   Count:', upcomingResponse.data.data.count);
        console.log('   Days:', upcomingResponse.data.data.days);
        // Test 8: Get Overdue Milestones
        console.log('\n📋 Test 8: Get Overdue Milestones');
        const overdueResponse = await axios_1.default.get(`${BASE_URL}/roadmap/milestones/overdue`);
        console.log('✅ Retrieved overdue milestones');
        console.log('   Count:', overdueResponse.data.data.count);
        // Test 9: Get MRL Recommendations (Public endpoint)
        console.log('\n📋 Test 9: Get MRL Recommendations');
        delete axios_1.default.defaults.headers.common['Authorization']; // Remove auth for public endpoint
        const mrlResponse = await axios_1.default.get(`${BASE_URL}/roadmap/recommendations/mrl?state=Delhi&district=Central Delhi&cropType=rice`);
        console.log('✅ Retrieved MRL recommendations');
        console.log('   Count:', mrlResponse.data.data.count);
        console.log('   Location:', mrlResponse.data.data.location.state);
        console.log('   Crop Type:', mrlResponse.data.data.cropType);
        // Restore auth header
        axios_1.default.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        // Test 10: Update Roadmap Settings
        console.log('\n📋 Test 10: Update Roadmap Settings');
        const settingsUpdate = {
            weatherAlerts: false,
            isActive: true
        };
        const settingsResponse = await axios_1.default.put(`${BASE_URL}/roadmap/${roadmapId}/settings`, settingsUpdate);
        console.log('✅ Roadmap settings updated');
        console.log('   Weather alerts:', settingsResponse.data.data.roadmap.weatherAlerts);
        console.log('   Is active:', settingsResponse.data.data.roadmap.isActive);
        // Test 11: Get Roadmap Statistics
        console.log('\n📋 Test 11: Get Roadmap Statistics');
        const statsResponse = await axios_1.default.get(`${BASE_URL}/roadmap/statistics`);
        console.log('✅ Retrieved roadmap statistics');
        const stats = statsResponse.data.data.statistics;
        console.log('   Total roadmaps:', stats.totalRoadmaps);
        console.log('   Active roadmaps:', stats.activeRoadmaps);
        console.log('   Completed milestones:', stats.completedMilestones);
        console.log('   Total milestones:', stats.totalMilestones);
        // Test 12: Generate Wheat Roadmap
        console.log('\n📋 Test 12: Generate Wheat Roadmap');
        const wheatRoadmapData = {
            cropType: 'wheat',
            location: {
                latitude: 28.6139,
                longitude: 77.2090,
                address: 'Test Farm, New Delhi',
                state: 'Delhi',
                district: 'Central Delhi'
            },
            farmSize: 1.5,
            sowingDate: new Date('2024-11-15').toISOString(),
            preferredLanguage: 'en'
        };
        const wheatResponse = await axios_1.default.post(`${BASE_URL}/roadmap/generate`, wheatRoadmapData);
        console.log('✅ Wheat roadmap generated successfully');
        console.log('   Roadmap ID:', wheatResponse.data.data.roadmap.id);
        console.log('   Crop Type:', wheatResponse.data.data.roadmap.cropType);
        console.log('   Total Milestones:', wheatResponse.data.data.roadmap.totalMilestones);
        // Test 13: Test Error Handling - Invalid Roadmap ID
        console.log('\n📋 Test 13: Test Error Handling - Invalid Roadmap ID');
        try {
            await axios_1.default.get(`${BASE_URL}/roadmap/invalid-id`);
        }
        catch (error) {
            console.log('✅ Error handling works correctly');
            console.log('   Status:', error.response.status);
            console.log('   Error code:', error.response.data.error.code);
            console.log('   Message:', error.response.data.error.message);
        }
        // Test 14: Test Validation - Invalid Crop Data
        console.log('\n📋 Test 14: Test Validation - Invalid Crop Data');
        try {
            await axios_1.default.post(`${BASE_URL}/roadmap/generate`, {
                cropType: '', // Invalid empty crop type
                location: {
                    latitude: 'invalid', // Invalid latitude
                    longitude: 77.2090,
                    address: 'Test Farm',
                    state: 'Delhi',
                    district: 'Central Delhi'
                },
                sowingDate: 'invalid-date' // Invalid date
            });
        }
        catch (error) {
            console.log('✅ Validation works correctly');
            console.log('   Status:', error.response.status);
            console.log('   Error code:', error.response.data.error.code);
            console.log('   Validation errors:', error.response.data.error.details?.length || 0);
        }
        console.log('\n🎉 All Roadmap API tests completed successfully!\n');
    }
    catch (error) {
        console.error('❌ API test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}
// Helper function to test individual endpoints
async function testEndpoint(method, url, data) {
    try {
        const response = await (0, axios_1.default)({
            method,
            url: `${BASE_URL}${url}`,
            data,
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        });
        console.log(`✅ ${method.toUpperCase()} ${url}`);
        console.log('   Status:', response.status);
        console.log('   Success:', response.data.success);
        return response.data;
    }
    catch (error) {
        console.log(`❌ ${method.toUpperCase()} ${url}`);
        console.log('   Status:', error.response?.status);
        console.log('   Error:', error.response?.data?.error?.message);
        throw error;
    }
}
// Run the test
if (require.main === module) {
    testRoadmapAPI();
}
//# sourceMappingURL=test-roadmap-api.js.map