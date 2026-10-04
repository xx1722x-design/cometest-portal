import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, type Language } from '../i18n/languages'

export function FreshLangMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { i18n } = useTranslation()

  const currentLanguage = LANGUAGES.find((l) => l.code === i18n.language)
  const currentCode = currentLanguage?.code?.toUpperCase() || 'EN'

  const handleLanguageSelect = (code: Language) => {
    void i18n.changeLanguage(code)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800"
      >
        {currentCode}
      </button>

      {isOpen && (
        <ul className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded shadow-lg z-50 list-none p-0 m-0">
          {LANGUAGES.map((lang) => (
            <li key={lang.code} className="m-0 p-0">
              <button
                onClick={() => handleLanguageSelect(lang.code)}
                className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 border-b border-slate-800 last:border-0"
              >
                {lang.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
