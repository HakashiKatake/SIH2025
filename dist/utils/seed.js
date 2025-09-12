"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearUsers = exports.seedDatabase = void 0;
const User_1 = require("../models/User");
// Sample user data for testing
const sampleUsers = [
    {
        name: 'Rajesh Kumar',
        phone: '9876543210',
        email: 'rajesh@example.com',
        password: 'password123',
        location: {
            latitude: 28.6139,
            longitude: 77.2090,
            address: 'Village Khera, Block Najafgarh',
            state: 'Delhi',
            district: 'South West Delhi'
        },
        preferredLanguage: 'hi',
        farmSize: 2.5,
        crops: ['wheat', 'rice', 'sugarcane']
    },
    {
        name: 'Priya Sharma',
        phone: '8765432109',
        password: 'password123',
        location: {
            latitude: 26.9124,
            longitude: 75.7873,
            address: 'Village Bagru, Tehsil Sanganer',
            state: 'Rajasthan',
            district: 'Jaipur'
        },
        preferredLanguage: 'hi',
        farmSize: 1.8,
        crops: ['cotton', 'mustard', 'bajra']
    },
    {
        name: 'Murugan Pillai',
        phone: '7654321098',
        password: 'password123',
        location: {
            latitude: 11.0168,
            longitude: 76.9558,
            address: 'Village Thondamuthur, Taluk Coimbatore',
            state: 'Tamil Nadu',
            district: 'Coimbatore'
        },
        preferredLanguage: 'ta',
        farmSize: 3.2,
        crops: ['coconut', 'banana', 'turmeric']
    }
];
const seedDatabase = async () => {
    try {
        // Check if users already exist
        const existingUsers = await User_1.User.countDocuments();
        if (existingUsers > 0) {
            console.log('📊 Database already has users, skipping seed');
            return;
        }
        // Create sample users
        const createdUsers = await User_1.User.create(sampleUsers);
        console.log(`✅ Successfully seeded ${createdUsers.length} sample users`);
        // Log created users (without passwords)
        createdUsers.forEach(user => {
            const locationInfo = user.location?.state || user.profile?.location?.state || 'Unknown';
            console.log(`👤 Created user: ${user.name || user.profile?.name} (${user.phone || user.email}) from ${locationInfo}`);
        });
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
};
exports.seedDatabase = seedDatabase;
// Function to clear all users (for testing)
const clearUsers = async () => {
    try {
        const result = await User_1.User.deleteMany({});
        console.log(`🗑️ Cleared ${result.deletedCount} users from database`);
    }
    catch (error) {
        console.error('❌ Error clearing users:', error);
        throw error;
    }
};
exports.clearUsers = clearUsers;
//# sourceMappingURL=seed.js.map