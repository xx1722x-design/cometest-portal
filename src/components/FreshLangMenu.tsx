import React, { useState } from 'react'
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
  const { i18n } = useTranslation()

  const currentLanguage = LANGUAGES.find((l) => l.code === i18n.language)
  const currentCode = currentLanguage?.code?.toUpperCase() || 'EN'

  const handleLanguageChange = (code: Language) => {
    void i18n.changeLanguage(code)
    setIsOpen(false)
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        zIndex: 99999,
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Button - Always visible */}
      <button
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

      {/* Dropdown - ONLY visible when isOpen is true */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            width: '240px',
            backgroundColor: '#0f172a',
            border: '1px solid #475569',
            borderRadius: '0.375rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
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
        </div>
      )}
    </div>
  )
}
