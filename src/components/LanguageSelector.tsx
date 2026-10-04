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
    <div className="relative inline-block">
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-200 bg-[#0f172a] border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
      >
        <Globe className="w-4 h-4" />
        {currentLangLabel}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-md shadow-lg z-50">
          <ul
            className="m-0 p-0"
            style={{ listStyle: 'none', margin: 0, padding: 0 }}
          >
            {LANGUAGES.map((lang) => (
              <li
                key={lang.code}
                style={{ listStyle: 'none', margin: 0, padding: 0 }}
              >
                <button
                  onClick={() => { handleLanguageSelect(lang.code); setIsOpen(false); }}
                  className="block w-full px-4 py-3 text-[14px] cursor-pointer text-slate-200 hover:bg-slate-800 transition-colors text-left border-b border-slate-800/50 last:border-0"
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
