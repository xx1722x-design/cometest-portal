import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { LANGUAGES, type Language } from '../i18n/languages'

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { t, i18n } = useTranslation()

  const currentLanguage = LANGUAGES.find((l) => l.code === i18n.language)
  const currentLangLabel = currentLanguage?.code?.toUpperCase() || 'EN'

  const handleLanguageSelect = (code: Language) => {
    void i18n.changeLanguage(code)
    setIsOpen(false)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block', zIndex: 10 }}>
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
        <Globe size={16} style={{ color: '#e2e8f0' }} />
        {currentLangLabel}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            width: '192px',
            backgroundColor: '#0f172a',
            border: '1px solid #475569',
            borderRadius: '0.375rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            zIndex: 99999,
            maxHeight: '400px',
            overflowY: 'auto',
            backdropFilter: 'none !important',
            WebkitBackdropFilter: 'none !important',
            filter: 'none !important',
            maskImage: 'none !important',
            WebkitMaskImage: 'none !important',
            backgroundImage: 'none !important',
          } as React.CSSProperties}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = i18n.language === lang.code
            return (
              <div
                key={lang.code}
                onClick={() => { handleLanguageSelect(lang.code); setIsOpen(false); }}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '14px',
                  color: '#e2e8f0',
                  backgroundColor: isSelected ? '#1e293b' : '#0f172a',
                  borderBottom: '1px solid rgba(71, 85, 105, 0.5)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  textAlign: 'left',
                  backdropFilter: 'none !important',
                  WebkitBackdropFilter: 'none !important',
                  filter: 'none !important',
                  maskImage: 'none !important',
                  WebkitMaskImage: 'none !important',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isSelected ? '#1e293b' : '#0f172a')}
              >
                {lang.name}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
