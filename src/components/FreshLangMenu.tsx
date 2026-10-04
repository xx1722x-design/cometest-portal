import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../i18n/languages'
import { Globe, Check } from 'lucide-react'

export function FreshLangMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, right: 0, left: 0 })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { i18n } = useTranslation()

  // 다크 모드(나이트 펑크) 실시간 감지
  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // 버튼 위치 계산
  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
        left: rect.left + window.scrollX,
      })
    }
  }

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition()
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  // 외부 클릭 시 닫기 (타이밍 문제 해결)
  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    // 클릭 이벤트 사용 (mousedown 대신)
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick, true)
    }, 0)

    return () => {
      document.removeEventListener('click', handleOutsideClick, true)
    }
  }, [isOpen])

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language)
  const currentCode = currentLang?.shortLabel || 'EN'
  const isRtl = currentLang?.dir === 'rtl'

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors border ${
          isDarkMode
            ? 'text-slate-200 bg-[#0f172a] border-slate-700 hover:bg-slate-800'
            : 'text-slate-900 bg-white border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Globe size={16} />
        {currentCode}
      </button>

      {/* React Portal Dropdown */}
      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            className={`fixed z-[99999] w-56 rounded-lg border shadow-2xl overflow-hidden ${
              isDarkMode
                ? 'bg-[#0f172a] border-slate-700'
                : 'bg-white border-slate-200'
            }`}
            style={{
              top: `${coords.top}px`,
              ...(isRtl ? { left: `${coords.left}px` } : { right: `${coords.right}px` }),
              backdropFilter: 'none',
              WebkitMaskImage: 'none' as any,
              maskImage: 'none',
            }}
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
          </div>,
          document.body
        )}
    </>
  )
}
