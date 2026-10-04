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

// Theme configurations
const THEMES = {
  dark: {
    // Night-Punk
    bg: '#0a0f1a',
    bgHover: '#1a2845',
    text: '#d4d9e0',
    border: '#2d5a8c',
    borderHover: '#4a8fd9',
    glow: 'rgba(45, 90, 140, 0.3)',
    glowHover: 'rgba(45, 90, 140, 0.4)',
    itemBorder: 'rgba(45, 90, 140, 0.2)',
    countryCode: '#5a7fa0',
  },
  light: {
    // White-Punk
    bg: '#ffffff',
    bgHover: '#f8fafc',
    text: '#1e293b',
    border: '#cbd5e1',
    borderHover: '#94a3b8',
    glow: 'rgba(203, 213, 225, 0.3)',
    glowHover: 'rgba(203, 213, 225, 0.5)',
    itemBorder: 'rgba(203, 213, 225, 0.4)',
    countryCode: '#64748b',
  },
}

export function FreshLangMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number | string; right: number | string }>({
    top: 0,
    left: 0,
    right: 'auto',
  })
  const [isDark, setIsDark] = useState(true)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { i18n } = useTranslation()

  const currentLanguage = LANGUAGES.find((l) => l.code === i18n.language)
  const currentCode = currentLanguage?.code?.toUpperCase() || 'EN'

  // Detect theme changes
  useEffect(() => {
    const detectTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark')
      setIsDark(isDarkMode)
    }

    detectTheme()

    // Listen for theme changes
    const observer = new MutationObserver(detectTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

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

  const theme = isDark ? THEMES.dark : THEMES.light

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
            backgroundColor: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: '0.375rem',
            boxShadow: isDark
              ? `0 0 30px ${theme.glow}, 0 20px 40px rgba(0, 0, 0, 0.8)`
              : `0 2px 12px rgba(0, 0, 0, 0.08), 0 4px 24px rgba(0, 0, 0, 0.05)`,
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
                  color: theme.text,
                  backgroundColor: theme.bg,
                  border: 'none',
                  borderBottom: index < LANGUAGES.length - 1 ? `1px solid ${theme.itemBorder}` : 'none',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bgHover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg
                }}
              >
                <span>{lang.name}</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.5px',
                    color: theme.countryCode,
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
      {/* Button - Dynamic Theme */}
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
          color: theme.text,
          backgroundColor: theme.bg,
          border: `1px solid ${theme.border}`,
          borderRadius: '0.375rem',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: isDark
            ? `0 0 12px ${theme.glow}`
            : `0 1px 3px rgba(0, 0, 0, 0.1)`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.bgHover
          e.currentTarget.style.borderColor = theme.borderHover
          e.currentTarget.style.boxShadow = isDark
            ? `0 0 20px ${theme.glowHover}`
            : `0 2px 8px rgba(0, 0, 0, 0.08)`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.bg
          e.currentTarget.style.borderColor = theme.border
          e.currentTarget.style.boxShadow = isDark
            ? `0 0 12px ${theme.glow}`
            : `0 1px 3px rgba(0, 0, 0, 0.1)`
        }}
      >
        <Globe size={16} style={{ color: theme.countryCode }} />
        {currentCode}
      </button>

      {/* Portal rendering dropdown into document.body */}
      {portalContent}
    </>
  )
}
