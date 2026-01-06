import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru.json';
import en from './locales/en.json';

// Get saved language or detect from system
const getSavedLanguage = (): string => {
  const saved = localStorage.getItem('language');
  if (saved) return saved;

  // Detect system language
  const systemLang = navigator.language.split('-')[0];
  return systemLang === 'ru' ? 'ru' : 'en';
};

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en }
  },
  lng: getSavedLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

// Save language preference
export const changeLanguage = (lang: string): void => {
  i18n.changeLanguage(lang);
  localStorage.setItem('language', lang);
};

export default i18n;
