import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { tr } from './locales/tr.js';
import { en } from './locales/en.js';

i18n.use(initReactI18next).init({
  lng: 'tr',
  fallbackLng: 'en',
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
