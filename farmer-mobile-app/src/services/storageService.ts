import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  WEATHER_CACHE: 'weatherCache',
  CROP_ANALYSIS_CACHE: 'cropAnalysisCache',
  CHAT_HISTORY: 'chatHistory',
  ROADMAP_CACHE: 'roadmapCache',
  MARKETPLACE_CACHE: 'marketplaceCache',
  APP_SETTINGS: 'appSettings',
  OFFLINE_QUEUE: 'offlineQueue',
} as const;

// Generic storage service
export class StorageService {
  // Store data
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing data for key ${key}:`, error);
      throw error;
    }
  }

  // Get data
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      return null;
    }
  }

  // Remove data
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      throw error;
    }
  }

  // Clear all data
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  // Get multiple items
  static async getMultiple(keys: string[]): Promise<Record<string, any>> {
    try {
      const values = await AsyncStorage.multiGet(keys);
      const result: Record<string, any> = {};
      
      values.forEach(([key, value]) => {
        result[key] = value ? JSON.parse(value) : null;
      });
      
      return result;
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return {};
    }
  }

  // Set multiple items
  static async setMultiple(keyValuePairs: [string, any][]): Promise<void> {
    try {
      const stringifiedPairs = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(stringifiedPairs);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw error;
    }
  }
}

// Specific storage methods for common data types
export const authStorage = {
  setToken: (token: string) => StorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
  getToken: () => StorageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN),
  removeToken: () => StorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN),
  
  setUserData: (userData: any) => StorageService.setItem(STORAGE_KEYS.USER_DATA, userData),
  getUserData: () => StorageService.getItem<any>(STORAGE_KEYS.USER_DATA),
  removeUserData: () => StorageService.removeItem(STORAGE_KEYS.USER_DATA),
};

export const cacheStorage = {
  setWeatherCache: (data: any, location: string) => 
    StorageService.setItem(`${STORAGE_KEYS.WEATHER_CACHE}_${location}`, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
    }),
  
  getWeatherCache: async (location: string) => {
    const cached = await StorageService.getItem<any>(`${STORAGE_KEYS.WEATHER_CACHE}_${location}`);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    return null;
  },

  setCropAnalysisCache: (analyses: any[]) => 
    StorageService.setItem(STORAGE_KEYS.CROP_ANALYSIS_CACHE, analyses),
  
  getCropAnalysisCache: () => 
    StorageService.getItem<any[]>(STORAGE_KEYS.CROP_ANALYSIS_CACHE),

  setChatHistory: (messages: any[]) => 
    StorageService.setItem(STORAGE_KEYS.CHAT_HISTORY, messages),
  
  getChatHistory: () => 
    StorageService.getItem<any[]>(STORAGE_KEYS.CHAT_HISTORY),

  setRoadmapCache: (roadmaps: any[]) => 
    StorageService.setItem(STORAGE_KEYS.ROADMAP_CACHE, roadmaps),
  
  getRoadmapCache: () => 
    StorageService.getItem<any[]>(STORAGE_KEYS.ROADMAP_CACHE),

  setMarketplaceCache: (products: any[]) => 
    StorageService.setItem(STORAGE_KEYS.MARKETPLACE_CACHE, products),
  
  getMarketplaceCache: () => 
    StorageService.getItem<any[]>(STORAGE_KEYS.MARKETPLACE_CACHE),

  // Field management cache methods
  setItem: (key: string, data: any) => 
    StorageService.setItem(key, data),
  
  getItem: <T>(key: string) => 
    StorageService.getItem<T>(key),
};

// Offline queue for failed requests
export const offlineQueue = {
  addToQueue: async (request: any) => {
    const queue = await StorageService.getItem<any[]>(STORAGE_KEYS.OFFLINE_QUEUE) || [];
    queue.push({
      ...request,
      timestamp: Date.now(),
      id: Date.now().toString(),
    });
    await StorageService.setItem(STORAGE_KEYS.OFFLINE_QUEUE, queue);
  },

  getQueue: () => StorageService.getItem<any[]>(STORAGE_KEYS.OFFLINE_QUEUE),

  removeFromQueue: async (requestId: string) => {
    const queue = await StorageService.getItem<any[]>(STORAGE_KEYS.OFFLINE_QUEUE) || [];
    const updatedQueue = queue.filter(item => item.id !== requestId);
    await StorageService.setItem(STORAGE_KEYS.OFFLINE_QUEUE, updatedQueue);
  },

  clearQueue: () => StorageService.removeItem(STORAGE_KEYS.OFFLINE_QUEUE),
};

export default StorageService;