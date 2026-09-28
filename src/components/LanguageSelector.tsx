import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, type Language } from '../i18n/languages'

// store.cometest.com 의 components/layout/language-selector.tsx 를 이식.
// (포털엔 Tailwind/lucide 가 없어 스타일은 src/styles/portal.css 의 .lang-*,
//  아이콘은 인라인 SVG 로 옮겼다.)

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function LanguageSelector() {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const language = i18n.language as Language
  const currentLanguage = LANGUAGES.find((l) => l.code === language)
  const currentLanguageCode = currentLanguage?.shortLabel ?? language.toUpperCase().split('-')[0]

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Esc 로 닫고 트리거로 포커스 복귀
  useEffect(() => {
    if (!isOpen) return
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleLanguageSelect = (code: Language) => {
    // i18next 가 useTranslation 을 쓰는 모든 컴포넌트를 즉시 다시 렌더링하고,
    // config.ts 의 languageChanged 핸들러가 저장 + <html lang/dir> 갱신을 맡는다.
    void i18n.changeLanguage(code)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="lang">
      <button
        ref={buttonRef}
        type="button"
        className="lang__trigger"
        onClick={() => setIsOpen(!isOpen)}
        title={t('select_language')}
        aria-label={t('select_language')}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <GlobeIcon className="lang__globe" />
        <span className="lang__code">{currentLanguageCode}</span>
        <svg className={`lang__chevron${isOpen ? ' is-open' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="lang__menu" role="menu" aria-orientation="vertical">
          <div className="lang__panel">
            <div className="lang__header">
              <div className="lang__header-title">
                <GlobeIcon className="lang__header-icon" />
                <h3>{t('select_language')}</h3>
              </div>
              <p>{t('languages_available', { count: LANGUAGES.length })}</p>
            </div>

            <div className="lang__list">
              {LANGUAGES.map((lang) => {
                const isSelected = language === lang.code
                return (
                  <button
                    key={lang.code}
                    type="button"
                    className={`lang__item${isSelected ? ' is-selected' : ''}`}
                    onClick={() => handleLanguageSelect(lang.code)}
                    role="menuitem"
                    aria-current={isSelected ? 'true' : 'false'}
                    lang={lang.code}
                  >
                    <span className="lang__item-main">
                      <span className="lang__flag" aria-hidden="true">{lang.flag}</span>
                      <span className="lang__name">{lang.name}</span>
                    </span>
                    <span className="lang__item-meta">
                      <span className="lang__chip">{lang.shortLabel}</span>
                      {isSelected && <CheckIcon className="lang__check" />}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="lang__footer">
              {t('current_language')}: <strong>{currentLanguage?.name}</strong>
            </div>
          </div>
          <div className="lang__arrow" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}
