"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_BASE = 'http://localhost:3000/api';
async function testOrderEndpoints() {
    console.log('🧪 Testing Order API endpoint availability...');
    const endpoints = [
        { method: 'GET', path: '/orders', description: 'Get orders' },
        { method: 'GET', path: '/orders/statistics', description: 'Get order statistics' },
        { method: 'GET', path: '/orders/dealer/my-orders', description: 'Get dealer orders' },
        { method: 'GET', path: '/orders/farmer/my-orders', description: 'Get farmer orders' }
    ];
    for (const endpoint of endpoints) {
        try {
            console.log(`\nTesting ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
            const response = await (0, axios_1.default)({
                method: endpoint.method.toLowerCase(),
                url: `${API_BASE}${endpoint.path}`,
                validateStatus: () => true // Don't throw on any status code
            });
            if (response.status === 401) {
                console.log('✅ Endpoint exists and correctly requires authentication');
            }
            else if (response.status === 404) {
                console.log('❌ Endpoint not found');
            }
            else {
                console.log(`✅ Endpoint exists (status: ${response.status})`);
            }
        }
        catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log('❌ Server not running');
                break;
            }
            else {
                console.log(`❌ Error testing endpoint: ${error.message}`);
            }
        }
    }
    console.log('\n🎉 Order endpoint availability test completed!');
}
testOrderEndpoints();
//# sourceMappingURL=test-orders-endpoints.js.map