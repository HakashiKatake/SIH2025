import { INotification } from "../models/Notification";
export interface NotificationData {
    userId: string;
    type: "weather_alert" | "roadmap_milestone" | "crop_analysis" | "marketplace" | "system";
    title: string;
    message: string;
    data?: any;
    priority?: "low" | "medium" | "high" | "urgent";
    scheduledFor?: Date;
}
export declare class NotificationGenerator {
    /**
     * Create a new notification
     */
    static createNotification(notificationData: NotificationData): Promise<INotification>;
    /**
     * Create weather alert notification
     */
    static createWeatherAlert(userId: string, weatherData: any, alertType: string): Promise<INotification>;
    /**
     * Create roadmap milestone notification
     */
    static createMilestoneReminder(userId: string, milestoneData: any): Promise<INotification>;
    /**
     * Create crop analysis notification
     */
    static createCropAnalysisAlert(userId: string, analysisData: any): Promise<INotification>;
    /**
     * Create marketplace notification
     */
    static createMarketplaceNotification(userId: string, notificationType: "new_inquiry" | "price_update" | "listing_expired", productData: any): Promise<INotification>;
    /**
     * Create system notification
     */
    static createSystemNotification(userId: string, title: string, message: string, priority?: "low" | "medium" | "high" | "urgent"): Promise<INotification>;
    /**
     * Schedule bulk notifications
     */
    static scheduleBulkNotifications(notifications: NotificationData[]): Promise<INotification[]>;
}
//# sourceMappingURL=notificationGenerator.d.ts.map