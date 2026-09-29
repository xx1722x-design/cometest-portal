import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'
import { SiteFooter } from '../components/SiteFooter'
import { GAMES_DATA } from '../config/gamesData'

export function GameList() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="portal-bg" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <div className="category-layout">
        <main className="category-main">
          {/* 게임 목록 헤더 */}
          <div className="category-hero">
            <h1 className="category-hero__title">
              <span aria-hidden="true">🎮</span> {t('web_games')}
            </h1>
            <p className="category-hero__subtitle">{t('portal_subtitle')}</p>
          </div>

          {/* 게임 카드 그리드 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '20px',
              padding: '20px',
              marginBottom: '40px',
            }}
          >
            {GAMES_DATA.map((game) => (
              <div
                key={game.id}
                onClick={() => navigate(game.path)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
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
                {/* 썸네일 영역 */}
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
                      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    {game.thumbnail}
                  </div>
                </div>

                {/* 콘텐츠 영역 */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* 제목 */}
                  <h3
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                    }}
                  >
                    {game.title}
                  </h3>

                  {/* 설명 */}
                  <p
                    style={{
                      margin: '0',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      flex: 1,
                    }}
                  >
                    {game.description}
                  </p>

                  {/* 시작 버튼 */}
                  <button
                    style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      backgroundColor: '#667eea',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#5a67d8'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#667eea'
                    }}
                    onClick={() => navigate(game.path)}
                  >
                    플레이
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* 우측 사이드바 */}
        <Sidebar />
      </div>

      <SiteFooter />
    </div>
  )
}
