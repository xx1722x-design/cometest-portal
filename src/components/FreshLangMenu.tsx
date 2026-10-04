import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/languages';
import { Globe } from 'lucide-react';

const COUNTRY_CODES: Record<string, string> = {
  en: 'US', fr: 'FR', es: 'ES', de: 'DE', ru: 'RU', ar: 'SA', zh: 'CN', 'zh-TW': 'TW', ja: 'JP', ko: 'KR',
};

export function FreshLangMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const [isDark, setIsDark] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { i18n } = useTranslation();

  // Real-time Dark Mode detection
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDark();
    const obs = new MutationObserver(checkDark);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setIsOpen(!isOpen);
  };

  const currentCode = COUNTRY_CODES[i18n.language] || 'EN';

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border transition-all ${
          isDark
            ? 'text-slate-200 bg-slate-800/40 border-slate-700 hover:bg-slate-700/60'
            : 'text-slate-900 bg-slate-100 border-slate-300 hover:bg-slate-200'
        }`}
      >
        <Globe size={16} />
        {currentCode}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 9999998,
              backgroundColor: 'transparent',
              cursor: 'default',
            }}
          />

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: `${pos.top}px`,
              right: `${pos.right}px`,
              zIndex: 9999999,
              width: '256px',
              borderRadius: '0.5rem',
              border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              boxShadow: isDark
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              backdropFilter: 'none',
              WebkitMaskImage: 'none',
              maskImage: 'none',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                backgroundColor: isDark ? '#1a2332' : '#f9fafb',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDark ? '#e2e8f0' : '#1f2937',
                }}
              >
                Select Language
              </div>
              <div
                style={{
                  fontSize: '12px',
                  marginTop: '4px',
                  color: isDark ? '#94a3b8' : '#6b7280',
                }}
              >
                10 languages available
              </div>
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {LANGUAGES.map((lang) => {
                const isSelected = lang.code === i18n.language;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 my-0.5 rounded-lg text-sm cursor-pointer transition-colors ${
                      isSelected
                        ? isDark
                          ? 'bg-purple-600/30 text-purple-200 font-bold'
                          : 'bg-purple-100 text-purple-800 font-bold'
                        : isDark
                          ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                          : 'hover:bg-slate-100 text-slate-700 hover:text-black'
                    }`}
                  >
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>
                      {COUNTRY_CODES[lang.code] || lang.code.toUpperCase()}
                    </span>
                    <span>{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
