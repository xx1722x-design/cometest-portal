import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, type Language } from '../i18n/languages'
import { Globe } from 'lucide-react'

const COUNTRY_CODES: Record<string, string> = {
  en: 'US',
  fr: 'FR',
  es: 'ES',
  de: 'DE',
  ru: 'RU',
  ar: 'SA',
  zh: 'CN',
  'zh-TW': 'TW',
  ja: 'JP',
  ko: 'KR',
  it: 'IT',
  pt: 'PT',
}

export function FreshLangMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, right: 0, left: 0, width: 0 })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { i18n } = useTranslation()

  // 다크 모드(나이트 펑크) 상태 실시간 감지
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // 버튼 위치 계산 (getBoundingClientRect)
  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }

  const handleToggle = () => {
    if (!isOpen) {
      updateCoords()
    }
    setIsOpen(!isOpen)
  }

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const currentLanguage = LANGUAGES.find((l) => l.code === i18n.language)
  const currentCode = currentLanguage
    ? COUNTRY_CODES[currentLanguage.code] || currentLanguage.code.toUpperCase()
    : 'EN'

  const handleLanguageChange = (code: Language) => {
    void i18n.changeLanguage(code)
    setIsOpen(false)
  }

  const isRtl = i18n.language === 'ar'

  // 테마별 스타일 분기 (나이트 펑크 vs 화이트 펑크)
  const dropdownStyles = isDarkMode
    ? 'bg-[#0f172a] text-slate-200 border-slate-700 shadow-2xl'
    : 'bg-white text-slate-900 border-slate-200 shadow-xl'

  const itemHoverStyles = isDarkMode
    ? 'hover:bg-slate-800 border-slate-800/50'
    : 'hover:bg-slate-100 border-slate-100'

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onMouseEnter={() => {
          updateCoords()
          setIsOpen(true)
        }}
        onMouseLeave={() => setIsOpen(false)}
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
            onMouseLeave={() => setIsOpen(false)}
            className={`fixed z-[99999] w-48 rounded-md border overflow-hidden ${dropdownStyles}`}
            style={{
              top: `${coords.top}px`,
              ...(isRtl ? { left: `${coords.left}px` } : { right: `${coords.right}px` }),
              backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
              backdropFilter: 'none',
              WebkitMaskImage: 'none',
              maskImage: 'none',
            }}
          >
            {LANGUAGES.map((lang) => {
              const countryCode = COUNTRY_CODES[lang.code] || lang.code.toUpperCase()
              const isSelected = i18n.language === lang.code
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex items-center justify-between px-4 py-3 text-[14px] cursor-pointer transition-colors border-b last:border-0 ${itemHoverStyles} ${
                    isSelected ? (isDarkMode ? 'bg-slate-800/80 font-bold' : 'bg-slate-100 font-bold') : ''
                  }`}
                >
                  <span>{lang.name}</span>
                  <span className="text-xs font-bold">{countryCode}</span>
                  {isSelected && <span>✓</span>}
                </button>
              )
            })}
          </div>,
          document.body
        )}
    </>
  )
}
