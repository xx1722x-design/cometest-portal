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
  const [position, setPosition] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { i18n } = useTranslation()

  const currentLanguage = LANGUAGES.find((l) => l.code === i18n.language)
  const currentCode = currentLanguage?.code?.toUpperCase() || 'EN'

  // Calculate dropdown position based on button location
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 8, // 8px gap below button
        right: window.innerWidth - rect.right, // Align to button right edge
      })
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
            right: `${position.right}px`,
            width: '240px',
            backgroundColor: '#0f172a',
            border: '1px solid #475569',
            borderRadius: '0.375rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)',
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
          {LANGUAGES.map((lang) => {
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
                  padding: '0.75rem 1rem',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#e2e8f0',
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
                  textAlign: 'left',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
              >
                <span>{lang.name}</span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#64748b',
                    marginLeft: '0.75rem',
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
      {/* Button - Always visible inside header */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          fontSize: '14px',
          fontWeight: '600',
          color: '#e2e8f0',
          backgroundColor: '#0f172a',
          border: '1px solid #475569',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
      >
        <Globe size={16} />
        {currentCode}
      </button>

      {/* Portal rendering dropdown into document.body */}
      {portalContent}
    </>
  )
}
