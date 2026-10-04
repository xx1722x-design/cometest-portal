import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, type Language } from '../i18n/languages'

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { t, i18n } = useTranslation()

  const language = i18n.language as Language
  const currentLanguage = LANGUAGES.find((l) => l.code === language)
  const currentLanguageCode = currentLanguage?.shortLabel ?? language.toUpperCase().split('-')[0]
  const currentLangLabel = currentLanguage?.name || currentLanguageCode

  const handleLanguageSelect = (code: Language) => {
    void i18n.changeLanguage(code)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      {/* Button: Fixed to top-right, rounded dark theme */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-200 bg-[#0f172a] border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        {currentLanguageCode}
      </button>

      {/* Dropdown Popup: Expands vertically directly below the button */}
      {isOpen && (
        <div className="absolute top-full ltr:right-0 rtl:left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-md shadow-lg z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-slate-100">{t('select_language')}</h3>
            <p className="text-xs text-slate-400 mt-1">{t('languages_available', { count: LANGUAGES.length })}</p>
          </div>

          {/* STRICT VERTICAL LIST (flex-col) */}
          <ul className="flex flex-col max-h-96 overflow-y-auto list-none m-0 p-0">
            {LANGUAGES.map((lang) => {
              const isSelected = language === lang.code
              return (
                <li key={lang.code}>
                  <button
                    onClick={() => { handleLanguageSelect(lang.code); setIsOpen(false); }}
                    className={`flex justify-between items-center w-full px-4 py-3 cursor-pointer text-slate-200 hover:bg-slate-700 border-b border-slate-800/50 last:border-0 transition-colors ${
                      isSelected ? 'bg-slate-700 font-medium' : ''
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-base">{lang.flag}</span>
                      {lang.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{lang.shortLabel}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-700">
            <p className="text-xs text-slate-400">
              {t('current_language')}: <strong className="text-slate-100">{currentLangLabel}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
