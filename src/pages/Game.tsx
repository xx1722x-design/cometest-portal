import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lazy, Suspense } from 'react'
import { SpaceRacer } from '../components/games/SpaceRacer'
import { DriftBossV2Safe } from '../components/games/DriftBoss/DriftBossV2Safe'
import { CatchGamePhaser } from '../components/games/CatchGamePhaser'
import { SnakeGamePhaser } from '../components/games/SnakeGamePhaser'
import { Match3PuzzlePhaser } from '../components/games/Match3PuzzlePhaser'
import { NeonSpaceShooter } from '../components/games/NeonSpaceShooter'
import { NeonPlatformerPhaser } from '../components/games/NeonPlatformerPhaser'
import { getGameById } from '../config/gamesData'

// Dynamic import for AllYouCanTycoon (JSX file)
// @ts-ignore - importing JSX file is intentional for game compatibility
const AllYouCanTycoon = lazy(() => import('../components/games/AllYouCanTycoon/index.jsx').then(m => ({ default: m.default })))

export function Game() {
  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()
  const { t } = useTranslation()

  const game = gameId ? getGameById(gameId) : null

  const renderGame = () => {
    switch (gameId) {
      case 'neon-platformer':
        return <NeonPlatformerPhaser />
      case 'space-racer':
        return <SpaceRacer />
      case 'all-you-can-tycoon':
        return (
          <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Loading Game...</div>}>
            <AllYouCanTycoon />
          </Suspense>
        )
      case 'prism-rush':
        return <div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Prism Rush Coming Soon</div>
      case 'drift-boss':
        return <DriftBossV2Safe />
      case 'catch-game':
        return <CatchGamePhaser />
      case 'snake-game':
        return <SnakeGamePhaser />
      case 'match3-puzzle':
        return <Match3PuzzlePhaser />
      case 'neon-space-shooter':
        return <NeonSpaceShooter />
      default:
        return <div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>게임을 찾을 수 없습니다</div>
    }
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        fontFamily: "'Arial', sans-serif",
        backgroundColor: '#0a0a1a',
        position: 'relative',
      }}
    >
      {/* 게임 렌더링 */}
      {renderGame()}

      {/* 뒤로가기 버튼 - 게임 위에 오버레이 */}
      <button
        onClick={() => navigate('/game')}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 100,
          padding: '0.75rem 1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'
        }}
      >
        ← {t('home_button')}
      </button>
    </div>
  )
}
