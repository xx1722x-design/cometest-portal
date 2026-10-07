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
import { BreakoutArcadePhaser } from '../components/games/BreakoutArcadePhaser'
import { NeonDodgePhaser } from '../components/games/NeonDodgePhaser'
import { PortedGameWrapper } from '../components/games/PortedGameWrapper'
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
      case 'mario':
        return <PortedGameWrapper gameName="mario" />
      case 'tetris':
        return <PortedGameWrapper gameName="tetris" />
      case 'pacman':
        return <PortedGameWrapper gameName="pacman" />
      case 'snake':
        return <PortedGameWrapper gameName="snake" />
      case '2048':
        return <PortedGameWrapper gameName="2048" />
      case 'hextris':
        return <PortedGameWrapper gameName="hextris" />
      case 'neon-dodge':
        return <NeonDodgePhaser />
      case 'breakout-arcade':
        return <BreakoutArcadePhaser />
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
        // Auto-uploaded games from /public/labs/
        return (
          <iframe
            src={`/labs/${gameId}/index.html`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '0',
            }}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-pointer-lock"
            title={gameId}
          />
        )
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
      {/* Game Rendering */}
      {renderGame()}

      {/* Back Button - Overlay on top of game */}
      <button
        onClick={() => navigate('/game')}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 100,
          padding: '0.75rem 1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          color: '#1a1a1a',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '700',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff'
          e.currentTarget.style.color = '#000000'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
          e.currentTarget.style.color = '#1a1a1a'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'
        }}
      >
        ← {t('home_button')}
      </button>
    </div>
  )
}
