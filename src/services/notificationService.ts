import { Notification, INotification } from '../models/Notification';
import { NotificationGenerator, NotificationData } from '../utils/notificationGenerator';
import mongoose from 'mongoose';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: any;
  badge?: number;
  sound?: string;
  priority?: 'default' | 'high';
}

export interface NotificationPreferences {
  weatherAlerts: boolean;
  milestoneReminders: boolean;
  cropAnalysis: boolean;
  marketplace: boolean;
  system: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

export class NotificationService {
  /**
   * Send push notification (mock implementation)
   * In production, this would integrate with Firebase FCM, Apple Push Notifications, etc.
   */
  static async sendPushNotification(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Mock implementation - in production, this would send actual push notifications
      console.log(`[MOCK] Sending push notification to user ${userId}:`, payload);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Mock success response
      return {
        success: true,
        messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process and send notification
   */
  static async processNotification(notificationId: string): Promise<void> {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.isSent) {
        console.log(`Notification ${notificationId} already sent`);
        return;
      }

      // Check if notification is scheduled for future
      if (notification.scheduledFor && notification.scheduledFor > new Date()) {
        console.log(`Notification ${notificationId} scheduled for ${notification.scheduledFor}`);
        return;
      }

      // Prepare push notification payload
      const payload: PushNotificationPayload = {
        title: notification.title,
        body: notification.message,
        data: {
          notificationId: (notification._id as mongoose.Types.ObjectId).toString(),
          type: notification.type,
          ...notification.data
        },
        priority: notification.priority === 'urgent' ? 'high' : 'default'
      };

      // Send push notification
      const result = await this.sendPushNotification(
        notification.userId.toString(),
        payload
      );

      // Update notification status
      notification.isSent = result.success;
      notification.sentAt = result.success ? new Date() : undefined;
      await notification.save();

      if (!result.success) {
        console.error(`Failed to send notification ${notificationId}:`, result.error);
      }
    } catch (error) {
      console.error(`Error processing notification ${notificationId}:`, error);
    }
  }

  /**
   * Process pending notifications
   */
  static async processPendingNotifications(): Promise<void> {
    try {
      const pendingNotifications = await Notification.find({
        isSent: false,
        $or: [
          { scheduledFor: { $exists: false } },
          { scheduledFor: { $lte: new Date() } }
        ]
      }).limit(100); // Process in batches

      console.log(`Processing ${pendingNotifications.length} pending notifications`);

      for (const notification of pendingNotifications) {
        await this.processNotification((notification._id as mongoose.Types.ObjectId).toString());
      }
    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  }

  /**
   * Create and send immediate notification
   */
  static async createAndSendNotification(notificationData: NotificationData): Promise<INotification> {
    try {
      // Create notification
      const notification = await NotificationGenerator.createNotification(notificationData);
      
      // Process immediately if not scheduled
      if (!notificationData.scheduledFor || notificationData.scheduledFor <= new Date()) {
        await this.processNotification((notification._id as mongoose.Types.ObjectId).toString());
      }

      return notification;
    } catch (error) {
      throw new Error(`Failed to create and send notification: ${error}`);
    }
  }

  /**
   * Get user notification preferences (mock implementation)
   */
  static async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    // Mock implementation - in production, this would fetch from user settings
    return {
      weatherAlerts: true,
      milestoneReminders: true,
      cropAnalysis: true,
      marketplace: true,
      system: true,
      pushEnabled: true,
      emailEnabled: false,
      smsEnabled: false
    };
  }

  /**
   * Update user notification preferences (mock implementation)
   */
  static async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    // Mock implementation - in production, this would update user settings
    console.log(`[MOCK] Updating notification preferences for user ${userId}:`, preferences);
    
    const currentPreferences = await this.getUserPreferences(userId);
    return { ...currentPreferences, ...preferences };
  }

  /**
   * Register device token for push notifications (mock implementation)
   */
  static async registerDeviceToken(
    userId: string,
    deviceToken: string,
    platform: 'ios' | 'android'
  ): Promise<void> {
    // Mock implementation - in production, this would store device tokens
    console.log(`[MOCK] Registering device token for user ${userId}:`, {
      token: deviceToken.substring(0, 20) + '...',
      platform
    });
  }

  /**
   * Unregister device token (mock implementation)
   */
  static async unregisterDeviceToken(userId: string, deviceToken: string): Promise<void> {
    // Mock implementation - in production, this would remove device tokens
    console.log(`[MOCK] Unregistering device token for user ${userId}`);
  }
}