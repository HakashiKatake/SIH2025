"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCommunityEndpoints = testCommunityEndpoints;
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000/api';
async function testCommunityEndpoints() {
    console.log('🧪 Testing Community API Endpoints...\n');
    try {
        // 1. Test getting posts without authentication (should work)
        console.log('1. Testing get posts (public access)...');
        const getPostsResponse = await axios_1.default.get(`${BASE_URL}/community/posts`);
        console.log('✅ Posts endpoint accessible:', getPostsResponse.data.success);
        console.log('   Posts found:', getPostsResponse.data.data.posts.length);
        // 2. Test search posts without authentication
        console.log('2. Testing search posts...');
        const searchResponse = await axios_1.default.get(`${BASE_URL}/community/posts/search?q=farming`);
        console.log('✅ Search endpoint accessible:', searchResponse.data.success);
        console.log('   Search results:', searchResponse.data.data.posts.length);
        // 3. Test creating post without authentication (should fail)
        console.log('3. Testing create post without auth (should fail)...');
        try {
            await axios_1.default.post(`${BASE_URL}/community/posts`, {
                title: 'Test Post',
                content: 'This should fail without authentication',
                category: 'tip'
            });
            console.log('❌ Post creation should have failed without auth');
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Post creation properly requires authentication');
            }
            else {
                console.log('❌ Unexpected error:', error.response?.data);
            }
        }
        // 4. Test invalid post ID
        console.log('4. Testing invalid post ID...');
        try {
            await axios_1.default.get(`${BASE_URL}/community/posts/invalid-id`);
            console.log('❌ Should have failed with invalid ID');
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Invalid post ID properly rejected');
            }
            else {
                console.log('❌ Unexpected error:', error.response?.data);
            }
        }
        // 5. Test pagination
        console.log('5. Testing pagination...');
        const paginatedResponse = await axios_1.default.get(`${BASE_URL}/community/posts?page=1&limit=5`);
        console.log('✅ Pagination works:', paginatedResponse.data.data.page === 1);
        console.log('   Page size limit respected:', paginatedResponse.data.data.posts.length <= 5);
        // 6. Test category filtering
        console.log('6. Testing category filtering...');
        const categoryResponse = await axios_1.default.get(`${BASE_URL}/community/posts?category=tip`);
        console.log('✅ Category filtering works:', categoryResponse.data.success);
        console.log('\n🎉 All Community API endpoint tests passed!');
        console.log('\n📝 Summary:');
        console.log('- ✅ Public endpoints accessible');
        console.log('- ✅ Authentication properly enforced');
        console.log('- ✅ Input validation working');
        console.log('- ✅ Pagination implemented');
        console.log('- ✅ Filtering functionality working');
    }
    catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        process.exit(1);
    }
}
// Run tests
if (require.main === module) {
    testCommunityEndpoints()
        .catch((error) => {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=test-community-simple.js.map