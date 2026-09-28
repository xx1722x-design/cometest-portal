import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from './LanguageSelector'
import { useDarkMode } from '../theme'

const CATEGORIES = [
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
  const [menuOpen, setMenuOpen] = useState(false)

  // 페이지 이동 시 모바일 메뉴 닫기
  useEffect(() => setMenuOpen(false), [pathname])

  // Esc 로 모바일 메뉴 닫기
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Search:', searchQuery)
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

        <form className="site-search" role="search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder={t('search_placeholder')}
            aria-label={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">{t('search_button')}</button>
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

          {/* 언어 선택 드롭다운 (store.cometest.com 과 동일 컴포넌트) */}
          <LanguageSelector />

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
