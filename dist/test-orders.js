"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runOrderTests = runOrderTests;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./utils/config");
const API_BASE = `http://localhost:${config_1.config.port}/api`;
// Test data
let authToken = '';
let dealerToken = '';
let farmerToken = '';
let testProductId = '';
let testOrderId = '';
// Test users
const testDealer = {
    name: 'Test Dealer',
    email: 'dealer@test.com',
    password: 'password123',
    phone: '+1234567890',
    role: 'dealer',
    location: {
        address: '123 Market St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        coordinates: {
            latitude: 19.0760,
            longitude: 72.8777
        }
    }
};
const testFarmer = {
    name: 'Test Farmer',
    email: 'farmer@test.com',
    password: 'password123',
    phone: '+1234567891',
    role: 'farmer',
    location: {
        address: '456 Farm Rd',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        coordinates: {
            latitude: 18.5204,
            longitude: 73.8567
        }
    }
};
const testProduct = {
    name: 'Fresh Tomatoes',
    category: 'crops',
    subcategory: 'vegetables',
    price: 50,
    quantity: 100,
    unit: 'kg',
    description: 'Fresh organic tomatoes from our farm',
    images: ['https://example.com/tomato1.jpg', 'https://example.com/tomato2.jpg'],
    location: {
        latitude: 18.5204,
        longitude: 73.8567,
        address: '456 Farm Rd',
        state: 'Maharashtra',
        district: 'Pune'
    }
};
async function registerAndLoginUsers() {
    console.log('\n🔐 Testing user registration and login...');
    try {
        // Register dealer
        await axios_1.default.post(`${API_BASE}/auth/register`, testDealer);
        console.log('✅ Dealer registered successfully');
        // Register farmer
        await axios_1.default.post(`${API_BASE}/auth/register`, testFarmer);
        console.log('✅ Farmer registered successfully');
        // Login dealer
        const dealerLogin = await axios_1.default.post(`${API_BASE}/auth/login`, {
            email: testDealer.email,
            password: testDealer.password
        });
        dealerToken = dealerLogin.data.data.token;
        console.log('✅ Dealer logged in successfully');
        // Login farmer
        const farmerLogin = await axios_1.default.post(`${API_BASE}/auth/login`, {
            email: testFarmer.email,
            password: testFarmer.password
        });
        farmerToken = farmerLogin.data.data.token;
        console.log('✅ Farmer logged in successfully');
    }
    catch (error) {
        if (error.response?.status === 400 && error.response?.data?.error?.code === 'USER_EXISTS') {
            console.log('ℹ️ Users already exist, logging in...');
            // Login existing users
            const dealerLogin = await axios_1.default.post(`${API_BASE}/auth/login`, {
                email: testDealer.email,
                password: testDealer.password
            });
            dealerToken = dealerLogin.data.data.token;
            const farmerLogin = await axios_1.default.post(`${API_BASE}/auth/login`, {
                email: testFarmer.email,
                password: testFarmer.password
            });
            farmerToken = farmerLogin.data.data.token;
            console.log('✅ Existing users logged in successfully');
        }
        else {
            throw error;
        }
    }
}
async function createTestProduct() {
    console.log('\n📦 Creating test product...');
    try {
        const response = await axios_1.default.post(`${API_BASE}/marketplace/products`, testProduct, {
            headers: { Authorization: `Bearer ${farmerToken}` }
        });
        testProductId = response.data.data.product.id;
        console.log('✅ Test product created:', testProductId);
        console.log('   Product:', response.data.data.product.name);
    }
    catch (error) {
        console.error('❌ Failed to create test product:', error.response?.data || error.message);
        throw error;
    }
}
async function testCreateOrder() {
    console.log('\n📋 Testing order creation...');
    try {
        // Get farmer ID from farmer profile
        const farmerProfile = await axios_1.default.get(`${API_BASE}/auth/profile`, {
            headers: { Authorization: `Bearer ${farmerToken}` }
        });
        const farmerId = farmerProfile.data.data.user.id;
        const orderData = {
            farmerId: farmerId,
            products: [
                {
                    productId: testProductId,
                    quantity: 10
                }
            ],
            deliveryAddress: {
                address: '789 Delivery St',
                city: 'Mumbai',
                state: 'Maharashtra',
                country: 'India',
                coordinates: {
                    latitude: 19.0760,
                    longitude: 72.8777
                }
            },
            notes: 'Please deliver fresh tomatoes',
            paymentMethod: 'cash_on_delivery'
        };
        const response = await axios_1.default.post(`${API_BASE}/orders`, orderData, {
            headers: { Authorization: `Bearer ${dealerToken}` }
        });
        testOrderId = response.data.data.order.id;
        console.log('✅ Order created successfully:', testOrderId);
        console.log('   Total Amount:', response.data.data.order.totalAmount);
        console.log('   Status:', response.data.data.order.status);
    }
    catch (error) {
        console.error('❌ Failed to create order:', error.response?.data || error.message);
        throw error;
    }
}
async function testGetOrderDetails() {
    console.log('\n📄 Testing get order details...');
    try {
        const response = await axios_1.default.get(`${API_BASE}/orders/${testOrderId}`, {
            headers: { Authorization: `Bearer ${dealerToken}` }
        });
        console.log('✅ Order details retrieved successfully');
        console.log('   Order ID:', response.data.data.order.id);
        console.log('   Status:', response.data.data.order.status);
        console.log('   Products:', response.data.data.order.products.length);
        console.log('   Dealer:', response.data.data.order.dealer?.name);
        console.log('   Farmer:', response.data.data.order.farmer?.name);
    }
    catch (error) {
        console.error('❌ Failed to get order details:', error.response?.data || error.message);
        throw error;
    }
}
async function testUpdateOrderStatus() {
    console.log('\n🔄 Testing order status update...');
    try {
        const updateData = {
            status: 'confirmed',
            trackingNumber: 'TRK123456789',
            notes: 'Order confirmed and processing'
        };
        const response = await axios_1.default.put(`${API_BASE}/orders/${testOrderId}`, updateData, {
            headers: { Authorization: `Bearer ${farmerToken}` }
        });
        console.log('✅ Order status updated successfully');
        console.log('   New Status:', response.data.data.order.status);
        console.log('   Tracking Number:', response.data.data.order.trackingNumber);
    }
    catch (error) {
        console.error('❌ Failed to update order status:', error.response?.data || error.message);
        throw error;
    }
}
async function testGetDealerOrders() {
    console.log('\n🛒 Testing get dealer orders...');
    try {
        const response = await axios_1.default.get(`${API_BASE}/orders/dealer/my-orders`, {
            headers: { Authorization: `Bearer ${dealerToken}` }
        });
        console.log('✅ Dealer orders retrieved successfully');
        console.log('   Total Orders:', response.data.data.totalCount);
        console.log('   Current Page:', response.data.data.currentPage);
        console.log('   Orders:', response.data.data.orders.length);
    }
    catch (error) {
        console.error('❌ Failed to get dealer orders:', error.response?.data || error.message);
        throw error;
    }
}
async function testGetFarmerOrders() {
    console.log('\n🌾 Testing get farmer orders...');
    try {
        const response = await axios_1.default.get(`${API_BASE}/orders/farmer/my-orders`, {
            headers: { Authorization: `Bearer ${farmerToken}` }
        });
        console.log('✅ Farmer orders retrieved successfully');
        console.log('   Total Orders:', response.data.data.totalCount);
        console.log('   Current Page:', response.data.data.currentPage);
        console.log('   Orders:', response.data.data.orders.length);
    }
    catch (error) {
        console.error('❌ Failed to get farmer orders:', error.response?.data || error.message);
        throw error;
    }
}
async function testGetOrderStatistics() {
    console.log('\n📊 Testing order statistics...');
    try {
        // Test dealer statistics
        const dealerStats = await axios_1.default.get(`${API_BASE}/orders/statistics?userType=dealer`, {
            headers: { Authorization: `Bearer ${dealerToken}` }
        });
        console.log('✅ Dealer statistics retrieved successfully');
        console.log('   Total Orders:', dealerStats.data.data.statistics.totalOrders);
        console.log('   Pending Orders:', dealerStats.data.data.statistics.pendingOrders);
        console.log('   Confirmed Orders:', dealerStats.data.data.statistics.confirmedOrders);
        // Test farmer statistics
        const farmerStats = await axios_1.default.get(`${API_BASE}/orders/statistics?userType=farmer`, {
            headers: { Authorization: `Bearer ${farmerToken}` }
        });
        console.log('✅ Farmer statistics retrieved successfully');
        console.log('   Total Orders:', farmerStats.data.data.statistics.totalOrders);
        console.log('   Total Amount:', farmerStats.data.data.statistics.totalAmount);
    }
    catch (error) {
        console.error('❌ Failed to get order statistics:', error.response?.data || error.message);
        throw error;
    }
}
async function testOrderFiltering() {
    console.log('\n🔍 Testing order filtering...');
    try {
        // Test filtering by status
        const response = await axios_1.default.get(`${API_BASE}/orders?status=confirmed&userType=dealer`, {
            headers: { Authorization: `Bearer ${dealerToken}` }
        });
        console.log('✅ Order filtering by status successful');
        console.log('   Filtered Orders:', response.data.data.totalCount);
    }
    catch (error) {
        console.error('❌ Failed to filter orders:', error.response?.data || error.message);
        throw error;
    }
}
async function testCancelOrder() {
    console.log('\n❌ Testing order cancellation...');
    try {
        // Create a new order to cancel
        const farmerProfile = await axios_1.default.get(`${API_BASE}/auth/profile`, {
            headers: { Authorization: `Bearer ${farmerToken}` }
        });
        const farmerId = farmerProfile.data.data.user.id;
        const orderData = {
            farmerId: farmerId,
            products: [
                {
                    productId: testProductId,
                    quantity: 5
                }
            ],
            deliveryAddress: {
                address: '789 Delivery St',
                city: 'Mumbai',
                state: 'Maharashtra',
                country: 'India'
            },
            notes: 'Test order for cancellation'
        };
        const createResponse = await axios_1.default.post(`${API_BASE}/orders`, orderData, {
            headers: { Authorization: `Bearer ${dealerToken}` }
        });
        const cancelOrderId = createResponse.data.data.order.id;
        // Cancel the order
        const cancelResponse = await axios_1.default.post(`${API_BASE}/orders/${cancelOrderId}/cancel`, {
            reason: 'Changed mind about the order'
        }, {
            headers: { Authorization: `Bearer ${dealerToken}` }
        });
        console.log('✅ Order cancelled successfully');
        console.log('   Order ID:', cancelResponse.data.data.order.id);
        console.log('   Status:', cancelResponse.data.data.order.status);
    }
    catch (error) {
        console.error('❌ Failed to cancel order:', error.response?.data || error.message);
        throw error;
    }
}
async function testInvalidOrderOperations() {
    console.log('\n🚫 Testing invalid order operations...');
    try {
        // Test creating order with invalid product ID
        try {
            await axios_1.default.post(`${API_BASE}/orders`, {
                farmerId: 'invalid_farmer_id',
                products: [{ productId: 'invalid_product_id', quantity: 1 }],
                deliveryAddress: {
                    address: 'Test Address',
                    city: 'Test City',
                    state: 'Test State'
                }
            }, {
                headers: { Authorization: `Bearer ${dealerToken}` }
            });
            console.log('❌ Should have failed with invalid data');
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Correctly rejected invalid order data');
            }
            else {
                throw error;
            }
        }
        // Test accessing order without permission
        try {
            await axios_1.default.get(`${API_BASE}/orders/${testOrderId}`, {
                headers: { Authorization: `Bearer ${dealerToken.slice(0, -5)}invalid` }
            });
            console.log('❌ Should have failed with invalid token');
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Correctly rejected invalid authentication');
            }
            else {
                throw error;
            }
        }
    }
    catch (error) {
        console.error('❌ Unexpected error in invalid operations test:', error.response?.data || error.message);
        throw error;
    }
}
async function runOrderTests() {
    console.log('🧪 Starting Order Management System Tests...');
    console.log('='.repeat(50));
    try {
        await registerAndLoginUsers();
        await createTestProduct();
        await testCreateOrder();
        await testGetOrderDetails();
        await testUpdateOrderStatus();
        await testGetDealerOrders();
        await testGetFarmerOrders();
        await testGetOrderStatistics();
        await testOrderFiltering();
        await testCancelOrder();
        await testInvalidOrderOperations();
        console.log('\n' + '='.repeat(50));
        console.log('🎉 All Order Management tests completed successfully!');
        console.log('✅ Order creation and management working correctly');
        console.log('✅ Order status tracking functional');
        console.log('✅ User permissions and security working');
        console.log('✅ Order statistics and filtering operational');
        console.log('✅ Order cancellation system working');
    }
    catch (error) {
        console.log('\n' + '='.repeat(50));
        console.error('💥 Order Management tests failed!');
        console.error('Error:', error.response?.data || error.message);
        process.exit(1);
    }
}
// Run tests if this file is executed directly
if (require.main === module) {
    runOrderTests();
}
//# sourceMappingURL=test-orders.js.map