import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, type Language } from '../i18n/languages'
import { Globe } from 'lucide-react'

// Country code mapping
const COUNTRY_CODES: Record<string, string> = {
  en: 'US',
  fr: 'FR',
  es: 'ES',
  de: 'DE',
  it: 'IT',
  pt: 'PT',
  ru: 'RU',
  ar: 'SA',
  ko: 'KR',
  ja: 'JP',
  'zh-CN': 'CN',
  'zh-TW': 'TW',
}

export function FreshLangMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, right: 'auto' })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { i18n } = useTranslation()

  const currentLanguage = LANGUAGES.find((l) => l.code === i18n.language)
  const currentCode = currentLanguage?.code?.toUpperCase() || 'EN'

  // Calculate position for dropdown
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const isRTL = document.dir === 'rtl'
      const shouldAlignLeft = isRTL || rect.left < window.innerWidth / 2

      setPosition({
        top: rect.bottom + 8,
        left: shouldAlignLeft ? rect.left : 'auto',
        right: shouldAlignLeft ? 'auto' : window.innerWidth - rect.right,
      })
    }
  }, [isOpen])

  const handleLanguageChange = (code: Language) => {
    void i18n.changeLanguage(code)
    setIsOpen(false)
  }

  // Portal content
  const portalContent = isOpen
    ? ReactDOM.createPortal(
        <div
          className="fixed bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg dark:shadow-2xl z-[999999] flex flex-col overflow-hidden"
          style={{
            top: `${position.top}px`,
            left: position.left === 'auto' ? 'auto' : `${position.left}px`,
            right: position.right === 'auto' ? 'auto' : `${position.right}px`,
            width: '240px',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            maskImage: 'none',
            WebkitMaskImage: 'none',
            filter: 'none',
          }}
          onMouseLeave={() => setIsOpen(false)}
        >
          {LANGUAGES.map((lang, index) => {
            const countryCode = COUNTRY_CODES[lang.code] || lang.code.toUpperCase()
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="flex items-center justify-between w-full px-4 py-3 text-sm cursor-pointer text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                style={{
                  borderBottom:
                    index < LANGUAGES.length - 1
                      ? '1px solid rgba(203, 213, 225, 0.3) dark:rgba(71, 85, 105, 0.3)'
                      : 'none',
                }}
              >
                <span>{lang.name}</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-3">
                  {countryCode}
                </span>
              </button>
            )
          })}
        </div>,
        document.body
      )
    : null

  return (
    <>
      {/* Button with working toggle */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <Globe size={16} className="text-slate-600 dark:text-slate-400" />
        {currentCode}
      </button>

      {/* Portal */}
      {portalContent}
    </>
  )
}
