import { Notification, INotification } from "../models/Notification";
import mongoose from "mongoose";

export interface NotificationData {
  userId: string;
  type:
    | "weather_alert"
    | "roadmap_milestone"
    | "crop_analysis"
    | "marketplace"
    | "system";
  title: string;
  message: string;
  data?: any;
  priority?: "low" | "medium" | "high" | "urgent";
  scheduledFor?: Date;
}

export class NotificationGenerator {
  /**
   * Create a new notification
   */
  static async createNotification(
    notificationData: NotificationData
  ): Promise<INotification> {
    try {
      const notification = new Notification({
        userId: new mongoose.Types.ObjectId(notificationData.userId),
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || null,
        priority: notificationData.priority || "medium",
        scheduledFor: notificationData.scheduledFor,
      });

      return await notification.save();
    } catch (error) {
      throw new Error(`Failed to create notification: ${error}`);
    }
  }

  /**
   * Create weather alert notification
   */
  static async createWeatherAlert(
    userId: string,
    weatherData: any,
    alertType: string
  ): Promise<INotification> {
    const titles: { [key: string]: string } = {
      rain: "🌧️ Rain Alert",
      storm: "⛈️ Storm Warning",
      drought: "☀️ Drought Alert",
      frost: "❄️ Frost Warning",
      heatwave: "🔥 Heat Wave Alert",
    };

    const messages: { [key: string]: string } = {
      rain: "Heavy rainfall expected. Consider protecting your crops and adjusting irrigation.",
      storm:
        "Severe weather conditions expected. Secure your farm equipment and livestock.",
      drought:
        "Extended dry period forecasted. Plan water conservation measures.",
      frost:
        "Frost conditions expected. Protect sensitive crops from cold damage.",
      heatwave:
        "Extreme heat expected. Ensure adequate water supply for crops and livestock.",
    };

    return this.createNotification({
      userId,
      type: "weather_alert",
      title: titles[alertType] || "🌤️ Weather Alert",
      message:
        messages[alertType] ||
        "Weather conditions may affect your farming activities.",
      data: { weatherData, alertType },
      priority: ["storm", "frost"].includes(alertType) ? "urgent" : "high",
    });
  }

  /**
   * Create roadmap milestone notification
   */
  static async createMilestoneReminder(
    userId: string,
    milestoneData: any
  ): Promise<INotification> {
    return this.createNotification({
      userId,
      type: "roadmap_milestone",
      title: `📅 ${milestoneData.title}`,
      message: `Time for: ${milestoneData.description}. Check your farming roadmap for details.`,
      data: {
        milestoneId: milestoneData.id,
        roadmapId: milestoneData.roadmapId,
      },
      priority: "medium",
      scheduledFor: milestoneData.dueDate,
    });
  }

  /**
   * Create crop analysis notification
   */
  static async createCropAnalysisAlert(
    userId: string,
    analysisData: any
  ): Promise<INotification> {
    const isHealthy = analysisData.healthStatus === "healthy";

    return this.createNotification({
      userId,
      type: "crop_analysis",
      title: isHealthy ? "✅ Crop Analysis Complete" : "⚠️ Crop Issue Detected",
      message: isHealthy
        ? "Your crop analysis shows healthy plants. Keep up the good work!"
        : `Issue detected: ${
            analysisData.detectedIssues?.[0] || "Unknown issue"
          }. Check recommendations.`,
      data: {
        analysisId: analysisData.id,
        healthStatus: analysisData.healthStatus,
      },
      priority: isHealthy ? "low" : "high",
    });
  }

  /**
   * Create marketplace notification
   */
  static async createMarketplaceNotification(
    userId: string,
    notificationType: "new_inquiry" | "price_update" | "listing_expired",
    productData: any
  ): Promise<INotification> {
    const titles: { [key: string]: string } = {
      new_inquiry: "💬 New Product Inquiry",
      price_update: "💰 Price Update Available",
      listing_expired: "⏰ Listing Expired",
    };

    const messages: { [key: string]: string } = {
      new_inquiry: `Someone is interested in your ${productData.name}. Check your messages.`,
      price_update: `Market prices have changed for ${productData.category}. Consider updating your listings.`,
      listing_expired: `Your listing for ${productData.name} has expired. Renew to keep it active.`,
    };

    return this.createNotification({
      userId,
      type: "marketplace",
      title: titles[notificationType],
      message: messages[notificationType],
      data: { productId: productData.id, notificationType },
      priority: notificationType === "new_inquiry" ? "high" : "medium",
    });
  }

  /**
   * Create system notification
   */
  static async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    priority: "low" | "medium" | "high" | "urgent" = "medium"
  ): Promise<INotification> {
    return this.createNotification({
      userId,
      type: "system",
      title,
      message,
      priority,
    });
  }

  /**
   * Schedule bulk notifications
   */
  static async scheduleBulkNotifications(
    notifications: NotificationData[]
  ): Promise<INotification[]> {
    try {
      const notificationDocs = notifications.map((data) => ({
        userId: new mongoose.Types.ObjectId(data.userId),
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || null,
        priority: data.priority || "medium",
        scheduledFor: data.scheduledFor,
      }));

      return await Notification.insertMany(notificationDocs);
    } catch (error) {
      throw new Error(`Failed to schedule bulk notifications: ${error}`);
    }
  }
}
