import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/languages';
import { Globe, Check } from 'lucide-react';

export function FreshLangMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { i18n } = useTranslation();

  // Monitor dark mode changes
  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  // Handle outside clicks
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language);
  const currentCode = currentLang?.shortLabel || 'EN';

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border ${
          isDarkMode
            ? 'text-slate-200 bg-slate-800/40 border-slate-700 hover:bg-slate-700/60 active:bg-slate-700'
            : 'text-slate-900 bg-slate-100 border-slate-300 hover:bg-slate-200 active:bg-slate-300'
        }`}
      >
        <Globe size={16} />
        <span>{currentCode}</span>
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            className={`fixed z-50 w-64 rounded-lg border shadow-2xl overflow-hidden transition-opacity duration-150 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-700'
                : 'bg-white border-slate-200'
            }`}
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              pointerEvents: 'auto',
            }}
          >
            {/* Header */}
            <div
              className={`px-4 py-3 border-b ${
                isDarkMode
                  ? 'border-slate-700 bg-slate-800/50'
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

            {/* Language List */}
            <div className="max-h-80 overflow-y-auto">
              {LANGUAGES.map((lang) => {
                const isSelected = i18n.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void i18n.changeLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between border-b last:border-0 transition-colors duration-100 ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-purple-600/20 text-purple-300 font-bold'
                          : 'bg-purple-100 text-purple-700 font-bold'
                        : isDarkMode
                          ? 'text-slate-200 hover:bg-slate-800/60'
                          : 'text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold">{lang.shortLabel}</span>
                      <span>{lang.name}</span>
                    </div>
                    {isSelected && <Check size={16} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />}
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
