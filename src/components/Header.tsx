import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from './LanguageSelector'

interface HeaderProps {
  isDarkMode?: boolean
  onToggleDarkMode?: () => void
}

export function Header({ isDarkMode = true, onToggleDarkMode }: HeaderProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  // 활성 탭은 현재 URL 기준 (헤더는 페이지마다 다시 마운트되므로 로컬 state로는 유지되지 않음)
  const { pathname } = useLocation()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Search:', searchQuery)
  }

  const handleCategoryClick = (path: string) => {
    navigate(path)
  }

  const categories = [
    { key: 'home', i18nKey: 'home', path: '/' },
    { key: 'measurement', i18nKey: 'measurement', path: '/category/measurement' },
    { key: 'force_motion', i18nKey: 'force_motion', path: '/category/force_motion' },
    { key: 'light_wave', i18nKey: 'light_wave', path: '/category/light_wave' },
    { key: 'electricity', i18nKey: 'electricity', path: '/category/electricity' },
    { key: 'energy', i18nKey: 'energy', path: '/category/energy' },
    { key: 'chemistry', i18nKey: 'chemistry', path: '/category/chemistry' },
    { key: 'earth', i18nKey: 'earth', path: '/category/earth' },
    { key: 'astronomy', i18nKey: 'astronomy', path: '/category/astronomy' },
    { key: 'biology', i18nKey: 'biology', path: '/category/biology' },
    { key: 'mathematics', i18nKey: 'mathematics', path: '/category/mathematics' },
    { key: 'technology', i18nKey: 'technology', path: '/category/technology' },
    { key: 'others', i18nKey: 'others', path: '/category/others' },
    { key: 'web_games', i18nKey: 'web_games', path: '/game' },
  ]

  const darkHeaderBg = 'rgba(12,12,22,0.72)'
  const lightHeaderBg = 'rgba(255,255,255,0.82)'
  const currentHeaderBg = isDarkMode ? darkHeaderBg : lightHeaderBg
  const currentHeaderBorder = isDarkMode ? 'rgba(255,255,255,0.08)' : '#e0e0e0'
  const currentHeaderShadow = isDarkMode ? '0 8px 30px -12px rgba(0,0,0,0.7)' : '0 2px 8px rgba(0,0,0,0.08)'

  return (
    <header
      style={{
        backgroundColor: currentHeaderBg,
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        boxShadow: currentHeaderShadow,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: `1px solid ${currentHeaderBorder}`,
        transition: 'all 0.3s ease',
      }}
    >
      {/* 상단 로고 & 검색 영역 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 2rem',
          maxWidth: '100%',
          margin: '0 auto',
        }}
      >
        {/* 로고 & 사이트명 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            minWidth: '200px',
          }}
          onClick={() => navigate('/')}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#7c3aed',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '20px',
            }}
          >
            📚
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '600',
                color: isDarkMode ? '#ffffff' : '#1a1a1a',
                transition: 'color 0.3s',
              }}
            >
              {t('site_name')}
            </h1>
            <span
              style={{
                fontSize: '11px',
                color: isDarkMode ? '#888888' : '#999999',
                transition: 'color 0.3s',
              }}
            >
              {t('site_subtitle')}
            </span>
          </div>
        </div>

        {/* 검색창 */}
        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            gap: '0.5rem',
            flex: 1,
            maxWidth: '400px',
            margin: '0 2rem',
          }}
        >
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: isDarkMode ? '1px solid #444444' : '1px solid #d0d0d0',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'inherit',
              backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
              color: isDarkMode ? '#ffffff' : '#1a1a1a',
              transition: 'all 0.3s',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#8b4ef8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#7c3aed'
            }}
          >
            {t('search_button')}
          </button>
        </form>

        {/* 다크모드 토글 + 언어 선택 */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* 다크모드 토글 */}
          <button
            onClick={onToggleDarkMode}
            style={{
              padding: '0.6rem',
              backgroundColor: 'transparent',
              border: isDarkMode ? '1px solid #444444' : '1px solid #d0d0d0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '18px',
              transition: 'all 0.2s',
              color: isDarkMode ? '#ffffff' : '#1a1a1a',
            }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7c3aed'
              e.currentTarget.style.color = '#7c3aed'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDarkMode ? '#444444' : '#d0d0d0'
              e.currentTarget.style.color = isDarkMode ? '#ffffff' : '#1a1a1a'
            }}
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>

          {/* 언어 선택 드롭다운 (store.cometest.com 과 동일 컴포넌트) */}
          <LanguageSelector />
        </div>
      </div>

      {/* 하단 네비게이션 메뉴 (스크롤 가능) */}
      <nav
        style={{
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.025)' : '#f9f9f9',
          borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e0e0e0',
          padding: '0 2rem',
          overflowX: 'auto',
          overflowY: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            maxWidth: '100%',
            margin: '0 auto',
            whiteSpace: 'nowrap',
            minWidth: 'min-content',
          }}
        >
          {categories.map((cat) => (
            <a
              key={cat.key}
              href={cat.path}
              className={`nav-tab${isDarkMode ? '' : ' nav-tab--light'}${pathname === cat.path ? ' is-active' : ''}`}
              aria-current={pathname === cat.path ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault()
                handleCategoryClick(cat.path)
              }}
            >
              {t(cat.i18nKey)}
            </a>
          ))}
        </div>
      </nav>
    </header>
  )
}
