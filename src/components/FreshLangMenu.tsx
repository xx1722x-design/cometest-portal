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

// Helper function to detect dark mode
function isDarkModeActive(): boolean {
  if (typeof document === 'undefined') return true // Default to dark
  return document.documentElement.classList.contains('dark')
}

export function FreshLangMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number | string; right: number | string }>({
    top: 0,
    left: 0,
    right: 'auto',
  })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { i18n } = useTranslation()

  const currentLanguage = LANGUAGES.find((l) => l.code === i18n.language)
  const currentCode = currentLanguage?.code?.toUpperCase() || 'EN'

  // Calculate dropdown position with RTL support
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const isRTL = document.dir === 'rtl'

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

  // Detect dark mode at render time - EXPLICIT CHECK
  const isDark = isDarkModeActive()

  // Night-Punk (Dark Mode) - PRIMARY
  const darkColors = {
    bg: '#0f172a',
    bgHover: '#1e293b',
    text: '#e2e8f0',
    border: '#475569',
    itemBorder: 'rgba(71, 85, 105, 0.3)',
    countryCode: '#94a3b8',
  }

  // White-Punk (Light Mode) - SECONDARY
  const lightColors = {
    bg: '#ffffff',
    bgHover: '#f8fafc',
    text: '#1e293b',
    border: '#cbd5e1',
    itemBorder: 'rgba(203, 213, 225, 0.3)',
    countryCode: '#64748b',
  }

  // USE DARK MODE BY DEFAULT, SWITCH TO LIGHT ONLY IF isDark === false
  const colors = isDark ? darkColors : lightColors

  // Portal content - renders in document.body with explicit dark mode colors
  const portalContent = isOpen
    ? ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: position.left === 'auto' ? 'auto' : `${position.left}px`,
            right: position.right === 'auto' ? 'auto' : `${position.right}px`,
            width: '240px',
            backgroundColor: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.375rem',
            boxShadow: isDark ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
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
                  padding: '0.75rem 1rem',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: colors.text,
                  backgroundColor: colors.bg,
                  border: 'none',
                  borderBottom: index < LANGUAGES.length - 1 ? `1px solid ${colors.itemBorder}` : 'none',
                  textAlign: 'left',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bgHover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bg
                }}
              >
                <span>{lang.name}</span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: colors.countryCode,
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
      {/* Button - Explicit dark mode colors */}
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
          color: colors.text,
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.375rem',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.bgHover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.bg
        }}
      >
        <Globe size={16} style={{ color: colors.countryCode }} />
        {currentCode}
      </button>

      {/* Portal rendering dropdown into document.body */}
      {portalContent}
    </>
  )
}
