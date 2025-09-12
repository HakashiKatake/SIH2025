import { INotification } from '../models/Notification';
import { NotificationData } from '../utils/notificationGenerator';
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
export declare class NotificationService {
    /**
     * Send push notification (mock implementation)
     * In production, this would integrate with Firebase FCM, Apple Push Notifications, etc.
     */
    static sendPushNotification(userId: string, payload: PushNotificationPayload): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Process and send notification
     */
    static processNotification(notificationId: string): Promise<void>;
    /**
     * Process pending notifications
     */
    static processPendingNotifications(): Promise<void>;
    /**
     * Create and send immediate notification
     */
    static createAndSendNotification(notificationData: NotificationData): Promise<INotification>;
    /**
     * Get user notification preferences (mock implementation)
     */
    static getUserPreferences(userId: string): Promise<NotificationPreferences>;
    /**
     * Update user notification preferences (mock implementation)
     */
    static updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
    /**
     * Register device token for push notifications (mock implementation)
     */
    static registerDeviceToken(userId: string, deviceToken: string, platform: 'ios' | 'android'): Promise<void>;
    /**
     * Unregister device token (mock implementation)
     */
    static unregisterDeviceToken(userId: string, deviceToken: string): Promise<void>;
}
//# sourceMappingURL=notificationService.d.ts.map