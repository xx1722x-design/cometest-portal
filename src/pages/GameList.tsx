import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'
import { SiteFooter } from '../components/SiteFooter'
import { GAMES_DATA } from '../config/gamesData'
import { SIMULATIONS_DATA } from '../config/simulationsData'

const SIMULATION_CATEGORIES = ['biology', 'earth_science']
const CATEGORY_LABELS: { [key: string]: string } = {
  biology: '🧬 Biology',
  earth_science: '🌎 Earth Science',
}

export function GameList() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'games' | 'labs'>('games')
  const [activeCategory, setActiveCategory] = useState('space_universe')
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Responsive grid columns: mobile 2, tablet 3, desktop 4+
  const getGridColumns = (width: number): string => {
    if (width < 640) return 'repeat(2, 1fr)'
    if (width < 1024) return 'repeat(3, 1fr)'
    return 'repeat(auto-fill, minmax(200px, 1fr))'
  }

  const getSimulationsByCategory = (category: string) => SIMULATIONS_DATA.filter((sim) => sim.category === category)

  const renderCardGrid = (items: any[]) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: getGridColumns(windowWidth),
        gap: windowWidth < 640 ? '12px' : '20px',
        padding: windowWidth < 640 ? '12px' : '20px',
        marginBottom: '40px',
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => navigate(item.path)}
          style={{
            cursor: 'pointer',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            minHeight: '200px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)'
            e.currentTarget.style.transform = 'translateY(-4px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div
            style={{
              width: '100%',
              paddingTop: '100%',
              position: 'relative',
              backgroundColor: 'var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '80px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {item.thumbnail || item.icon}
            </div>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h3
              style={{
                margin: '0 0 8px 0',
                fontSize: windowWidth < 640 ? '14px' : '16px',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                wordBreak: 'break-word',
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                margin: '0',
                fontSize: windowWidth < 640 ? '12px' : '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                wordBreak: 'break-word',
              }}
            >
              {item.description}
            </p>
            <button
              style={{
                marginTop: '12px',
                padding: windowWidth < 640 ? '6px 10px' : '8px 12px',
                backgroundColor: '#667eea',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: windowWidth < 640 ? '11px' : '12px',
                fontWeight: '600',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5a67d8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#667eea'
              }}
              onClick={() => navigate(item.path)}
            >
              {item.path?.includes('game') ? '플레이' : 'Explore'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="portal-bg" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <div className="category-layout">
        <main className="category-main">
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              padding: '20px 20px 0 20px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '30px',
            }}
          >
            <button
              onClick={() => setActiveTab('games')}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === 'games' ? '#667eea' : 'transparent',
                color: '#fff',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s',
              }}
            >
              🎮 Web Games
            </button>
            <button
              onClick={() => setActiveTab('labs')}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === 'labs' ? '#667eea' : 'transparent',
                color: '#fff',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s',
              }}
            >
              🔬 Educational Labs
            </button>
          </div>

          {/* Content */}
          {activeTab === 'games' && (
            <>
              <div className="category-hero">
                <h1 className="category-hero__title">
                  <span aria-hidden="true">🎮</span> {t('web_games')}
                </h1>
                <p className="category-hero__subtitle">{t('portal_subtitle')}</p>
              </div>
              {renderCardGrid(GAMES_DATA)}
            </>
          )}

          {activeTab === 'labs' && (
            <>
              <div className="category-hero">
                <h1 className="category-hero__title">
                  <span aria-hidden="true">🔬</span> Educational Labs
                </h1>
                <p className="category-hero__subtitle">Interactive 3D science experiments and simulations</p>
              </div>

              {/* Category tabs for labs */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '20px',
                  flexWrap: 'wrap',
                }}
              >
                {SIMULATION_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: activeCategory === cat ? '#667eea' : '#333',
                      color: '#fff',
                      border: `2px solid ${activeCategory === cat ? '#667eea' : '#555'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                    }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              {/* Display simulations for selected category */}
              {renderCardGrid(getSimulationsByCategory(activeCategory))}
            </>
          )}
        </main>

        {/* 우측 사이드바 */}
        <Sidebar />
      </div>

      <SiteFooter />
    </div>
  )
}
