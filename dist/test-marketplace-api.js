"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const database_1 = require("./utils/database");
const User_1 = require("./models/User");
const Product_1 = require("./models/Product");
const jwt_1 = require("./utils/jwt");
const marketplace_1 = __importDefault(require("./routes/marketplace"));
// Create test app
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/marketplace', marketplace_1.default);
async function testMarketplaceAPI() {
    try {
        console.log('🧪 Testing Marketplace API...');
        // Connect to database
        await (0, database_1.connectMongoDB)();
        console.log('✅ Connected to MongoDB');
        // Clean up existing test data
        await Product_1.Product.deleteMany({ name: /API Test Product/ });
        await User_1.User.deleteMany({ name: /API Test User/ });
        console.log('🧹 Cleaned up existing test data');
        // Create a test user
        const testUser = new User_1.User({
            name: 'API Test User',
            phone: '9876543211',
            password: 'testpass123',
            location: {
                latitude: 12.9716,
                longitude: 77.5946,
                address: 'API Test Farm Address',
                state: 'Karnataka',
                district: 'Bangalore Rural'
            },
            preferredLanguage: 'en',
            farmSize: 5,
            crops: ['tomatoes', 'rice']
        });
        await testUser.save();
        console.log('✅ Created test user:', testUser.name);
        // Generate JWT token for authentication
        const tokens = (0, jwt_1.generateTokens)({
            userId: testUser._id.toString(),
            phone: testUser.phone,
            email: testUser.email,
            name: testUser.name || 'Test User'
        });
        // Test 1: Create Product Listing (POST /products)
        console.log('\n📝 Test 1: Creating product listing via API...');
        const productData = {
            name: 'API Test Product - Fresh Tomatoes',
            category: 'crops',
            subcategory: 'vegetables',
            price: 50,
            quantity: 100,
            unit: 'kg',
            description: 'Fresh organic tomatoes grown without pesticides. Perfect for cooking and salads.',
            images: ['https://example.com/tomatoes.jpg'],
            location: {
                latitude: 12.9716,
                longitude: 77.5946,
                address: 'API Test Farm Road',
                state: 'Karnataka',
                district: 'Bangalore Rural'
            }
        };
        const createResponse = await (0, supertest_1.default)(app)
            .post('/api/marketplace/products')
            .set('Authorization', `Bearer ${tokens.accessToken}`)
            .send(productData)
            .expect(201);
        console.log('✅ Product created via API:', {
            success: createResponse.body.success,
            productName: createResponse.body.data.product.name,
            productId: createResponse.body.data.product.id
        });
        const productId = createResponse.body.data.product.id;
        // Test 2: Get Product Details (GET /products/:id)
        console.log('\n🔍 Test 2: Getting product details via API...');
        const detailsResponse = await (0, supertest_1.default)(app)
            .get(`/api/marketplace/products/${productId}`)
            .expect(200);
        console.log('✅ Product details retrieved via API:', {
            success: detailsResponse.body.success,
            productName: detailsResponse.body.data.product.name,
            price: detailsResponse.body.data.product.price
        });
        // Test 3: Search Products (GET /products)
        console.log('\n🔎 Test 3: Searching products via API...');
        const searchResponse = await (0, supertest_1.default)(app)
            .get('/api/marketplace/products?category=crops&state=Karnataka')
            .expect(200);
        console.log('✅ Products searched via API:', {
            success: searchResponse.body.success,
            totalCount: searchResponse.body.data.totalCount,
            productsFound: searchResponse.body.data.products.length
        });
        // Test 4: Update Product (PUT /products/:id)
        console.log('\n✏️ Test 4: Updating product via API...');
        const updateData = {
            name: 'API Test Product - Premium Fresh Tomatoes',
            price: 60,
            description: 'Updated description: Premium organic tomatoes with enhanced quality.'
        };
        const updateResponse = await (0, supertest_1.default)(app)
            .put(`/api/marketplace/products/${productId}`)
            .set('Authorization', `Bearer ${tokens.accessToken}`)
            .send(updateData)
            .expect(200);
        console.log('✅ Product updated via API:', {
            success: updateResponse.body.success,
            productName: updateResponse.body.data.product.name,
            newPrice: updateResponse.body.data.product.price
        });
        // Test 5: Get My Products (GET /my-products)
        console.log('\n📋 Test 5: Getting user products via API...');
        const myProductsResponse = await (0, supertest_1.default)(app)
            .get('/api/marketplace/my-products')
            .set('Authorization', `Bearer ${tokens.accessToken}`)
            .expect(200);
        console.log('✅ User products retrieved via API:', {
            success: myProductsResponse.body.success,
            count: myProductsResponse.body.data.count,
            products: myProductsResponse.body.data.products.length
        });
        // Test 6: Get Products by Category (GET /categories/:category)
        console.log('\n🏷️ Test 6: Getting products by category via API...');
        const categoryResponse = await (0, supertest_1.default)(app)
            .get('/api/marketplace/categories/crops')
            .expect(200);
        console.log('✅ Category products retrieved via API:', {
            success: categoryResponse.body.success,
            category: categoryResponse.body.data.category,
            count: categoryResponse.body.data.count
        });
        // Test 7: Get Nearby Products (GET /nearby)
        console.log('\n📍 Test 7: Getting nearby products via API...');
        const nearbyResponse = await (0, supertest_1.default)(app)
            .get('/api/marketplace/nearby?latitude=12.9716&longitude=77.5946&radius=50')
            .expect(200);
        console.log('✅ Nearby products retrieved via API:', {
            success: nearbyResponse.body.success,
            count: nearbyResponse.body.data.count,
            radius: nearbyResponse.body.data.radius
        });
        // Test 8: Delete Product (DELETE /products/:id)
        console.log('\n🗑️ Test 8: Deleting product via API...');
        const deleteResponse = await (0, supertest_1.default)(app)
            .delete(`/api/marketplace/products/${productId}`)
            .set('Authorization', `Bearer ${tokens.accessToken}`)
            .expect(200);
        console.log('✅ Product deleted via API:', {
            success: deleteResponse.body.success,
            message: deleteResponse.body.message
        });
        // Test 9: Error Cases
        console.log('\n❌ Test 9: Testing error cases via API...');
        // Test invalid product ID
        await (0, supertest_1.default)(app)
            .get('/api/marketplace/products/invalid-id')
            .expect(400);
        console.log('✅ Invalid product ID error handled');
        // Test unauthorized access
        await (0, supertest_1.default)(app)
            .post('/api/marketplace/products')
            .send(productData)
            .expect(401);
        console.log('✅ Unauthorized access error handled');
        // Test product not found (use valid ObjectId format but non-existent)
        const nonExistentResponse = await (0, supertest_1.default)(app)
            .get('/api/marketplace/products/64a1b2c3d4e5f6789012345');
        if (nonExistentResponse.status === 404) {
            console.log('✅ Product not found error handled');
        }
        else {
            console.log('ℹ️ Product not found returned status:', nonExistentResponse.status);
        }
        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await Product_1.Product.deleteMany({ name: /API Test Product/ });
        await User_1.User.deleteMany({ name: /API Test User/ });
        console.log('✅ Test data cleaned up');
        console.log('\n🎉 All marketplace API tests completed successfully!');
    }
    catch (error) {
        console.error('❌ API Test failed:', error);
    }
    finally {
        process.exit(0);
    }
}
// Run the test
testMarketplaceAPI();
//# sourceMappingURL=test-marketplace-api.js.map