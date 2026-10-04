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
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Button - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-200 bg-[#0f172a] border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
      >
        <Globe size={16} />
        {currentCode}
      </button>

      {/* Dropdown - ONLY visible when isOpen is true */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-[#0f172a] border border-slate-700 rounded-md shadow-2xl z-[99999]">
          <div className="flex flex-col">
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
        </div>
      )}
    </div>
  )
}
