import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { SiteFooter } from '../components/SiteFooter'
import { CuratedGrid } from '../components/CuratedGrid'
import { GAMES_DATA } from '../config/gamesData'
import { SIMULATIONS_DATA } from '../config/simulationsData'
import { curateItems, type ContentItemUnion } from '../lib/curatedList'

const CATEGORY_FILTERS = [
  { id: 'all', icon: '🎮' },
  { id: 'web_games', icon: '🕹️' },
  { id: 'space_universe', icon: '🌌' },
  { id: 'physics_chemistry', icon: '🧪' },
  { id: 'optics_waves', icon: '💡' },
  { id: 'puzzle', icon: '🧩' },
]

export function Index() {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('all')

  // 게임과 시뮬레이션 통합
  const allItems: ContentItemUnion[] = useMemo(() => {
    const games = GAMES_DATA.map(g => ({
      ...g,
      category: g.category === 'web_games' ? 'web_games' : g.category,
    })) as any
    const sims = SIMULATIONS_DATA

    return [...games, ...sims]
  }, [])

  // 필터링된 아이템
  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') {
      return curateItems(allItems)
    }
    return curateItems(allItems.filter(item => item.category === activeCategory))
  }, [activeCategory, allItems])

  return (
    <div
      className="portal-bg"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header />

      {/* Sticky Category Filter Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(var(--bg-rgb), 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 20px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            maxWidth: '1600px',
            margin: '0 auto',
            paddingBottom: '8px',
          }}
        >
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor:
                  activeCategory === cat.id
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(100, 181, 246, 0.1)',
                color: activeCategory === cat.id ? '#fff' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeCategory === cat.id ? '600' : '500',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== cat.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(100, 181, 246, 0.2)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== cat.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(100, 181, 246, 0.1)'
                }
              }}
            >
              <span>{cat.icon}</span>
              {t(cat.id)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <main style={{ flex: 1, padding: '0 20px' }}>
        {filteredItems.length > 0 ? (
          <CuratedGrid items={filteredItems} columns={6} />
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h2>{t('search_no_results') || 'No items found'}</h2>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
