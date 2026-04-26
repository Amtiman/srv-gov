import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';
import ar from '../locales/ar.json';
import fr from '../locales/fr.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  fr: { translation: fr },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar', 'fr'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

const applyLang = (lng: string) => {
  const html = document.documentElement;
  html.setAttribute('lang', lng);
  html.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
  document.body.style.fontFamily = lng === 'ar'
    ? 'Cairo, sans-serif'
    : 'Garamond, Georgia, serif';
};

i18n.on('languageChanged', applyLang);
i18n.on('initialized', () => applyLang(i18n.language || 'en'));

export default i18n;
