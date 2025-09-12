"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("./utils/cloudinary");
const imageUtils_1 = require("./utils/imageUtils");
async function testCloudinaryIntegration() {
    console.log('🧪 Testing Cloudinary Integration...\n');
    // Test 1: Connection
    console.log('1. Testing Cloudinary connection...');
    const isConnected = await (0, cloudinary_1.testCloudinaryConnection)();
    console.log(`   Connection status: ${isConnected ? '✅ Connected' : '❌ Failed'}\n`);
    // Test 2: URL Generation (doesn't require actual upload)
    console.log('2. Testing URL generation utilities...');
    const testPublicId = 'farmer-app/crops/test_image_123';
    try {
        const mobileUrl = imageUtils_1.ImageUrlGenerator.getMobileOptimized(testPublicId);
        const thumbnailUrl = imageUtils_1.ImageUrlGenerator.getThumbnail(testPublicId);
        const responsiveSizes = imageUtils_1.ImageUrlGenerator.getResponsiveSizes(testPublicId);
        console.log('   ✅ Mobile optimized URL:', mobileUrl);
        console.log('   ✅ Thumbnail URL:', thumbnailUrl);
        console.log('   ✅ Responsive sizes generated:', Object.keys(responsiveSizes).length, 'sizes');
        // Test URL validation
        const isValidUrl = imageUtils_1.ImageUrlGenerator.isCloudinaryUrl(mobileUrl);
        console.log('   ✅ URL validation:', isValidUrl ? 'Valid' : 'Invalid');
    }
    catch (error) {
        console.log('   ❌ URL generation failed:', error);
    }
    console.log('\n3. Testing public ID extraction...');
    const testUrl = 'https://res.cloudinary.com/demo/image/upload/v1234567890/farmer-app/crops/test_image.jpg';
    const extractedId = imageUtils_1.ImageUrlGenerator.extractPublicId(testUrl);
    console.log('   ✅ Extracted public ID:', extractedId);
    console.log('\n🎉 Cloudinary integration test completed!');
    console.log('\n📝 Note: To test actual image upload, you need to:');
    console.log('   1. Set up your Cloudinary credentials in .env file');
    console.log('   2. Use the upload middleware in your routes');
    console.log('   3. Call ImageService.uploadImage() with actual image buffer');
}
// Run the test
testCloudinaryIntegration().catch(console.error);
//# sourceMappingURL=test-cloudinary.js.map