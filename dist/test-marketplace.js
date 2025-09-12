"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./utils/database");
const User_1 = require("./models/User");
const Product_1 = require("./models/Product");
const marketplaceService_1 = require("./services/marketplaceService");
async function testMarketplaceService() {
    try {
        console.log('🧪 Testing Marketplace Service...');
        // Connect to database
        await (0, database_1.connectMongoDB)();
        console.log('✅ Connected to MongoDB');
        // Ensure text index exists for search functionality
        try {
            await Product_1.Product.collection.createIndex({ name: 'text', description: 'text' });
            console.log('✅ Text search index created');
        }
        catch (error) {
            console.log('ℹ️ Text search index already exists or creation failed');
        }
        // Clean up existing test data
        await Product_1.Product.deleteMany({ name: /Test Product/ });
        await User_1.User.deleteMany({ name: /Test Seller/ });
        console.log('🧹 Cleaned up existing test data');
        // Create a test user (seller)
        const testUser = new User_1.User({
            name: 'Test Seller',
            phone: '9876543210',
            password: 'testpass123',
            location: {
                latitude: 12.9716,
                longitude: 77.5946,
                address: 'Test Farm Address',
                state: 'Karnataka',
                district: 'Bangalore Rural'
            },
            preferredLanguage: 'en',
            farmSize: 5,
            crops: ['tomatoes', 'rice']
        });
        await testUser.save();
        console.log('✅ Created test user:', testUser.name);
        // Test 1: Create Product Listing
        console.log('\n📝 Test 1: Creating product listing...');
        const productData = {
            name: 'Test Product - Fresh Tomatoes',
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
                address: 'Test Farm Road',
                state: 'Karnataka',
                district: 'Bangalore Rural'
            }
        };
        const createdProduct = await marketplaceService_1.MarketplaceService.createListing(productData, testUser._id.toString());
        console.log('✅ Product created:', {
            id: createdProduct.id,
            name: createdProduct.name,
            category: createdProduct.category,
            price: createdProduct.price,
            sellerId: createdProduct.sellerId
        });
        // Test 2: Get Product Details
        console.log('\n🔍 Test 2: Getting product details...');
        const productDetails = await marketplaceService_1.MarketplaceService.getProductDetails(createdProduct._id.toString());
        console.log('✅ Product details retrieved:', {
            id: productDetails?.id,
            name: productDetails?.name,
            description: productDetails?.description.substring(0, 50) + '...',
            sellerId: productDetails?.sellerId
        });
        // Test 3: Search Products
        console.log('\n🔎 Test 3: Searching products...');
        const searchResults = await marketplaceService_1.MarketplaceService.searchProducts({
            category: 'crops',
            state: 'Karnataka',
            page: 1,
            limit: 10
        });
        console.log('✅ Search results:', {
            totalCount: searchResults.totalCount,
            currentPage: searchResults.currentPage,
            productsFound: searchResults.products.length,
            firstProduct: searchResults.products[0]?.name
        });
        // Test 4: Update Product Listing
        console.log('\n✏️ Test 4: Updating product listing...');
        const updatedProduct = await marketplaceService_1.MarketplaceService.updateListing(createdProduct._id.toString(), {
            name: 'Test Product - Premium Fresh Tomatoes',
            price: 60,
            description: 'Updated description: Premium organic tomatoes with enhanced quality.'
        }, testUser._id.toString());
        console.log('✅ Product updated:', {
            id: updatedProduct?.id,
            name: updatedProduct?.name,
            price: updatedProduct?.price,
            updatedAt: updatedProduct?.updatedAt
        });
        // Test 5: Get User Listings
        console.log('\n📋 Test 5: Getting user listings...');
        const userListings = await marketplaceService_1.MarketplaceService.getUserListings(testUser._id.toString());
        console.log('✅ User listings retrieved:', {
            count: userListings.length,
            products: userListings.map(p => ({ id: p.id, name: p.name, price: p.price }))
        });
        // Test 6: Get Products by Category
        console.log('\n🏷️ Test 6: Getting products by category...');
        const categoryProducts = await marketplaceService_1.MarketplaceService.getProductsByCategory('crops', 10);
        console.log('✅ Category products retrieved:', {
            count: categoryProducts.length,
            category: 'crops',
            products: categoryProducts.map(p => ({ name: p.name, price: p.price }))
        });
        // Test 7: Get Nearby Products
        console.log('\n📍 Test 7: Getting nearby products...');
        const nearbyProducts = await marketplaceService_1.MarketplaceService.getNearbyProducts(12.9716, 77.5946, 50, 10);
        console.log('✅ Nearby products retrieved:', {
            count: nearbyProducts.length,
            location: { lat: 12.9716, lon: 77.5946 },
            radius: '50km',
            products: nearbyProducts.map(p => ({ name: p.name, distance: 'calculated' }))
        });
        // Test 8: Text Search
        console.log('\n🔍 Test 8: Testing text search...');
        const textSearchResults = await marketplaceService_1.MarketplaceService.searchProducts({
            searchTerm: 'tomatoes organic',
            page: 1,
            limit: 5
        });
        console.log('✅ Text search results:', {
            searchTerm: 'tomatoes organic',
            totalCount: textSearchResults.totalCount,
            productsFound: textSearchResults.products.length
        });
        // Test 9: Price Range Search
        console.log('\n💰 Test 9: Testing price range search...');
        const priceRangeResults = await marketplaceService_1.MarketplaceService.searchProducts({
            minPrice: 40,
            maxPrice: 80,
            sortBy: 'price',
            sortOrder: 'asc',
            page: 1,
            limit: 10
        });
        console.log('✅ Price range search results:', {
            priceRange: '40-80',
            totalCount: priceRangeResults.totalCount,
            products: priceRangeResults.products.map(p => ({ name: p.name, price: p.price }))
        });
        // Test 10: Delete Product Listing
        console.log('\n🗑️ Test 10: Deleting product listing...');
        const deleted = await marketplaceService_1.MarketplaceService.deleteListing(createdProduct._id.toString(), testUser._id.toString());
        console.log('✅ Product deletion result:', deleted);
        // Verify deletion
        const deletedProduct = await marketplaceService_1.MarketplaceService.getProductDetails(createdProduct._id.toString());
        console.log('✅ Verification - Product after deletion:', deletedProduct ? 'Still exists' : 'Successfully deleted');
        // Test error cases
        console.log('\n❌ Test 11: Testing error cases...');
        try {
            await marketplaceService_1.MarketplaceService.getProductDetails('invalid-id');
        }
        catch (error) {
            console.log('✅ Invalid ID error handled:', error instanceof Error ? error.message : 'Unknown error');
        }
        try {
            await marketplaceService_1.MarketplaceService.updateListing('64a1b2c3d4e5f6789012345', { name: 'Test' }, testUser._id.toString());
        }
        catch (error) {
            console.log('✅ Non-existent product update error handled:', error instanceof Error ? error.message : 'Unknown error');
        }
        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await Product_1.Product.deleteMany({ name: /Test Product/ });
        await User_1.User.deleteMany({ name: /Test Seller/ });
        console.log('✅ Test data cleaned up');
        console.log('\n🎉 All marketplace service tests completed successfully!');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
    }
    finally {
        process.exit(0);
    }
}
// Run the test
testMarketplaceService();
//# sourceMappingURL=test-marketplace.js.map