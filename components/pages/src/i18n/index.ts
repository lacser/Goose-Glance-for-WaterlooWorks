import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入翻译文件
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import enUS from './locales/en-US.json';
import enCA from './locales/en-CA.json';
import enGB from './locales/en-GB.json';
import frCA from './locales/fr-CA.json';
import frFR from './locales/fr-FR.json';

const resources = {
  'zh-CN': {
    translation: zhCN,
  },
  'zh-TW': {
    translation: zhTW,
  },
  'en-US': {
    translation: enUS,
  },
  'en-CA': {
    translation: enCA,
  },
  'en-GB': {
    translation: enGB,
  },
  'fr-CA': {
    translation: frCA,
  },
  'fr-FR': {
    translation: frFR,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-US',
    debug: false,
    
    detection: {
      order: ['navigator', 'localStorage', 'sessionStorage'],
      caches: ['localStorage', 'sessionStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
