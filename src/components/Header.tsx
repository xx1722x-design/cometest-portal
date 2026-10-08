import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FreshLangMenu } from './FreshLangMenu'
import { useDarkMode } from '../theme'
import { searchPortal, type SearchItem } from '../config/searchData'

const CATEGORIES = [
  { key: 'home', i18nKey: 'home', path: '/' },
  { key: 'measurement', i18nKey: 'measurement', path: '/category/measurement' },
  { key: 'force_motion', i18nKey: 'force_motion', path: '/category/force_motion' },
  { key: 'light_wave', i18nKey: 'light_wave', path: '/optics' },
  { key: 'electricity', i18nKey: 'electricity', path: '/category/electricity' },
  { key: 'energy', i18nKey: 'energy', path: '/category/energy' },
  { key: 'chemistry', i18nKey: 'chemistry', path: '/chemistry' },
  { key: 'earth', i18nKey: 'earth', path: '/category/earth' },
  { key: 'astronomy', i18nKey: 'astronomy', path: '/category/astronomy' },
  { key: 'biology', i18nKey: 'biology', path: '/category/biology' },
  { key: 'mathematics', i18nKey: 'mathematics', path: '/category/mathematics' },
  { key: 'technology', i18nKey: 'technology', path: '/category/technology' },
  { key: 'others', i18nKey: 'others', path: '/category/others' },
  { key: 'web_games', i18nKey: 'web_games', path: '/game' },
  { key: 'puzzle', i18nKey: 'puzzle', path: '/puzzle' },
]

// 반응형 헤더. 색은 모두 테마 CSS 변수, 배치는 src/styles/portal.css 의 .site-header 참고.
//  - 데스크톱: 로고 | 검색 | 테마·언어, 아래 탭 바 (넘치면 가로 스크롤 대신 줄바꿈)
//  - ≤900px: 탭 바 대신 메뉴 버튼 → 카테고리 패널(그리드)
//  - ≤760px: 검색창은 둘째 줄 전체 폭
export function Header() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [isDarkMode, toggleDarkMode] = useDarkMode()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchItem[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 페이지 이동 시 모바일 메뉴 닫기
  useEffect(() => setMenuOpen(false), [pathname])

  // 실시간 검색
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchPortal(searchQuery)
      setSearchResults(results)
      setShowDropdown(true)
    } else {
      setSearchResults([])
      setShowDropdown(false)
    }
  }, [searchQuery])

  // Esc 로 드롭다운/메뉴 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false)
        setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        searchInputRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', onClickOutside)
      return () => document.removeEventListener('mousedown', onClickOutside)
    }
  }, [showDropdown])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchResults.length > 0) {
      handleSelectResult(searchResults[0])
    }
  }

  const handleSelectResult = (result: SearchItem) => {
    navigate(result.path)
    setSearchQuery('')
    setShowDropdown(false)
  }

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault()
            navigate('/')
          }}
        >
          <span className="brand__mark" aria-hidden="true">📚</span>
          <span className="brand__text">
            <span className="brand__name">{t('site_name')}</span>
            <span className="brand__sub">{t('site_subtitle')}</span>
          </span>
        </a>

        <form className="site-search" role="search" onSubmit={handleSearch} style={{ position: 'relative' }}>
          <input
            ref={searchInputRef}
            type="search"
            placeholder={t('search_placeholder')}
            aria-label={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          <button type="submit">{t('search_button')}</button>

          {/* 검색 결과 드롭다운 */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="search-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                border: `1px solid ${isDarkMode ? '#333333' : '#e0e0e0'}`,
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              {searchResults.length > 0 ? (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {searchResults.map((result) => (
                    <li
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: `1px solid ${isDarkMode ? '#2a2a2a' : '#f0f0f0'}`,
                        transition: 'background-color 0.2s',
                        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#1a1a1a',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#2a2a2a' : '#f5f5f5'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '18px' }}>{result.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>{result.title}</div>
                          {result.description && (
                            <div
                              style={{
                                fontSize: '12px',
                                opacity: 0.7,
                                marginTop: '4px',
                              }}
                            >
                              {result.description}
                            </div>
                          )}
                          <div
                            style={{
                              fontSize: '11px',
                              opacity: 0.5,
                              marginTop: '4px',
                              color: isDarkMode ? '#888' : '#666',
                            }}
                          >
                            {result.type === 'category' ? '📂 카테고리' : '🎮 시뮬레이션'}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: isDarkMode ? '#888' : '#666',
                  }}
                >
                  {t('search_no_results') || '검색 결과가 없습니다'}
                </div>
              )}
            </div>
          )}
        </form>

        <div className="site-header__actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleDarkMode}
            title={isDarkMode ? t('theme_to_light') : t('theme_to_dark')}
            aria-label={isDarkMode ? t('theme_to_light') : t('theme_to_dark')}
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>

          {/* 언어 선택 드롭다운 */}
          <FreshLangMenu />

          <button
            type="button"
            className="icon-btn menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            aria-label={t('menu_toggle')}
          >
            <span className={`menu-btn__icon${menuOpen ? ' is-open' : ''}`} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <nav id="site-nav" className={`site-nav${menuOpen ? ' is-open' : ''}`} aria-label={t('menu_toggle')}>
        <div className="site-nav__list">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.key}
              href={cat.path}
              className={`nav-tab${pathname === cat.path ? ' is-active' : ''}`}
              aria-current={pathname === cat.path ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault()
                navigate(cat.path)
                setMenuOpen(false)
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
