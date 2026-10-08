import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { SiteFooter } from '../components/SiteFooter'
import { CuratedGrid } from '../components/CuratedGrid'
import { GAMES_DATA } from '../config/gamesData'
import { SIMULATIONS_DATA } from '../config/simulationsData'
import { type ContentItemUnion } from '../lib/curatedList'
import { PRIMARY_CATEGORIES, SECONDARY_CATEGORIES } from '../data/gameCategories'

export function Index() {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeSecondaryCategory, setActiveSecondaryCategory] = useState<string | null>(null)

  // 게임과 시뮬레이션 통합 - 최신 항목이 맨 앞에 오도록 배치
  const allItems: ContentItemUnion[] = useMemo(() => {
    const games = GAMES_DATA.map(g => ({
      ...g,
      category: g.category === 'web_games' ? 'web_games' : g.category,
    })) as any
    const sims = SIMULATIONS_DATA

    // 🔥 CRITICAL: Newest sim GUARANTEED at [0], then interleave
    // Order: [sims[0], games[0], sims[1], games[1], sims[2], games[2], ...]
    // This ensures EVERY new sim is immediately visible after Premium Store
    // CuratedGrid adds STORE at [0], so: STORE | Physics Blocks | Platformer | Ocean | Shooter | ...
    const merged = []
    const maxLen = Math.max(games.length, sims.length)
    for (let i = 0; i < maxLen; i++) {
      if (i < sims.length) merged.push(sims[i])
      if (i < games.length) merged.push(games[i])
    }
    return merged
  }, [])

  // 필터링된 아이템 - raw data를 필터링 없이 직접 렌더링
  const filteredItems = useMemo(() => {
    // Secondary category 선택 시 우선 처리
    if (activeSecondaryCategory) {
      return allItems.filter(item => item.occultTheme === activeSecondaryCategory)
    }

    if (activeCategory === 'all') {
      return allItems
    }
    return allItems.filter(item => item.category === activeCategory)
  }, [activeCategory, activeSecondaryCategory, allItems])

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

      {/* Sticky Occult Sub-Themes Filter Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(var(--bg-rgb), 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '0',
          marginBottom: '20px',
          overflow: 'hidden',
        }}
      >
        {/* Secondary Categories Row - Occult Themes */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollBehavior: 'smooth',
            padding: '16px 20px 16px 20px',
            minWidth: 'max-content',
            // Hide scrollbar for all browsers
            scrollbarWidth: 'none' as any,
            msOverflowStyle: 'none' as any,
          }}
          className="hide-scrollbar"
        >
          {SECONDARY_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveSecondaryCategory(
                  activeSecondaryCategory === cat.id ? null : cat.id
                )
                setActiveCategory('all')
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor:
                  activeSecondaryCategory === cat.id
                    ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                    : 'rgba(118, 75, 162, 0.1)',
                color:
                  activeSecondaryCategory === cat.id
                    ? '#fff'
                    : 'rgba(200, 200, 255, 0.7)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight:
                  activeSecondaryCategory === cat.id ? '600' : '500',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (activeSecondaryCategory !== cat.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(118, 75, 162, 0.2)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeSecondaryCategory !== cat.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(118, 75, 162, 0.1)'
                }
              }}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
          {/* Trailing spacer to prevent last item clipping at right edge - allows full scrolling past final tab */}
          <div style={{ width: '32px', flexShrink: 0 }} />
        </div>
      </div>

      {/* Add margin after tabs */}
      <div style={{ marginBottom: '20px' }} />

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
