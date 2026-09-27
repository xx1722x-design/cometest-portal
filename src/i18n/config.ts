import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ko from './locales/ko.json'
import ja from './locales/ja.json'
import en from './locales/en.json'
import zh from './locales/zh.json'
import zhTw from './locales/zh-TW.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import ru from './locales/ru.json'
import ar from './locales/ar.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      ja: { translation: ja },
      en: { translation: en },
      zh: { translation: zh },
      'zh-TW': { translation: zhTw },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      ru: { translation: ru },
      ar: { translation: ar },
    },
    lng: 'ko',
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
