import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ko from './locales/ko.json'
import ja from './locales/ja.json'
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'
import zhTw from './locales/zh-TW.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import ru from './locales/ru.json'
import ar from './locales/ar.json'
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  applyLanguageToDOM,
  isLanguage,
  persistLanguage,
  resolveInitialLanguage,
} from './languages'

const initialLanguage = resolveInitialLanguage()

i18n
  .use(initReactI18next)
  .init({
    // 번역은 번들에 정적으로 포함 — 로딩 단계 없이 첫 렌더부터 번역된 텍스트
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      de: { translation: de },
      ru: { translation: ru },
      ar: { translation: ar },
      'zh-CN': { translation: zhCN },
      'zh-TW': { translation: zhTw },
      ja: { translation: ja },
      ko: { translation: ko },
    },
    lng: initialLanguage,
    supportedLngs: LANGUAGES.map((l) => l.code),
    // 'zh-CN' 을 'zh' 로 줄여 찾지 않도록 정확한 코드만 사용
    load: 'currentOnly',
    // 스토어와 동일: 누락 키는 영어로 대체 (빈칸/다른 언어 노출 방지)
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
  })

applyLanguageToDOM(initialLanguage)

// 언어가 바뀌면 즉시 저장(localStorage + 쿠키)하고 <html lang/dir> 를 갱신
i18n.on('languageChanged', (lng) => {
  if (!isLanguage(lng)) return
  persistLanguage(lng)
  applyLanguageToDOM(lng)
})

export default i18n
