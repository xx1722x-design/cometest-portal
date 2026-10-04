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
      {/* FC Barcelona Style: Compact Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-100 bg-transparent border border-slate-600 rounded hover:bg-slate-800/50 transition-colors"
      >
        <Globe className="w-4 h-4" />
        {currentLangLabel}
      </button>

      {/* FC Barcelona Style: Compact Dropdown (NO BULLETS, Clean) */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-slate-300 rounded shadow-lg z-50">
          <ul className="list-none m-0 p-0 divide-y divide-slate-200">
            {LANGUAGES.map((lang) => (
              <li key={lang.code} className="list-none m-0 p-0">
                <button
                  onClick={() => { handleLanguageSelect(lang.code); setIsOpen(false); }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 transition-colors font-medium"
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
