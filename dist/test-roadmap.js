"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("./utils/database");
const roadmapService_1 = require("./services/roadmapService");
const User_1 = require("./models/User");
const FarmingRoadmap_1 = require("./models/FarmingRoadmap");
async function testRoadmapService() {
    try {
        console.log('🌱 Testing Roadmap Service...\n');
        // Connect to database
        await (0, database_1.connectMongoDB)();
        console.log('✅ Connected to MongoDB\n');
        // Clean up existing test data
        await User_1.User.deleteMany({ phone: { $regex: /^9999/ } });
        await FarmingRoadmap_1.FarmingRoadmap.deleteMany({});
        console.log('🧹 Cleaned up existing test data\n');
        // Create a test user
        const testUser = new User_1.User({
            name: 'Test Farmer',
            phone: '9999999999',
            password: 'password123',
            location: {
                latitude: 28.6139,
                longitude: 77.2090,
                address: 'Test Farm, New Delhi',
                state: 'Delhi',
                district: 'Central Delhi'
            },
            preferredLanguage: 'en',
            farmSize: 2.5,
            crops: ['rice', 'wheat']
        });
        await testUser.save();
        console.log('✅ Created test user:', testUser.name);
        console.log('   User ID:', testUser._id.toString(), '\n');
        // Test 1: Generate Rice Roadmap
        console.log('📋 Test 1: Generate Rice Roadmap');
        const riceRoadmapData = {
            cropType: 'rice',
            variety: 'Basmati',
            location: {
                latitude: 28.6139,
                longitude: 77.2090,
                address: 'Test Farm, New Delhi',
                state: 'Delhi',
                district: 'Central Delhi'
            },
            farmSize: 2.5,
            sowingDate: new Date('2024-06-15'),
            preferredLanguage: 'en'
        };
        const riceRoadmap = await roadmapService_1.RoadmapService.generateRoadmap(riceRoadmapData, testUser._id.toString());
        console.log('✅ Rice roadmap generated successfully');
        console.log('   Roadmap ID:', riceRoadmap._id.toString());
        console.log('   Crop Type:', riceRoadmap.cropType);
        console.log('   Growth Period:', riceRoadmap.estimatedHarvestDate);
        console.log('   Total Milestones:', riceRoadmap.totalMilestones);
        console.log('   Current Stage:', riceRoadmap.currentStage);
        console.log('   MRL Recommendations:', riceRoadmap.mrlRecommendations.length, '\n');
        // Test 2: Generate Wheat Roadmap
        console.log('📋 Test 2: Generate Wheat Roadmap');
        const wheatRoadmapData = {
            cropType: 'wheat',
            location: {
                latitude: 28.6139,
                longitude: 77.2090,
                address: 'Test Farm, New Delhi',
                state: 'Delhi',
                district: 'Central Delhi'
            },
            farmSize: 1.5,
            sowingDate: new Date('2024-11-15'),
            preferredLanguage: 'en'
        };
        const wheatRoadmap = await roadmapService_1.RoadmapService.generateRoadmap(wheatRoadmapData, testUser._id.toString());
        console.log('✅ Wheat roadmap generated successfully');
        console.log('   Roadmap ID:', wheatRoadmap._id.toString());
        console.log('   Crop Type:', wheatRoadmap.cropType);
        console.log('   Total Milestones:', wheatRoadmap.totalMilestones);
        console.log('   Current Stage:', wheatRoadmap.currentStage, '\n');
        // Test 3: Get User Roadmaps
        console.log('📋 Test 3: Get User Roadmaps');
        const userRoadmaps = await roadmapService_1.RoadmapService.getUserRoadmaps(testUser._id.toString());
        console.log('✅ Retrieved user roadmaps:', userRoadmaps.length);
        userRoadmaps.forEach((roadmap, index) => {
            console.log(`   ${index + 1}. ${roadmap.cropType} - ${roadmap.currentStage} (${roadmap.completionPercentage}%)`);
        });
        console.log();
        // Test 4: Update Milestone Progress
        console.log('📋 Test 4: Update Milestone Progress');
        const firstMilestone = riceRoadmap.milestones[0];
        console.log('   Updating milestone:', firstMilestone.title);
        console.log('   Current status:', firstMilestone.status);
        const updatedRoadmap = await roadmapService_1.RoadmapService.updateMilestoneProgress(riceRoadmap._id.toString(), firstMilestone._id.toString(), {
            milestoneId: firstMilestone._id.toString(),
            status: 'completed',
            completedDate: new Date(),
            notes: 'Completed land preparation successfully'
        }, testUser._id.toString());
        console.log('✅ Milestone progress updated');
        console.log('   New completion percentage:', updatedRoadmap?.completionPercentage + '%');
        console.log('   Completed milestones:', updatedRoadmap?.completedMilestones);
        console.log('   Current stage:', updatedRoadmap?.currentStage, '\n');
        // Test 5: Get Upcoming Milestones
        console.log('📋 Test 5: Get Upcoming Milestones');
        const upcomingMilestones = await roadmapService_1.RoadmapService.getUpcomingMilestones(testUser._id.toString(), 30);
        console.log('✅ Retrieved upcoming milestones for next 30 days');
        upcomingMilestones.forEach((item, index) => {
            console.log(`   Roadmap ${index + 1}: ${item.roadmap.cropType}`);
            item.milestones.forEach((milestone, mIndex) => {
                console.log(`     ${mIndex + 1}. ${milestone.title} - ${milestone.scheduledDate.toDateString()}`);
            });
        });
        console.log();
        // Test 6: Get Overdue Milestones
        console.log('📋 Test 6: Get Overdue Milestones');
        const overdueMilestones = await roadmapService_1.RoadmapService.getOverdueMilestones(testUser._id.toString());
        console.log('✅ Retrieved overdue milestones:', overdueMilestones.length);
        overdueMilestones.forEach((item, index) => {
            console.log(`   Roadmap ${index + 1}: ${item.roadmap.cropType}`);
            item.milestones.forEach((milestone, mIndex) => {
                console.log(`     ${mIndex + 1}. ${milestone.title} - ${milestone.scheduledDate.toDateString()}`);
            });
        });
        console.log();
        // Test 7: Get MRL Recommendations
        console.log('📋 Test 7: Get MRL Recommendations');
        const mrlRecommendations = await roadmapService_1.RoadmapService.getMRLRecommendations({ state: 'Delhi', district: 'Central Delhi' }, 'rice');
        console.log('✅ Retrieved MRL recommendations:', mrlRecommendations.length);
        mrlRecommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec.pesticide} - ${rec.dosage} (${rec.targetPest})`);
            console.log(`      Safety period: ${rec.safetyPeriod} days, MRL limit: ${rec.mrlLimit} mg/kg`);
        });
        console.log();
        // Test 8: Get Roadmap Statistics
        console.log('📋 Test 8: Get Roadmap Statistics');
        const statistics = await roadmapService_1.RoadmapService.getRoadmapStatistics(testUser._id.toString());
        console.log('✅ Retrieved roadmap statistics:');
        console.log('   Total roadmaps:', statistics.totalRoadmaps);
        console.log('   Active roadmaps:', statistics.activeRoadmaps);
        console.log('   Completed roadmaps:', statistics.completedRoadmaps);
        console.log('   Total milestones:', statistics.totalMilestones);
        console.log('   Completed milestones:', statistics.completedMilestones);
        console.log('   Overdue milestones:', statistics.overdueMilestones);
        console.log('   Upcoming milestones:', statistics.upcomingMilestones, '\n');
        // Test 9: Update Roadmap Settings
        console.log('📋 Test 9: Update Roadmap Settings');
        const updatedSettings = await roadmapService_1.RoadmapService.updateRoadmapSettings(riceRoadmap._id.toString(), { weatherAlerts: false }, testUser._id.toString());
        console.log('✅ Roadmap settings updated');
        console.log('   Weather alerts:', updatedSettings?.weatherAlerts, '\n');
        // Test 10: Test Model Methods
        console.log('📋 Test 10: Test Model Methods');
        const roadmapWithMethods = await FarmingRoadmap_1.FarmingRoadmap.findById(riceRoadmap._id);
        if (roadmapWithMethods) {
            const upcoming = roadmapWithMethods.getUpcomingMilestones(7);
            const overdue = roadmapWithMethods.getOverdueMilestones();
            console.log('✅ Model methods tested');
            console.log('   Upcoming milestones (7 days):', upcoming.length);
            console.log('   Overdue milestones:', overdue.length);
            console.log('   Days until harvest:', roadmapWithMethods.daysUntilHarvest);
            console.log('   Full location:', roadmapWithMethods.fullLocation, '\n');
        }
        console.log('🎉 All roadmap service tests completed successfully!\n');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Stack trace:', error.stack);
        }
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log('🔌 Database connection closed');
    }
}
// Run the test
if (require.main === module) {
    testRoadmapService();
}
//# sourceMappingURL=test-roadmap.js.map