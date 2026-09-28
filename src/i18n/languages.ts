// store.cometest.com 의 src/lib/i18n.ts + src/context/LanguageContext.tsx 를
// 포털(Vite + i18next)에 맞게 이식한 언어 정의·저장·DOM 적용 로직.
// 언어 코드, 순서, shortLabel, 저장 키/우선순위를 스토어와 동일하게 유지해야
// 두 사이트를 오갈 때 언어 선택이 어긋나지 않는다.

export type Language = 'en' | 'fr' | 'es' | 'de' | 'ru' | 'ar' | 'zh-CN' | 'zh-TW' | 'ja' | 'ko'

// 스토어와 같은 순서·표기. shortLabel 은 ISO 코드가 아니라 UI 칩용 표기
// (JP/KR, 중국어는 정치적 중립을 위해 국가 대신 문자 체계 SC/TC).
export const LANGUAGES: { code: Language; name: string; shortLabel: string; flag: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', name: 'English', shortLabel: 'EN', flag: '🇺🇸', dir: 'ltr' },
  { code: 'fr', name: 'Français', shortLabel: 'FR', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', name: 'Español', shortLabel: 'ES', flag: '🇪🇸', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', shortLabel: 'DE', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ru', name: 'Русский', shortLabel: 'RU', flag: '🇷🇺', dir: 'ltr' },
  { code: 'ar', name: 'العربية', shortLabel: 'AR', flag: '🇸🇦', dir: 'rtl' },
  { code: 'zh-CN', name: '简体中文', shortLabel: 'SC', flag: '🇨🇳', dir: 'ltr' },
  { code: 'zh-TW', name: '繁體中文', shortLabel: 'TC', flag: '🇹🇼', dir: 'ltr' },
  { code: 'ja', name: '日本語', shortLabel: 'JP', flag: '🇯🇵', dir: 'ltr' },
  { code: 'ko', name: '한국어', shortLabel: 'KR', flag: '🇰🇷', dir: 'ltr' },
]

// 스토어와 같은 키 이름 (localStorage + 쿠키)
export const STORAGE_KEY = 'cometest_language'
export const DEFAULT_LANGUAGE: Language = 'en'

export function isLanguage(value: string | null | undefined): value is Language {
  return !!value && LANGUAGES.some((l) => l.code === value)
}

export function getLanguageDir(lang: Language): 'ltr' | 'rtl' {
  return LANGUAGES.find((l) => l.code === lang)?.dir ?? 'ltr'
}

function readCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

function writeLanguageCookie(lang: Language) {
  try {
    document.cookie = `${STORAGE_KEY}=${lang}; path=/; max-age=31536000; SameSite=Lax`
  } catch {
    // document 접근 불가 — localStorage 가 대신 유지한다
  }
}

// 초기 언어 결정 (스토어와 같은 우선순위):
//   1. ?lang= URL 파라미터 (명시적·공유 가능한 지정 — 저장까지 함)
//   2. localStorage (이 브라우저의 마지막 선택)
//   3. 쿠키
//   4. 기본값 en
// Safari 사설 모드 등은 localStorage 접근 시 예외를 던지므로 모두 try/catch.
export function resolveInitialLanguage(): Language {
  try {
    const urlLang = new URLSearchParams(window.location.search).get('lang')
    if (isLanguage(urlLang)) {
      persistLanguage(urlLang)
      return urlLang
    }
  } catch {
    // URL 접근 불가 — 다음 단계로
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLanguage(saved)) return saved
  } catch {
    // localStorage 접근 불가 — 다음 단계로
  }
  const cookieLang = readCookie(STORAGE_KEY)
  if (isLanguage(cookieLang)) return cookieLang
  return DEFAULT_LANGUAGE
}

export function persistLanguage(lang: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // localStorage 접근 불가 — 메모리 상태와 쿠키로 유지
  }
  writeLanguageCookie(lang)
}

// <html lang/dir> 와 rtl/ltr 클래스를 갱신한다 (아랍어 RTL 레이아웃).
export function applyLanguageToDOM(lang: Language) {
  if (typeof document === 'undefined') return
  const dir = getLanguageDir(lang)
  const root = document.documentElement
  root.lang = lang
  root.dir = dir
  root.classList.toggle('rtl', dir === 'rtl')
  root.classList.toggle('ltr', dir === 'ltr')
}

// 스토어 링크에 현재 언어를 실어 보낸다 — 스토어는 ?lang= 을 최우선으로 읽고 저장하므로
// 포털에서 고른 언어가 스토어에서도 그대로 유지된다.
export function withLang(url: string, lang: string): string {
  const u = new URL(url)
  if (isLanguage(lang)) u.searchParams.set('lang', lang)
  return u.toString()
}
