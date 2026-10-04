import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/languages';
import { Globe } from 'lucide-react';

const COUNTRY_CODES: Record<string, string> = {
  en: 'US', fr: 'FR', es: 'ES', de: 'DE', ru: 'RU', ar: 'SA', zh: 'CN', 'zh-TW': 'TW', ja: 'JP', ko: 'KR',
};

export function FreshLangMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const [isDark, setIsDark] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const obs = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (buttonRef.current && !isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = () => setIsOpen(false);
    const timer = setTimeout(() => {
      window.addEventListener('click', handleOutside);
    }, 150);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleOutside);
    };
  }, [isOpen]);

  const currentCode = COUNTRY_CODES[i18n.language] || 'EN';

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border ${
          isDark
            ? 'text-slate-200 bg-slate-800/40 border-slate-700 hover:bg-slate-700/60'
            : 'text-slate-900 bg-slate-100 border-slate-300 hover:bg-slate-200'
        }`}
      >
        <Globe size={16} />
        {currentCode}
      </button>

      {isOpen && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div
          onClick={(e) => e.stopPropagation()}
          className={`fixed z-[999999] w-64 rounded-xl border shadow-2xl overflow-hidden ${
            isDark ? 'bg-[#121826] text-slate-100 border-slate-800' : 'bg-white text-slate-900 border-slate-200'
          }`}
          style={{ top: `${position.top}px`, right: `${position.right}px` }}
        >
          <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
            <div className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Select Language
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              10 languages available
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {LANGUAGES.map((lang) => {
              const isSelected = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 my-0.5 rounded-lg text-sm cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-purple-600/20 text-purple-300 font-bold'
                        : 'bg-purple-50 text-purple-700 font-bold'
                      : isDark
                        ? 'hover:bg-slate-800/60'
                        : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold">{COUNTRY_CODES[lang.code] || lang.code.toUpperCase()}</span>
                    <span>{lang.label}</span>
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
