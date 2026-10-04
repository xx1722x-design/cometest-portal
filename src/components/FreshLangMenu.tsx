import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, type Language } from '../i18n/languages'
import { Globe } from 'lucide-react'

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
    <div className="relative inline-block text-left z-[99999]">
      {/* Button: Stays perfectly in place, never moves */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-200 bg-[#0f172a] border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
      >
        <Globe size={16} />
        {currentCode}
      </button>

      {/* Dropdown Menu: 100% absolute positioning, completely out of document flow */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[#0f172a] border border-slate-700 rounded-md shadow-2xl z-[99999]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="block w-full px-4 py-3 text-[14px] cursor-pointer text-slate-200 bg-[#0f172a] hover:bg-slate-800 transition-colors text-left border-b border-slate-800/50 last:border-0"
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
