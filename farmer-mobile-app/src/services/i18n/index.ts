import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Safely import RNLocalize with fallback
let RNLocalize: any = null;
try {
  RNLocalize = require('react-native-localize');
} catch (error) {
  console.warn('react-native-localize not available, using fallback language detection');
}

// Import translation files
import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import ta from './locales/ta.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // For React Native, always use AsyncStorage
      const storedLanguage = await AsyncStorage.getItem('user-language');
      if (storedLanguage) {
        callback(storedLanguage);
        return;
      }

      // Fallback to device language if RNLocalize is available
      if (RNLocalize) {
        try {
          const deviceLanguages = RNLocalize.getLocales();
          const deviceLanguage = deviceLanguages[0]?.languageCode || 'en';
          callback(deviceLanguage);
        } catch (localeError) {
          // If RNLocalize fails, fallback to English
          callback('en');
        }
      } else {
        // RNLocalize not available, use English as default
        callback('en');
      }
    } catch (error) {
      console.log('Error detecting language:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      // For React Native, always use AsyncStorage
      await AsyncStorage.setItem('user-language', lng);
    } catch (error) {
      console.log('Error caching language:', error);
      // Don't throw error, just log it
    }
  },
};

// Initialize i18n
const initI18n = async () => {
  try {
    await i18n
      .use(LANGUAGE_DETECTOR)
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: en },
          hi: { translation: hi },
          te: { translation: te },
          ta: { translation: ta },
          kn: { translation: kn },
          ml: { translation: ml },
        },
        fallbackLng: 'en',
        debug: __DEV__,
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });
    console.log('i18n initialized successfully');
  } catch (error) {
    console.error('Error initializing i18n:', error);
  }
};

// Initialize immediately
initI18n();

export default i18n;