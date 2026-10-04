import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../i18n/languages'
import { Globe, Check } from 'lucide-react'

export function FreshLangMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, right: 0 })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      })
    }
  }

  const handleOpen = () => {
    console.log('[Lang] CLICKED!')
    alert('[Lang Button Clicked!] If you see this alert, the button is working!')
    updatePosition()
    setIsOpen(prev => !prev)
  }

  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language)
  const currentCode = currentLang?.shortLabel || 'EN'

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors border ${
          isDarkMode
            ? 'text-slate-200 bg-[#0f172a] border-slate-700 hover:bg-slate-800'
            : 'text-slate-900 bg-white border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Globe size={16} />
        {currentCode}
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div
            className={`fixed z-[99999] w-56 rounded-lg border shadow-2xl overflow-hidden ${
              isDarkMode
                ? 'bg-[#0f172a] border-slate-700'
                : 'bg-white border-slate-200'
            }`}
            style={{
              top: `${coords.top}px`,
              right: `${coords.right}px`,
              backdropFilter: 'none',
              WebkitMaskImage: 'none',
              maskImage: 'none',
            }}
          >
            <div
              className={`px-4 py-3 border-b ${
                isDarkMode
                  ? 'border-slate-700 bg-slate-900/50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                Select Language
              </div>
              <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                10 languages available
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    void i18n.changeLanguage(lang.code)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between border-b last:border-0 transition-colors ${
                    i18n.language === lang.code
                      ? isDarkMode
                        ? 'bg-purple-600/20 text-purple-300 font-bold'
                        : 'bg-purple-50 text-purple-700 font-bold'
                      : isDarkMode
                        ? 'text-slate-200 hover:bg-slate-800/60'
                        : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold">{lang.shortLabel}</span>
                    <span>{lang.name}</span>
                  </div>
                  {i18n.language === lang.code && <Check size={16} className="text-purple-600" />}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
