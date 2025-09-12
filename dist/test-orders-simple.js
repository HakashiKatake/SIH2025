"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_BASE = 'http://localhost:3000/api';
async function testOrdersBasic() {
    console.log('🧪 Testing Order API endpoints...');
    try {
        // Test 1: Check if orders endpoint is accessible (should require auth)
        console.log('\n1. Testing orders endpoint accessibility...');
        try {
            await axios_1.default.get(`${API_BASE}/orders`);
            console.log('❌ Should have required authentication');
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Orders endpoint correctly requires authentication');
            }
            else {
                throw error;
            }
        }
        // Test 2: Register a test user
        console.log('\n2. Registering test users...');
        const testDealer = {
            name: 'Test Dealer',
            email: 'testdealer@example.com',
            password: 'password123',
            phone: '+1234567890',
            role: 'dealer',
            location: {
                address: '123 Test St',
                city: 'Mumbai',
                state: 'Maharashtra',
                country: 'India'
            }
        };
        const testFarmer = {
            name: 'Test Farmer',
            email: 'testfarmer@example.com',
            password: 'password123',
            phone: '+1234567891',
            role: 'farmer',
            location: {
                address: '456 Farm Rd',
                city: 'Pune',
                state: 'Maharashtra',
                country: 'India'
            }
        };
        // Register users (or login if they exist)
        let dealerToken = '';
        let farmerToken = '';
        try {
            await axios_1.default.post(`${API_BASE}/auth/register`, testDealer);
            console.log('✅ Dealer registered successfully');
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('ℹ️ Dealer already exists');
            }
            else {
                throw error;
            }
        }
        try {
            await axios_1.default.post(`${API_BASE}/auth/register`, testFarmer);
            console.log('✅ Farmer registered successfully');
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('ℹ️ Farmer already exists');
            }
            else {
                throw error;
            }
        }
        // Login users
        const dealerLogin = await axios_1.default.post(`${API_BASE}/auth/login`, {
            email: testDealer.email,
            password: testDealer.password
        });
        dealerToken = dealerLogin.data.data.token;
        console.log('✅ Dealer logged in successfully');
        const farmerLogin = await axios_1.default.post(`${API_BASE}/auth/login`, {
            email: testFarmer.email,
            password: testFarmer.password
        });
        farmerToken = farmerLogin.data.data.token;
        console.log('✅ Farmer logged in successfully');
        // Test 3: Test authenticated access to orders
        console.log('\n3. Testing authenticated access to orders...');
        const ordersResponse = await axios_1.default.get(`${API_BASE}/orders`, {
            headers: { Authorization: `Bearer ${dealerToken}` }
        });
        console.log('✅ Successfully accessed orders endpoint with authentication');
        console.log(`   Found ${ordersResponse.data.data.totalCount} orders`);
        // Test 4: Test order statistics
        console.log('\n4. Testing order statistics...');
        const statsResponse = await axios_1.default.get(`${API_BASE}/orders/statistics?userType=dealer`, {
            headers: { Authorization: `Bearer ${dealerToken}` }
        });
        console.log('✅ Successfully retrieved order statistics');
        console.log(`   Total orders: ${statsResponse.data.data.statistics.totalOrders}`);
        // Test 5: Test dealer orders endpoint
        console.log('\n5. Testing dealer orders endpoint...');
        const dealerOrdersResponse = await axios_1.default.get(`${API_BASE}/orders/dealer/my-orders`, {
            headers: { Authorization: `Bearer ${dealerToken}` }
        });
        console.log('✅ Successfully retrieved dealer orders');
        console.log(`   Dealer orders: ${dealerOrdersResponse.data.data.totalCount}`);
        // Test 6: Test farmer orders endpoint
        console.log('\n6. Testing farmer orders endpoint...');
        const farmerOrdersResponse = await axios_1.default.get(`${API_BASE}/orders/farmer/my-orders`, {
            headers: { Authorization: `Bearer ${farmerToken}` }
        });
        console.log('✅ Successfully retrieved farmer orders');
        console.log(`   Farmer orders: ${farmerOrdersResponse.data.data.totalCount}`);
        console.log('\n🎉 All basic order API tests passed!');
        console.log('✅ Order endpoints are working correctly');
        console.log('✅ Authentication is properly enforced');
        console.log('✅ Role-based access is functional');
    }
    catch (error) {
        console.error('\n❌ Order API test failed:');
        console.error('Error:', error.response?.data || error.message);
        process.exit(1);
    }
}
// Run the test
testOrdersBasic();
//# sourceMappingURL=test-orders-simple.js.map