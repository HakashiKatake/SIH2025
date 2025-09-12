import { useCallback } from 'react';
import { textToSpeechService } from '../services/textToSpeechService';
import i18n from '../services/i18n';

export const useTabTTS = () => {
  const speakTabName = useCallback(async (tabName: string) => {
    try {
      const currentLanguage = i18n.language || 'en';
      await textToSpeechService.speakTabName(tabName, currentLanguage);
    } catch (error) {
      console.warn('Failed to speak tab name:', error);
    }
  }, []);

  const setTTSEnabled = useCallback((enabled: boolean) => {
    textToSpeechService.setEnabled(enabled);
  }, []);

  const isTTSEnabled = useCallback(() => {
    return textToSpeechService.getEnabled();
  }, []);

  return {
    speakTabName,
    setTTSEnabled,
    isTTSEnabled,
  };
};

export default useTabTTS;