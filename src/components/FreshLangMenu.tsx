import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/languages';
import { Globe } from 'lucide-react';

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
};

export function FreshLangMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isDark, setIsDark] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { i18n } = useTranslation();

  // Dark mode detection
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Calculate menu position based on button
  const calculatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  };

  // Handle button click
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    calculatePosition();
    setIsOpen(!isOpen);
  };

  // Outside click listener with delayed attachment
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        const target = e.target as Node;
        if (buttonRef.current && !buttonRef.current.contains(target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleOutsideClick);

      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  // Close menu on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const currentCode = COUNTRY_CODES[i18n.language] || 'EN';

  return (
    <>
      {/* Trigger Button - Inside Header */}
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border transition-all duration-200 ${
          isDark
            ? 'text-slate-200 bg-slate-800/40 border-slate-700 hover:bg-slate-700/60'
            : 'text-slate-900 bg-slate-100 border-slate-300 hover:bg-slate-200'
        }`}
      >
        <Globe size={16} />
        <span>{currentCode}</span>
      </button>

      {/* Dropdown Menu - Portal to Body */}
      {isOpen &&
        typeof document !== 'undefined' &&
        ReactDOM.createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            className={`fixed z-[9999] w-64 rounded-lg border shadow-2xl overflow-hidden`}
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
              backdropFilter: 'none',
              WebkitMaskImage: 'none',
              maskImage: 'none',
            }}
          >
            {/* Header Section */}
            <div
              style={{
                borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
              }}
              className="px-4 py-3 border-b"
            >
              <div
                style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
                className="text-sm font-bold"
              >
                Select Language
              </div>
              <div
                style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                className="text-xs mt-1"
              >
                10 languages available
              </div>
            </div>

            {/* Language List */}
            <div className="max-h-80 overflow-y-auto">
              {LANGUAGES.map((lang) => {
                const isSelected = i18n.language === lang.code;
                const countryCode = COUNTRY_CODES[lang.code] || lang.code.toUpperCase();

                return (
                  <button
                    key={lang.code}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void i18n.changeLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 border-b last:border-0 flex items-center justify-between"
                    style={{
                      backgroundColor: isSelected
                        ? isDark
                          ? '#5b21b6'
                          : '#ede9fe'
                        : 'transparent',
                      color: isSelected
                        ? isDark
                          ? '#e9d5ff'
                          : '#6b21a8'
                        : isDark
                          ? '#cbd5e1'
                          : '#334155',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark
                          ? 'rgba(30, 41, 59, 0.6)'
                          : '#f1f5f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold">{countryCode}</span>
                      <span>{lang.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
