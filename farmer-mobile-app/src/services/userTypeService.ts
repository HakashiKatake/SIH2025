import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export type UserType = "farmer" | "dealer";

export class UserTypeService {
  private static readonly USER_TYPE_KEY = "user-type";
  private static readonly USER_TYPE_SELECTED_KEY = "user-type-selected";
  private static readonly LANGUAGE_SELECTED_KEY = "language-selected";

  static async getStoredUserType(): Promise<UserType | null> {
    try {
      // Always use AsyncStorage in React Native
      return (await AsyncStorage.getItem(
        this.USER_TYPE_KEY
      )) as UserType | null;
    } catch (error) {
      console.error("Error getting stored user type:", error);
      return null;
    }
  }

  static async setUserType(userType: UserType): Promise<void> {
    try {
      // Always use AsyncStorage in React Native
      await AsyncStorage.setItem(this.USER_TYPE_KEY, userType);
      await AsyncStorage.setItem(this.USER_TYPE_SELECTED_KEY, "true");
    } catch (error) {
      console.error("Error setting user type:", error);
      throw error;
    }
  }

  static async isUserTypeSelected(): Promise<boolean> {
    try {
      // Always use AsyncStorage in React Native
      const selected = await AsyncStorage.getItem(this.USER_TYPE_SELECTED_KEY);
      return selected === "true";
    } catch (error) {
      console.error("Error checking user type selection:", error);
      return false;
    }
  }

  static async hasCompletedLanguageSelection(): Promise<boolean> {
    try {
      // Always use AsyncStorage in React Native
      const selected = await AsyncStorage.getItem(this.LANGUAGE_SELECTED_KEY);
      return selected === "true";
    } catch (error) {
      console.error("Error checking language selection:", error);
      return false;
    }
  }

  static async setLanguageSelected(): Promise<void> {
    try {
      // Always use AsyncStorage in React Native
      await AsyncStorage.setItem(this.LANGUAGE_SELECTED_KEY, "true");
    } catch (error) {
      console.error("Error setting language selected:", error);
      throw error;
    }
  }

  static async clearUserType(): Promise<void> {
    try {
      // Always use AsyncStorage in React Native
      await AsyncStorage.removeItem(this.USER_TYPE_KEY);
      await AsyncStorage.removeItem(this.USER_TYPE_SELECTED_KEY);
      await AsyncStorage.removeItem(this.LANGUAGE_SELECTED_KEY);
    } catch (error) {
      console.error("Error clearing user type:", error);
      throw error;
    }
  }
}
