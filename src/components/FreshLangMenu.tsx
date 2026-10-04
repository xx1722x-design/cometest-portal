import React, { useState, useRef } from 'react';
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { i18n } = useTranslation();
  const currentCode = COUNTRY_CODES[i18n.language] || 'EN';

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setIsOpen(!isOpen);
  };

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
          {/* Failproof Invisible Overlay for Outside Clicks */}
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

          {/* Actual Dropdown Menu */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: `${pos.top}px`,
              right: `${pos.right}px`,
              zIndex: 9999999,
              width: '256px',
              borderRadius: '0.5rem',
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              backdropFilter: 'none',
              WebkitMaskImage: 'none',
              maskImage: 'none',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: isDark ? '#f1f5f9' : '#0f172a' }}>
                Select Language
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px', color: isDark ? '#94a3b8' : '#64748b' }}>
                10 languages available
              </div>
            </div>

            {/* Language List */}
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
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      margin: '2px 0',
                      borderRadius: '0.5rem',
                      fontSize: '14px',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: isSelected
                        ? isDark ? '#5b21b6' : '#ede9fe'
                        : 'transparent',
                      color: isSelected
                        ? isDark ? '#e9d5ff' : '#6b21a8'
                        : isDark ? '#cbd5e1' : '#334155',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      transition: 'background-color 0.1s',
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
