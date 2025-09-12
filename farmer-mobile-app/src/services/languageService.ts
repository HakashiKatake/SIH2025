import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';

export class LanguageService {
  private static readonly LANGUAGE_KEY = 'user-language';
  private static readonly LANGUAGE_SELECTED_KEY = 'language-selected';

  static async getStoredLanguage(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.LANGUAGE_KEY);
    } catch (error) {
      console.error('Error getting stored language:', error);
      return null;
    }
  }

  static async setLanguage(languageCode: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.LANGUAGE_KEY, languageCode);
      await AsyncStorage.setItem(this.LANGUAGE_SELECTED_KEY, 'true');
      
      // Try to change language if i18n is available and ready
      if (i18n && typeof i18n.changeLanguage === 'function') {
        await i18n.changeLanguage(languageCode);
      } else {
        console.warn('i18n not ready, language will be applied when available');
      }
    } catch (error) {
      console.error('Error setting language:', error);
      // Don't throw error, just log it so the app can continue
    }
  }

  static async isLanguageSelected(): Promise<boolean> {
    try {
      const selected = await AsyncStorage.getItem(this.LANGUAGE_SELECTED_KEY);
      return selected === 'true';
    } catch (error) {
      console.error('Error checking language selection:', error);
      return false;
    }
  }

  static async initializeLanguage(): Promise<void> {
    try {
      const storedLanguage = await this.getStoredLanguage();
      if (storedLanguage) {
        await i18n.changeLanguage(storedLanguage);
      }
    } catch (error) {
      console.error('Error initializing language:', error);
    }
  }

  static getSupportedLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    ];
  }
}