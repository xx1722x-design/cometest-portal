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
      {/* FC Barcelona Style Button: Compact, showing current lang code */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-200 bg-[#0f172a] border border-slate-700 rounded hover:bg-slate-800 transition-colors"
      >
        <Globe className="w-4 h-4" />
        {currentLangLabel}
      </button>

      {/* FC Barcelona Style Dropdown: Compact width (w-48), positioned right, NO bullets */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded shadow-lg z-50">
          {/* ⚠️ EXACTLY THIS: list-none completely removes the bullets */}
          <ul className="flex flex-col list-none m-0 p-0 max-h-96 overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <li key={lang.code} className="m-0 p-0">
                <button
                  onClick={() => { handleLanguageSelect(lang.code); setIsOpen(false); }}
                  className="block w-full px-4 py-3 text-[14px] cursor-pointer text-slate-200 hover:bg-slate-800 hover:text-white border-b border-slate-800/50 last:border-0 transition-colors text-left"
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
