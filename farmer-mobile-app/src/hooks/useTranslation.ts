import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = async (language: string) => {
    try {
      await i18n.changeLanguage(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const getCurrentLanguage = () => {
    return i18n.language || 'en';
  };

  const isRTL = () => {
    // Add RTL languages if needed in the future
    const rtlLanguages = ['ar', 'he', 'fa'];
    return rtlLanguages.includes(getCurrentLanguage());
  };

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    isRTL,
    language: getCurrentLanguage(),
  };
};

export default useTranslation;