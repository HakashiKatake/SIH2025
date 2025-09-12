"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("./utils/database");
const Notification_1 = require("./models/Notification");
const notificationGenerator_1 = require("./utils/notificationGenerator");
const notificationService_1 = require("./services/notificationService");
async function testNotificationSystem() {
    try {
        console.log('🔄 Connecting to database...');
        await (0, database_1.connectMongoDB)();
        console.log('✅ Database connected');
        // Test user ID (you can replace with an actual user ID from your database)
        const testUserId = new mongoose_1.default.Types.ObjectId().toString();
        console.log(`📱 Testing with user ID: ${testUserId}`);
        // Test 1: Create weather alert notification
        console.log('\n📋 Test 1: Creating weather alert notification...');
        const weatherAlert = await notificationGenerator_1.NotificationGenerator.createWeatherAlert(testUserId, { temperature: 35, humidity: 80, condition: 'storm' }, 'storm');
        console.log('✅ Weather alert created:', {
            id: weatherAlert._id,
            title: weatherAlert.title,
            message: weatherAlert.message,
            priority: weatherAlert.priority
        });
        // Test 2: Create milestone reminder
        console.log('\n📋 Test 2: Creating milestone reminder...');
        const milestoneReminder = await notificationGenerator_1.NotificationGenerator.createMilestoneReminder(testUserId, {
            id: 'milestone_1',
            roadmapId: 'roadmap_1',
            title: 'Sowing Time',
            description: 'Time to sow wheat seeds',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
        });
        console.log('✅ Milestone reminder created:', {
            id: milestoneReminder._id,
            title: milestoneReminder.title,
            scheduledFor: milestoneReminder.scheduledFor
        });
        // Test 3: Create crop analysis alert
        console.log('\n📋 Test 3: Creating crop analysis alert...');
        const cropAlert = await notificationGenerator_1.NotificationGenerator.createCropAnalysisAlert(testUserId, {
            id: 'analysis_1',
            healthStatus: 'diseased',
            detectedIssues: ['Leaf blight', 'Pest infestation']
        });
        console.log('✅ Crop analysis alert created:', {
            id: cropAlert._id,
            title: cropAlert.title,
            priority: cropAlert.priority
        });
        // Test 4: Create marketplace notification
        console.log('\n📋 Test 4: Creating marketplace notification...');
        const marketplaceNotif = await notificationGenerator_1.NotificationGenerator.createMarketplaceNotification(testUserId, 'new_inquiry', { id: 'product_1', name: 'Organic Wheat', category: 'crops' });
        console.log('✅ Marketplace notification created:', {
            id: marketplaceNotif._id,
            title: marketplaceNotif.title
        });
        // Test 5: Create system notification
        console.log('\n📋 Test 5: Creating system notification...');
        const systemNotif = await notificationGenerator_1.NotificationGenerator.createSystemNotification(testUserId, '🎉 Welcome to FarmApp', 'Thank you for joining our farming community!', 'medium');
        console.log('✅ System notification created:', {
            id: systemNotif._id,
            title: systemNotif.title
        });
        // Test 6: Process notifications (mock push sending)
        console.log('\n📋 Test 6: Processing pending notifications...');
        await notificationService_1.NotificationService.processPendingNotifications();
        console.log('✅ Notifications processed');
        // Test 7: Fetch user notifications
        console.log('\n📋 Test 7: Fetching user notifications...');
        const userNotifications = await Notification_1.Notification.find({ userId: testUserId })
            .sort({ createdAt: -1 })
            .limit(10);
        console.log(`✅ Found ${userNotifications.length} notifications for user:`);
        userNotifications.forEach((notif, index) => {
            console.log(`  ${index + 1}. [${notif.type}] ${notif.title} - ${notif.isSent ? 'Sent' : 'Pending'}`);
        });
        // Test 8: Mark notification as read
        console.log('\n📋 Test 8: Marking first notification as read...');
        if (userNotifications.length > 0) {
            const firstNotif = userNotifications[0];
            firstNotif.isRead = true;
            firstNotif.readAt = new Date();
            await firstNotif.save();
            console.log('✅ Notification marked as read');
        }
        // Test 9: Get unread count
        console.log('\n📋 Test 9: Getting unread count...');
        const unreadCount = await Notification_1.Notification.countDocuments({
            userId: testUserId,
            isRead: false
        });
        console.log(`✅ Unread notifications: ${unreadCount}`);
        // Test 10: Test notification preferences
        console.log('\n📋 Test 10: Testing notification preferences...');
        const preferences = await notificationService_1.NotificationService.getUserPreferences(testUserId);
        console.log('✅ User preferences:', preferences);
        const updatedPrefs = await notificationService_1.NotificationService.updateUserPreferences(testUserId, {
            weatherAlerts: false,
            pushEnabled: true
        });
        console.log('✅ Updated preferences:', updatedPrefs);
        // Test 11: Test device token registration
        console.log('\n📋 Test 11: Testing device token registration...');
        await notificationService_1.NotificationService.registerDeviceToken(testUserId, 'mock_device_token_12345abcdef', 'android');
        console.log('✅ Device token registered');
        // Test 12: Create and send immediate notification
        console.log('\n📋 Test 12: Creating and sending immediate notification...');
        const immediateNotif = await notificationService_1.NotificationService.createAndSendNotification({
            userId: testUserId,
            type: 'system',
            title: '🚀 Test Complete',
            message: 'All notification system tests completed successfully!',
            priority: 'high'
        });
        console.log('✅ Immediate notification created and sent:', {
            id: immediateNotif._id,
            isSent: immediateNotif.isSent
        });
        console.log('\n🎉 All notification system tests completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`- Total notifications created: ${userNotifications.length + 1}`);
        console.log(`- Unread notifications: ${unreadCount}`);
        console.log('- All notification types tested: ✅');
        console.log('- Push notification mock: ✅');
        console.log('- Preferences management: ✅');
        console.log('- Device token registration: ✅');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log('🔌 Database connection closed');
    }
}
// Run the test
testNotificationSystem();
//# sourceMappingURL=test-notifications.js.map