import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { StorageService } from "./storageService";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  categoryId?: string;
}

export class NotificationService {
  private static expoPushToken: string | null = null;

  // Initialize notifications
  static async initialize(): Promise<string | null> {
    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        console.warn("Push notifications only work on physical devices");
        return null;
      }

      // Get existing permission status
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Push notification permission not granted");
        return null;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: "your-expo-project-id", // Replace with your actual project ID
      });

      this.expoPushToken = token.data;

      // Store token locally
      await StorageService.setItem("pushToken", token.data);

      // Configure notification channels for Android
      if (Platform.OS === "android") {
        await this.setupAndroidChannels();
      }

      return token.data;
    } catch (error) {
      console.error("Error initializing notifications:", error);
      return null;
    }
  }

  // Setup Android notification channels
  private static async setupAndroidChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync("weather-alerts", {
      name: "Weather Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync("farming-reminders", {
      name: "Farming Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4CAF50",
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync("marketplace", {
      name: "Marketplace Updates",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: "#2196F3",
      sound: "default",
    });
  }

  // Schedule local notification
  static async scheduleLocalNotification(
    notification: NotificationData,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          categoryIdentifier: notification.categoryId,
        },
        trigger: trigger || null, // null means immediate
      });

      return identifier;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      throw error;
    }
  }

  // Cancel notification
  static async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  }

  // Cancel all notifications
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling all notifications:", error);
    }
  }

  // Get push token
  static getPushToken(): string | null {
    return this.expoPushToken;
  }

  // Schedule weather alert
  static async scheduleWeatherAlert(
    title: string,
    body: string,
    data?: any
  ): Promise<string> {
    return this.scheduleLocalNotification({
      title,
      body,
      data,
      categoryId: "weather-alerts",
    });
  }

  // Schedule farming reminder
  static async scheduleFarmingReminder(
    title: string,
    body: string,
    triggerDate: Date,
    data?: any
  ): Promise<string> {
    return this.scheduleLocalNotification(
      {
        title,
        body,
        data,
        categoryId: "farming-reminders",
      },
      { date: triggerDate } as Notifications.NotificationTriggerInput
    );
  }

  // Schedule marketplace notification
  static async scheduleMarketplaceNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<string> {
    return this.scheduleLocalNotification({
      title,
      body,
      data,
      categoryId: "marketplace",
    });
  }

  // Add notification response listener
  static addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Add notification received listener (for foreground notifications)
  static addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Register for push notifications with backend
  static async registerWithBackend(userId: string): Promise<void> {
    try {
      const token = this.getPushToken();
      if (!token) {
        console.warn("No push token available");
        return;
      }

      // Here you would send the token to your backend
      // await api.post('/notifications/register', {
      //   userId,
      //   pushToken: token,
      //   platform: Platform.OS,
      // });

      console.log("Push token registered with backend:", token);
    } catch (error) {
      console.error("Error registering push token with backend:", error);
    }
  }
}

export default NotificationService;
