import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, type Language } from '../i18n/languages'
import { Globe } from 'lucide-react'

// Country code mapping for each language
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

  // Calculate dropdown position with RTL support
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const isRTL = document.dir === 'rtl'

      // Decide left or right alignment based on RTL or button position
      const shouldAlignLeft = isRTL || rect.left < window.innerWidth / 2

      if (shouldAlignLeft) {
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
          right: 'auto',
        })
      } else {
        setPosition({
          top: rect.bottom + 8,
          left: 'auto',
          right: window.innerWidth - rect.right,
        })
      }
    }
  }, [isOpen])

  const handleLanguageChange = (code: Language) => {
    void i18n.changeLanguage(code)
    setIsOpen(false)
  }

  // Portal content - renders in document.body
  const portalContent = isOpen
    ? ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: position.left === 'auto' ? 'auto' : `${position.left}px`,
            right: position.right === 'auto' ? 'auto' : `${position.right}px`,
            width: '260px',
            backgroundColor: '#0a0f1a',
            border: '1px solid #2d5a8c',
            borderRadius: '0.375rem',
            boxShadow: '0 0 30px rgba(45, 90, 140, 0.3), 0 20px 40px rgba(0, 0, 0, 0.8)',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.875rem 1.25rem',
                  fontSize: '13px',
                  fontWeight: '500',
                  letterSpacing: '0.3px',
                  cursor: 'pointer',
                  color: '#d4d9e0',
                  backgroundColor: '#0a0f1a',
                  border: 'none',
                  borderBottom: index < LANGUAGES.length - 1 ? '1px solid rgba(45, 90, 140, 0.2)' : 'none',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a2845'
                  e.currentTarget.style.borderLeftColor = '#2d5a8c'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0a0f1a'
                }}
              >
                <span>{lang.name}</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.5px',
                    color: '#5a7fa0',
                    marginLeft: '1rem',
                  }}
                >
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
      {/* Button - Night-Punk Aesthetic */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.875rem',
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '0.3px',
          color: '#d4d9e0',
          backgroundColor: '#0a0f1a',
          border: '1px solid #2d5a8c',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 0 12px rgba(45, 90, 140, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1a2845'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(45, 90, 140, 0.4)'
          e.currentTarget.style.borderColor = '#4a8fd9'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#0a0f1a'
          e.currentTarget.style.boxShadow = '0 0 12px rgba(45, 90, 140, 0.2)'
          e.currentTarget.style.borderColor = '#2d5a8c'
        }}
      >
        <Globe size={16} style={{ color: '#5a7fa0' }} />
        {currentCode}
      </button>

      {/* Portal rendering dropdown into document.body */}
      {portalContent}
    </>
  )
}
