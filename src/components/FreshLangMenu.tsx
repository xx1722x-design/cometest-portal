import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../i18n/languages'
import { Globe, Check } from 'lucide-react'

export function FreshLangMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { i18n } = useTranslation()

  // 다크 모드 감지
  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language)
  const currentCode = currentLang?.shortLabel || 'EN'

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors border ${
          isDarkMode
            ? 'text-slate-200 bg-[#0f172a] border-slate-700 hover:bg-slate-800'
            : 'text-slate-900 bg-white border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Globe size={16} />
        {currentCode}
      </button>

      {/* Dropdown Menu - Inline Rendering */}
      {isOpen && (
        <div
          className={`absolute top-full right-0 mt-2 w-56 rounded-lg border shadow-2xl overflow-hidden z-50 ${
            isDarkMode
              ? 'bg-[#0f172a] border-slate-700'
              : 'bg-white border-slate-200'
          }`}
        >
          {/* Header Section */}
          <div
            className={`px-4 py-3 border-b ${
              isDarkMode
                ? 'border-slate-700 bg-slate-900/50'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div
              className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}
            >
              Select Language
            </div>
            <div
              className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              10 languages available
            </div>
          </div>

          {/* Languages List */}
          <div className="max-h-96 overflow-y-auto">
            {LANGUAGES.map((lang) => {
              const isSelected = i18n.language === lang.code

              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    void i18n.changeLanguage(lang.code)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors border-b last:border-0 ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-purple-600/20 text-purple-300 font-bold border-purple-500/30'
                        : 'bg-purple-50 text-purple-700 font-bold border-purple-200/50'
                      : isDarkMode
                        ? 'text-slate-200 hover:bg-slate-800/60 border-slate-700/50'
                        : 'text-slate-800 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold">{lang.shortLabel}</span>
                    <span>{lang.name}</span>
                  </div>
                  {isSelected && <Check size={16} className="text-purple-600" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
