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

  // Bulletproof Omni-Detector for Dark Mode
  const detectTheme = (): boolean => {
    if (typeof document === 'undefined') return false;
    const html = document.documentElement;
    const body = document.body;
    return (
      html.classList.contains('dark') ||
      body.classList.contains('dark') ||
      html.getAttribute('data-theme') === 'dark' ||
      html.getAttribute('data-mode') === 'dark' ||
      (buttonRef.current !== null && buttonRef.current.closest('.dark') !== null)
    );
  };

  useEffect(() => {
    setIsDark(detectTheme());

    const obs = new MutationObserver(() => setIsDark(detectTheme()));
    if (typeof document !== 'undefined') {
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'data-mode'] });
      obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    return () => obs.disconnect();
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
      // Force re-check theme exactly when opening
      setIsDark(detectTheme());
    }
    setIsOpen(!isOpen);
  };

  const currentCode = COUNTRY_CODES[i18n.language] || 'EN';

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          fontSize: '14px',
          fontWeight: '600',
          borderRadius: '0.5rem',
          border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
          backgroundColor: isDark ? 'rgba(51, 65, 85, 0.4)' : '#f3f4f6',
          color: isDark ? '#e2e8f0' : '#111827',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark
            ? 'rgba(71, 85, 105, 0.6)'
            : '#e5e7eb';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark
            ? 'rgba(51, 65, 85, 0.4)'
            : '#f3f4f6';
        }}
      >
        <Globe size={16} />
        {currentCode}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <>
          {/* Invisible Overlay */}
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

          {/* Dropdown Menu */}
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
              display: 'flex',
              flexDirection: 'column',
              backdropFilter: 'none',
              WebkitMaskImage: 'none',
              maskImage: 'none',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                backgroundColor: isDark ? '#1a2332' : '#f9fafb',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDark ? '#e2e8f0' : '#1f2937',
                  margin: 0,
                  padding: 0,
                }}
              >
                Select Language
              </div>
              <div
                style={{
                  fontSize: '12px',
                  marginTop: '4px',
                  color: isDark ? '#94a3b8' : '#6b7280',
                  margin: 0,
                  padding: 0,
                }}
              >
                10 languages available
              </div>
            </div>

            {/* Language List */}
            <div
              style={{
                maxHeight: '320px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
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
                        ? isDark
                          ? 'rgba(147, 51, 234, 0.2)'
                          : '#f3e8ff'
                        : 'transparent',
                      color: isSelected
                        ? isDark
                          ? '#d8b4fe'
                          : '#7e22ce'
                        : isDark
                          ? '#cbd5e1'
                          : '#374151',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      transition: 'background-color 0.2s',
                      width: '100%',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark
                          ? '#1e293b'
                          : '#f1f5f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        minWidth: '28px',
                      }}
                    >
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
