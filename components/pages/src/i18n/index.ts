import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入翻译文件
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import enCA from './locales/en-CA.json';
import frCA from './locales/fr-CA.json';

const resources = {
  'zh-CN': {
    translation: zhCN,
  },
  'zh-TW': {
    translation: zhTW,
  },
  'en-CA': {
    translation: enCA,
  },
  'fr-CA': {
    translation: frCA,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-CN',
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
