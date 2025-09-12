"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCommunityAPI = testCommunityAPI;
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000/api';
let testUser;
let testAdmin;
let testPostId;
let testCommentId;
async function registerAndLoginUser(userData) {
    try {
        // Register user
        const registerResponse = await axios_1.default.post(`${BASE_URL}/auth/register`, userData);
        console.log('✅ User registered:', registerResponse.data.data.user.email);
        // Login user
        const loginResponse = await axios_1.default.post(`${BASE_URL}/auth/login`, {
            email: userData.email,
            password: userData.password,
        });
        return {
            token: loginResponse.data.data.token,
            userId: loginResponse.data.data.user.id,
            role: loginResponse.data.data.user.role,
        };
    }
    catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
            // User already exists, just login
            const loginResponse = await axios_1.default.post(`${BASE_URL}/auth/login`, {
                email: userData.email,
                password: userData.password,
            });
            return {
                token: loginResponse.data.data.token,
                userId: loginResponse.data.data.user.id,
                role: loginResponse.data.data.user.role,
            };
        }
        throw error;
    }
}
async function testCommunityAPI() {
    console.log('🧪 Testing Community API...\n');
    try {
        // 1. Setup test users
        console.log('1. Setting up test users...');
        testUser = await registerAndLoginUser({
            email: `testfarmer${Date.now()}@example.com`,
            password: 'password123',
            role: 'farmer',
            language: 'en',
            profile: {
                name: 'Test Farmer',
                location: {
                    address: '123 Farm Road',
                    city: 'Bangalore',
                    state: 'Karnataka',
                    country: 'India',
                    coordinates: {
                        latitude: 12.9716,
                        longitude: 77.5946
                    }
                },
                crops: ['rice', 'wheat'],
                experience: 5,
                certifications: []
            }
        });
        testAdmin = await registerAndLoginUser({
            email: `testadmin${Date.now()}@example.com`,
            password: 'password123',
            role: 'admin',
            language: 'en',
            profile: {
                name: 'Test Admin',
                location: {
                    address: '456 Admin Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    country: 'India',
                    coordinates: {
                        latitude: 19.0760,
                        longitude: 72.8777
                    }
                },
                crops: [],
                experience: 0,
                certifications: []
            }
        });
        console.log('✅ Test users created\n');
        // 2. Test creating a post
        console.log('2. Testing post creation...');
        const postData = {
            title: 'Best practices for organic farming',
            content: 'Here are some tips for successful organic farming that I have learned over the years...',
            category: 'tip',
            tags: ['organic', 'farming', 'tips'],
            photos: ['https://example.com/photo1.jpg'],
        };
        const createPostResponse = await axios_1.default.post(`${BASE_URL}/community/posts`, postData, {
            headers: { Authorization: `Bearer ${testUser.token}` },
        });
        testPostId = createPostResponse.data.data._id;
        console.log('✅ Post created:', createPostResponse.data.data.title);
        // 3. Test getting posts
        console.log('3. Testing get posts...');
        const getPostsResponse = await axios_1.default.get(`${BASE_URL}/community/posts`);
        console.log('✅ Posts retrieved:', getPostsResponse.data.data.posts.length, 'posts');
        // 4. Test getting specific post
        console.log('4. Testing get specific post...');
        const getPostResponse = await axios_1.default.get(`${BASE_URL}/community/posts/${testPostId}`);
        console.log('✅ Specific post retrieved:', getPostResponse.data.data.title);
        // 5. Test liking a post
        console.log('5. Testing post like...');
        const likePostResponse = await axios_1.default.post(`${BASE_URL}/community/posts/${testPostId}/like`, {}, {
            headers: { Authorization: `Bearer ${testUser.token}` },
        });
        console.log('✅ Post liked:', likePostResponse.data.data);
        // 6. Test creating a comment
        console.log('6. Testing comment creation...');
        const commentData = {
            content: 'Great tips! I have been using similar methods on my farm.',
        };
        const createCommentResponse = await axios_1.default.post(`${BASE_URL}/community/posts/${testPostId}/comments`, commentData, {
            headers: { Authorization: `Bearer ${testUser.token}` },
        });
        testCommentId = createCommentResponse.data.data._id;
        console.log('✅ Comment created:', createCommentResponse.data.data.content);
        // 7. Test getting comments
        console.log('7. Testing get comments...');
        const getCommentsResponse = await axios_1.default.get(`${BASE_URL}/community/posts/${testPostId}/comments`);
        console.log('✅ Comments retrieved:', getCommentsResponse.data.data.comments.length, 'comments');
        // 8. Test liking a comment
        console.log('8. Testing comment like...');
        const likeCommentResponse = await axios_1.default.post(`${BASE_URL}/community/comments/${testCommentId}/like`, {}, {
            headers: { Authorization: `Bearer ${testUser.token}` },
        });
        console.log('✅ Comment liked:', likeCommentResponse.data.data);
        // 9. Test search posts
        console.log('9. Testing post search...');
        const searchResponse = await axios_1.default.get(`${BASE_URL}/community/posts/search?q=organic`);
        console.log('✅ Search results:', searchResponse.data.data.posts.length, 'posts found');
        // 10. Test expert verification (admin only)
        console.log('10. Testing expert verification...');
        const verifyResponse = await axios_1.default.post(`${BASE_URL}/community/posts/${testPostId}/verify`, {}, {
            headers: { Authorization: `Bearer ${testAdmin.token}` },
        });
        console.log('✅ Post verified as expert content:', verifyResponse.data.data.isExpertVerified);
        // 11. Test post moderation (admin only)
        console.log('11. Testing post moderation...');
        const moderateResponse = await axios_1.default.post(`${BASE_URL}/community/posts/${testPostId}/moderate`, {
            action: 'approve',
            notes: 'High quality content approved',
        }, {
            headers: { Authorization: `Bearer ${testAdmin.token}` },
        });
        console.log('✅ Post moderated:', moderateResponse.data.data.moderationStatus);
        // 12. Test updating a post
        console.log('12. Testing post update...');
        const updatePostResponse = await axios_1.default.put(`${BASE_URL}/community/posts/${testPostId}`, {
            title: 'Updated: Best practices for organic farming',
            content: 'Updated content with more detailed information...',
        }, {
            headers: { Authorization: `Bearer ${testUser.token}` },
        });
        console.log('✅ Post updated:', updatePostResponse.data.data.title);
        // 13. Test filtering posts by category
        console.log('13. Testing post filtering...');
        const filterResponse = await axios_1.default.get(`${BASE_URL}/community/posts?category=tip&isExpertVerified=true`);
        console.log('✅ Filtered posts:', filterResponse.data.data.posts.length, 'expert tips found');
        console.log('\n🎉 All Community API tests passed!');
    }
    catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        process.exit(1);
    }
}
// Cleanup function
async function cleanup() {
    try {
        if (testCommentId) {
            await axios_1.default.delete(`${BASE_URL}/community/comments/${testCommentId}`, {
                headers: { Authorization: `Bearer ${testUser.token}` },
            });
            console.log('🧹 Test comment deleted');
        }
        if (testPostId) {
            await axios_1.default.delete(`${BASE_URL}/community/posts/${testPostId}`, {
                headers: { Authorization: `Bearer ${testUser.token}` },
            });
            console.log('🧹 Test post deleted');
        }
    }
    catch (error) {
        console.log('🧹 Cleanup completed (some items may not exist)');
    }
}
// Run tests
if (require.main === module) {
    testCommunityAPI()
        .then(() => cleanup())
        .catch((error) => {
        console.error('❌ Test suite failed:', error);
        cleanup().finally(() => process.exit(1));
    });
}
//# sourceMappingURL=test-community-api.js.map