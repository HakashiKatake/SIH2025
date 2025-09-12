import { useAuthStore } from '../store/authStore';
import { useCropStore } from '../store/cropStore';
import { useChatStore } from '../store/chatStore';
import { useFieldStore } from '../store/fieldStore';
import NotificationService from './notificationService';
import LocationService from './locationService';

export class AppInitService {
  static async initialize(): Promise<void> {
    try {
      console.log('Initializing app services...');

      // Initialize notifications
      await this.initializeNotifications();

      // Request location permissions
      await this.initializeLocation();

      // Load cached authentication data
      await this.loadCachedAuth();

      // Load cached app data
      await this.loadCachedData();

      console.log('App initialization completed');
    } catch (error) {
      console.error('Error during app initialization:', error);
    }
  }

  private static async initializeNotifications(): Promise<void> {
    try {
      const pushToken = await NotificationService.initialize();
      if (pushToken) {
        console.log('Push notifications initialized successfully');
        
        // Set up notification listeners
        NotificationService.addNotificationReceivedListener((notification) => {
          console.log('Notification received:', notification);
        });

        NotificationService.addNotificationResponseListener((response) => {
          console.log('Notification response:', response);
          // Handle notification tap/interaction
        });
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private static async initializeLocation(): Promise<void> {
    try {
      const hasPermission = await LocationService.requestPermissions();
      if (hasPermission) {
        console.log('Location permissions granted');
        
        // Get initial location
        const location = await LocationService.getCurrentLocation();
        if (location) {
          console.log('Initial location obtained:', location);
        }
      }
    } catch (error) {
      console.error('Error initializing location:', error);
    }
  }

  private static async loadCachedAuth(): Promise<void> {
    try {
      const authStore = useAuthStore.getState();
      if (authStore.loadStoredAuth && typeof authStore.loadStoredAuth === 'function') {
        await Promise.race([
          authStore.loadStoredAuth(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Auth load timeout')), 5000))
        ]);
        console.log('Cached authentication data loaded');
      }
    } catch (error) {
      console.error('Error loading cached auth:', error);
    }
  }

  private static async loadCachedData(): Promise<void> {
    try {
      const timeout = (ms: number) => new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Cache load timeout')), ms)
      );

      // Load cached crop analyses
      const cropStore = useCropStore.getState();
      if (cropStore.loadCachedData && typeof cropStore.loadCachedData === 'function') {
        await Promise.race([cropStore.loadCachedData(), timeout(3000)]).catch(() => {});
      }

      // Load cached field data
      const fieldStore = useFieldStore.getState();
      if (fieldStore.loadCachedData && typeof fieldStore.loadCachedData === 'function') {
        await Promise.race([fieldStore.loadCachedData(), timeout(3000)]).catch(() => {});
      }

      // Load cached chat messages
      const chatStore = useChatStore.getState();
      if (chatStore.loadCachedMessages && typeof chatStore.loadCachedMessages === 'function') {
        await Promise.race([chatStore.loadCachedMessages(), timeout(3000)]).catch(() => {});
      }

      console.log('Cached app data loaded');
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  }

  // Register push token with backend when user logs in
  static async registerPushToken(userId: string): Promise<void> {
    try {
      await NotificationService.registerWithBackend(userId);
      console.log('Push token registered with backend');
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  }

  // Schedule farming reminders
  static async scheduleFarmingReminders(): Promise<void> {
    try {
      // Example: Schedule daily farming tips
      await NotificationService.scheduleFarmingReminder(
        'Daily Farming Tip',
        'Check your crops for any signs of pests or diseases today!',
        new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        { type: 'daily_tip' }
      );

      console.log('Farming reminders scheduled');
    } catch (error) {
      console.error('Error scheduling farming reminders:', error);
    }
  }

  // Handle app state changes (foreground/background)
  static handleAppStateChange(nextAppState: string): void {
    if (nextAppState === 'active') {
      // App came to foreground
      console.log('App came to foreground');
      // You might want to refresh data here
    } else if (nextAppState === 'background') {
      // App went to background
      console.log('App went to background');
      // You might want to save state here
    }
  }
}

export default AppInitService;