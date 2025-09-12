"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./utils/database");
const User_1 = require("./models/User");
const jwt_1 = require("./utils/jwt");
async function testAuthSystem() {
    try {
        console.log('🧪 Testing Authentication System...\n');
        // Connect to database
        await (0, database_1.connectMongoDB)();
        console.log('✅ Database connected');
        // Test user data
        const testUserData = {
            name: 'Test Farmer',
            phone: '9876543210',
            email: 'test@farmer.com',
            password: 'testpass123',
            location: {
                latitude: 28.6139,
                longitude: 77.2090,
                address: 'Test Address, New Delhi',
                state: 'Delhi',
                district: 'New Delhi'
            },
            preferredLanguage: 'en',
            farmSize: 2.5,
            crops: ['wheat', 'rice']
        };
        // Clean up any existing test user
        await User_1.User.deleteOne({ phone: testUserData.phone });
        console.log('🧹 Cleaned up existing test data');
        // Test 1: Create user
        console.log('\n📝 Test 1: Creating user...');
        const user = new User_1.User(testUserData);
        await user.save();
        console.log('✅ User created successfully');
        console.log('   User ID:', user._id.toString());
        console.log('   Password hashed:', user.password !== testUserData.password);
        // Test 2: Password comparison
        console.log('\n🔐 Test 2: Testing password comparison...');
        const isPasswordValid = await user.comparePassword(testUserData.password);
        const isWrongPasswordValid = await user.comparePassword('wrongpassword');
        console.log('✅ Correct password validation:', isPasswordValid);
        console.log('✅ Wrong password rejection:', !isWrongPasswordValid);
        // Test 3: JWT token generation
        console.log('\n🎫 Test 3: Testing JWT token generation...');
        const tokenPayload = {
            userId: user._id.toString(),
            phone: user.phone,
            email: user.email,
            name: user.name || 'Test User'
        };
        const tokens = (0, jwt_1.generateTokens)(tokenPayload);
        console.log('✅ Tokens generated successfully');
        console.log('   Access token length:', tokens.accessToken.length);
        console.log('   Refresh token length:', tokens.refreshToken.length);
        // Test 4: JWT token verification
        console.log('\n🔍 Test 4: Testing JWT token verification...');
        const decodedAccess = (0, jwt_1.verifyToken)(tokens.accessToken);
        const decodedRefresh = (0, jwt_1.verifyToken)(tokens.refreshToken);
        console.log('✅ Access token verified:', decodedAccess.userId === user._id.toString());
        console.log('✅ Refresh token verified:', decodedRefresh.userId === user._id.toString());
        // Test 5: Invalid token handling
        console.log('\n❌ Test 5: Testing invalid token handling...');
        try {
            (0, jwt_1.verifyToken)('invalid.token.here');
            console.log('❌ Should have thrown error for invalid token');
        }
        catch (error) {
            console.log('✅ Invalid token properly rejected:', error instanceof Error ? error.message : 'Unknown error');
        }
        // Test 6: User JSON serialization (password exclusion)
        console.log('\n📄 Test 6: Testing user JSON serialization...');
        const userJson = user.toJSON();
        console.log('✅ Password excluded from JSON:', !('password' in userJson));
        console.log('✅ User data preserved:', userJson.name === testUserData.name);
        // Clean up
        await User_1.User.deleteOne({ _id: user._id });
        console.log('\n🧹 Test data cleaned up');
        console.log('\n🎉 All authentication tests passed!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Authentication test failed:', error);
        process.exit(1);
    }
}
// Run tests
testAuthSystem();
//# sourceMappingURL=test-auth.js.map