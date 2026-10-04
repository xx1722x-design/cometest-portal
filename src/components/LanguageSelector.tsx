import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { LANGUAGES, type Language } from '../i18n/languages'

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { t, i18n } = useTranslation()

  // FIX: Ensure currentLangLabel correctly reflects the active language state
  const currentLanguage = LANGUAGES.find((l) => l.code === i18n.language)
  const currentLangLabel = currentLanguage?.code?.toUpperCase() || 'EN'

  const handleLanguageSelect = (code: Language) => {
    void i18n.changeLanguage(code)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      {/* Night Punk Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-100 bg-[#0B0F19] border border-indigo-500/30 rounded-xl hover:border-indigo-500/80 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-300"
      >
        <Globe className="w-4 h-4" />
        {currentLangLabel}
      </button>

      {/* Night Punk Dropdown (Fog-Free, Solid Background) */}
      {isOpen && (
        <div className="absolute top-full ltr:right-0 rtl:left-0 mt-3 w-56 bg-[#0B0F19] border border-indigo-500/20 rounded-xl shadow-2xl z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-indigo-500/10">
            <h3 className="text-sm font-bold text-indigo-200">{t('select_language')}</h3>
            <p className="text-xs text-slate-400 mt-1">{t('languages_available', { count: LANGUAGES.length })}</p>
          </div>

          {/* Language List - Strict Vertical (flex-col) */}
          <ul className="flex flex-col max-h-96 overflow-y-auto list-none m-0 p-0">
            {LANGUAGES.map((lang) => {
              const isSelected = i18n.language === lang.code
              return (
                <li key={lang.code}>
                  <button
                    onClick={() => { handleLanguageSelect(lang.code); setIsOpen(false); }}
                    className={`flex justify-between items-center w-full px-4 py-3.5 cursor-pointer transition-all duration-200 border-b border-slate-800/60 last:border-0 ${
                      isSelected
                        ? 'bg-indigo-600/10 border-l-2 border-l-indigo-400 text-indigo-100 font-medium'
                        : 'text-slate-300 hover:bg-indigo-600/20'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-base">{lang.flag}</span>
                      {lang.name}
                    </span>
                    <span className="text-xs font-semibold text-indigo-400">{lang.code.toUpperCase()}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-indigo-500/10">
            <p className="text-xs text-slate-400">
              {t('current_language')}: <strong className="text-indigo-200">{currentLangLabel}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
