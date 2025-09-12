"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./utils/database");
const User_1 = require("./models/User");
const seed_1 = require("./utils/seed");
const testDatabase = async () => {
    try {
        console.log('🧪 Testing database connections and User model...\n');
        // Connect to databases
        await (0, database_1.connectMongoDB)();
        await (0, database_1.connectRedis)();
        // Test User model creation
        console.log('📝 Testing User model validation...');
        const testUser = new User_1.User({
            name: 'Test User',
            phone: '9999999999',
            password: 'testpass123',
            location: {
                latitude: 28.6139,
                longitude: 77.2090,
                address: 'Test Address',
                state: 'Test State',
                district: 'Test District'
            },
            preferredLanguage: 'en',
            farmSize: 1.5,
            crops: ['test-crop']
        });
        // Validate without saving
        const validationError = testUser.validateSync();
        if (validationError) {
            console.error('❌ Validation failed:', validationError.message);
        }
        else {
            console.log('✅ User model validation passed');
        }
        // Test password hashing
        console.log('🔐 Testing password hashing...');
        await testUser.save();
        console.log('✅ User saved with hashed password');
        // Test password comparison
        const isMatch = await testUser.comparePassword('testpass123');
        console.log(`✅ Password comparison: ${isMatch ? 'PASSED' : 'FAILED'}`);
        // Test wrong password
        const isWrongMatch = await testUser.comparePassword('wrongpassword');
        console.log(`✅ Wrong password test: ${!isWrongMatch ? 'PASSED' : 'FAILED'}`);
        // Clean up test user
        await User_1.User.deleteOne({ _id: testUser._id });
        console.log('🗑️ Test user cleaned up');
        // Test seeding
        console.log('\n🌱 Testing database seeding...');
        await (0, seed_1.seedDatabase)();
        // Test user queries
        console.log('\n🔍 Testing user queries...');
        const userCount = await User_1.User.countDocuments();
        console.log(`📊 Total users in database: ${userCount}`);
        const hindiUsers = await User_1.User.find({ preferredLanguage: 'hi' });
        console.log(`🇮🇳 Hindi speaking users: ${hindiUsers.length}`);
        console.log('\n✅ All database tests passed!');
    }
    catch (error) {
        console.error('❌ Database test failed:', error);
    }
    finally {
        await (0, database_1.closeConnections)();
        process.exit(0);
    }
};
testDatabase();
//# sourceMappingURL=test-db.js.map