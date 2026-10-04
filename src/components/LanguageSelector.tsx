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
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-200 bg-[#0f172a] border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
      >
        <Globe className="w-4 h-4" />
        {currentLangLabel}
      </button>

      {/* Dropdown: 100% Solid Background, Zero Fog/Mask - ULTRA OVERRIDE */}
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
            backdropFilter: 'none !important',
            WebkitBackdropFilter: 'none !important',
            filter: 'none !important',
            maskImage: 'none !important',
            WebkitMaskImage: 'none !important',
            backgroundImage: 'none !important',
          } as React.CSSProperties}
        >
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              backgroundColor: '#0f172a',
              backdropFilter: 'none !important',
              WebkitBackdropFilter: 'none !important',
              filter: 'none !important',
            } as React.CSSProperties}
          >
            {LANGUAGES.map((lang) => (
              <li
                key={lang.code}
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  backgroundColor: '#0f172a',
                  backdropFilter: 'none !important',
                  WebkitBackdropFilter: 'none !important',
                }}
              >
                <button
                  onClick={() => { handleLanguageSelect(lang.code); setIsOpen(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '14px',
                    cursor: 'pointer',
                    color: '#e2e8f0',
                    textAlign: 'left',
                    border: 'none',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.5)',
                    backgroundColor: '#0f172a',
                    transition: 'background-color 0.2s',
                    backdropFilter: 'none !important',
                    WebkitBackdropFilter: 'none !important',
                    filter: 'none !important',
                  } as React.CSSProperties}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
                >
                  {lang.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
