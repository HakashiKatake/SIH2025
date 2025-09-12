import * as Speech from "expo-speech";
import i18n from "./i18n";

export interface TTSOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

class TextToSpeechService {
  private isEnabled: boolean = true;
  private defaultOptions: TTSOptions = {
    pitch: 1.0,
    rate: 0.8,
    volume: 1.0,
  };

  // Tab messages in different languages
  private tabMessages = {
    en: {
      dashboard: "home tab",
      community: "community tab",
      chat: "chat tab",
      field: "field tab",
      marketplace: "marketplace tab",
      weather: "weather tab",
      scan: "scan tab",
      inventory: "inventory tab",
      orders: "orders tab",
      customers: "customers tab",
      notifications: "notifications tab",
    },
    hi: {
      dashboard: "यह होम टैब है",
      community: "यह कम्युनिटी टैब है",
      chat: "यह चैट टैब है",
      field: "यह फील्ड टैब है",
      marketplace: "यह मार्केटप्लेस टैब है",
      weather: "यह मौसम टैब है",
      scan: "यह स्कैन टैब है",
      inventory: "यह इन्वेंटरी टैब है",
      orders: "यह ऑर्डर टैब है",
      customers: "यह कस्टमर टैब है",
      notifications: "यह नोटिफिकेशन टैब है",
    },
    ta: {
      dashboard: "இது முகப்பு தாவல்",
      community: "இது சமூக தாவல்",
      chat: "இது அரட்டை தாவல்",
      field: "இது வயல் தாவல்",
      marketplace: "இது சந்தை தாவல்",
      weather: "இது வானிலை தாவல்",
      scan: "இது ஸ்கேன் தாவல்",
      inventory: "இது சரக்கு தாவல்",
      orders: "இது ஆர்டர் தாவல்",
      customers: "இது வாடிக்கையாளர் தாவல்",
      notifications: "இது அறிவிப்பு தாவல்",
    },
    te: {
      dashboard: "ఇది హోమ్ ట్యాబ్",
      community: "ఇది కమ్యూనిటీ ట్యాబ్",
      chat: "ఇది చాట్ ట్యాబ్",
      field: "ఇది ఫీల్డ్ ట్యాబ్",
      marketplace: "ఇది మార్కెట్‌ప్లేస్ ట్యాబ్",
      weather: "ఇది వాతావరణ ట్యాబ్",
      scan: "ఇది స్కాన్ ట్యాబ్",
      inventory: "ఇది ఇన్వెంటరీ ట్యాబ్",
      orders: "ఇది ఆర్డర్స్ ట్యాబ్",
      customers: "ఇది కస్టమర్స్ ట్యాబ్",
      notifications: "ఇది నోటిఫికేషన్స్ ట్యాబ్",
    },
    kn: {
      dashboard: "ಇದು ಮುಖ್ಯ ಟ್ಯಾಬ್",
      community: "ಇದು ಸಮುದಾಯ ಟ್ಯಾಬ್",
      chat: "ಇದು ಚಾಟ್ ಟ್ಯಾಬ್",
      field: "ಇದು ಕ್ಷೇತ್ರ ಟ್ಯಾಬ್",
      marketplace: "ಇದು ಮಾರುಕಟ್ಟೆ ಟ್ಯಾಬ್",
      weather: "ಇದು ಹವಾಮಾನ ಟ್ಯಾಬ್",
      scan: "ಇದು ಸ್ಕ್ಯಾನ್ ಟ್ಯಾಬ್",
      inventory: "ಇದು ದಾಸ್ತಾನು ಟ್ಯಾಬ್",
      orders: "ಇದು ಆರ್ಡರ್‌ಗಳ ಟ್ಯಾಬ್",
      customers: "ಇದು ಗ್ರಾಹಕರ ಟ್ಯಾಬ್",
      notifications: "ಇದು ಅಧಿಸೂಚನೆಗಳ ಟ್ಯಾಬ್",
    },
    ml: {
      dashboard: "ഇത് ഹോം ടാബ് ആണ്",
      community: "ഇത് കമ്മ്യൂണിറ്റി ടാബ് ആണ്",
      chat: "ഇത് ചാറ്റ് ടാബ് ആണ്",
      field: "ഇത് ഫീൽഡ് ടാബ് ആണ്",
      marketplace: "ഇത് മാർക്കറ്റ്പ്ലേസ് ടാബ് ആണ്",
      weather: "ഇത് കാലാവസ്ഥ ടാബ് ആണ്",
      scan: "ഇത് സ്കാൻ ടാബ് ആണ്",
      inventory: "ഇത് ഇൻവെന്ററി ടാബ് ആണ്",
      orders: "ഇത് ഓർഡറുകൾ ടാബ് ആണ്",
      customers: "ഇത് ഉപഭോക്താക്കൾ ടാബ് ആണ്",
      notifications: "ഇത് അറിയിപ്പുകൾ ടാബ് ആണ്",
    },
  };

  // Language codes for Speech API
  private languageCodes = {
    en: "en-US",
    hi: "hi-IN",
    ta: "ta-IN",
    te: "te-IN",
    kn: "kn-IN",
    ml: "ml-IN",
  };

  /**
   * Enable or disable text-to-speech
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if TTS is enabled
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Set default TTS options
   */
  setDefaultOptions(options: Partial<TTSOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Speak text with optional custom options
   */
  async speak(text: string, options?: TTSOptions): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      const finalOptions = { ...this.defaultOptions, ...options };

      await Speech.speak(text, {
        language: finalOptions.language || this.languageCodes.en,
        pitch: finalOptions.pitch,
        rate: finalOptions.rate,
        volume: finalOptions.volume,
      });
    } catch (error) {
      console.warn("Text-to-speech failed:", error);
    }
  }

  /**
   * Speak tab name when tab is pressed
   */
  async speakTabName(tabName: string, currentLanguage?: string): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    // Get current language from i18n if not provided
    const language = currentLanguage || i18n.language || "en";

    const messages =
      this.tabMessages[language as keyof typeof this.tabMessages] ||
      this.tabMessages.en;
    const message =
      messages[tabName as keyof typeof messages] || `This is ${tabName} tab`;
    const languageCode =
      this.languageCodes[language as keyof typeof this.languageCodes] ||
      this.languageCodes.en;

    await this.speak(message, { language: languageCode });
  }

  /**
   * Stop current speech
   */
  async stop(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.warn("Failed to stop speech:", error);
    }
  }

  /**
   * Check if speech is currently playing
   */
  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      console.warn("Failed to check speech status:", error);
      return false;
    }
  }

  /**
   * Get available voices for a language
   */
  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      return await Speech.getAvailableVoicesAsync();
    } catch (error) {
      console.warn("Failed to get available voices:", error);
      return [];
    }
  }
}

// Export singleton instance
export const textToSpeechService = new TextToSpeechService();
export default textToSpeechService;
