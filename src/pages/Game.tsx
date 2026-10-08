import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lazy, Suspense, useEffect, useState } from 'react'
import { SpaceRacer } from '../components/games/SpaceRacer'
import { DriftBossV2Safe } from '../components/games/DriftBoss/DriftBossV2Safe'
import { CatchGamePhaser } from '../components/games/CatchGamePhaser'
import { SnakeGamePhaser } from '../components/games/SnakeGamePhaser'
import { Match3PuzzlePhaser } from '../components/games/Match3PuzzlePhaser'
import { NeonSpaceShooter } from '../components/games/NeonSpaceShooter'
import { NeonPlatformerPhaser } from '../components/games/NeonPlatformerPhaser'
import { BreakoutArcadePhaser } from '../components/games/BreakoutArcadePhaser'
import { NeonDodgePhaser } from '../components/games/NeonDodgePhaser'
import { getGameById } from '../config/gamesData'

// Dynamic import for AllYouCanTycoon (JSX file)
// @ts-ignore - importing JSX file is intentional for game compatibility
const AllYouCanTycoon = lazy(() => import('../components/games/AllYouCanTycoon/index.jsx').then(m => ({ default: m.default })))

export function Game() {
  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()
  const { t } = useTranslation()
  const [saveExists, setSaveExists] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  const game = gameId ? getGameById(gameId) : null

  // Portal save keys
  const PORTAL_SAVE_KEY = `PORTAL_SAVE_${gameId}`
  const PORTAL_SETTINGS_KEY = 'PORTAL_SETTINGS'

  // Clear game cache on mount and unmount
  useEffect(() => {
    if (!gameId) return

    // Backup portal settings
    const portalSettings: Record<string, string> = {}
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.includes('i18next') || key.includes('_i18next') || key === PORTAL_SETTINGS_KEY) {
        portalSettings[key] = localStorage.getItem(key) || ''
      }
    })

    // Clear all game cache on entry (fresh start)
    localStorage.clear()

    // Restore portal settings
    Object.entries(portalSettings).forEach(([key, value]) => {
      localStorage.setItem(key, value)
    })

    // Check if save exists
    const existingSave = localStorage.getItem(PORTAL_SAVE_KEY)
    setSaveExists(!!existingSave)

    // Cleanup: Clear game cache on exit
    return () => {
      const finalSettings: Record<string, string> = {}
      const finalKeys = Object.keys(localStorage)
      finalKeys.forEach((key) => {
        if (key.includes('i18next') || key.includes('_i18next') || key === PORTAL_SETTINGS_KEY) {
          finalSettings[key] = localStorage.getItem(key) || ''
        }
      })

      localStorage.clear()

      Object.entries(finalSettings).forEach(([key, value]) => {
        localStorage.setItem(key, value)
      })
    }
  }, [gameId, PORTAL_SAVE_KEY])

  const handleSaveGame = () => {
    if (!gameId) return

    // Get all game-related cache except portal settings
    const gameData: Record<string, string> = {}
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (!key.includes('i18next') && !key.includes('_i18next') && key !== PORTAL_SETTINGS_KEY) {
        gameData[key] = localStorage.getItem(key) || ''
      }
    })

    // Save to portal save storage
    localStorage.setItem(PORTAL_SAVE_KEY, JSON.stringify(gameData))
    setSaveExists(true)
    alert(`✅ Game progress saved for ${gameId}`)
  }

  const handleLoadGame = () => {
    if (!gameId) return

    const saved = localStorage.getItem(PORTAL_SAVE_KEY)
    if (!saved) {
      alert('No save found')
      return
    }

    try {
      const gameData = JSON.parse(saved)

      // Clear current game cache
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (!key.includes('i18next') && !key.includes('_i18next') && key !== PORTAL_SETTINGS_KEY && key !== PORTAL_SAVE_KEY) {
          localStorage.removeItem(key)
        }
      })

      // Restore saved data
      Object.entries(gameData).forEach(([key, value]) => {
        localStorage.setItem(key, value as string)
      })

      alert('✅ Save loaded! Reloading game...')
      window.location.reload()
    } catch (e) {
      alert('Error loading save')
    }
  }

  const renderGame = () => {
    switch (gameId) {
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
        // PhET Interactive Simulations (force English locale)
        if (gameId?.startsWith('phet-')) {
          const simName = gameId.replace('phet-', '')
          return (
            <iframe
              src={`/simulations/${simName}.html?locale=en`}
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

      {/* Floating Save/Load HUD */}
      {gameId && (gameId.includes('-') || gameId === 'ninja-vs-evilcorp' || gameId === '13th-floor') && (
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2rem',
            zIndex: 101,
            display: 'flex',
            gap: '0.75rem',
            flexDirection: 'column',
          }}
        >
          <button
            onClick={handleSaveGame}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(76, 175, 80, 0.9)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(76, 175, 80, 1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(76, 175, 80, 0.9)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            💾 Save Progress
          </button>
          <button
            onClick={handleLoadGame}
            disabled={!saveExists}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: saveExists ? 'rgba(33, 150, 243, 0.9)' : 'rgba(128, 128, 128, 0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: saveExists ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              opacity: saveExists ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
              if (saveExists) {
                e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (saveExists) {
                e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.9)'
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
          >
            📂 Load Save {saveExists ? '✓' : ''}
          </button>
        </div>
      )}

      {/* Collapsed Panel Toggle Button */}
      {(game?.controls || game?.storyDescription) && !isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          style={{
            position: 'absolute',
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(100, 181, 246, 0.15)',
            border: '1px solid rgba(100, 181, 246, 0.3)',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            color: 'rgba(100, 181, 246, 0.8)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(100, 181, 246, 0.25)'
            e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(100, 181, 246, 0.15)'
            e.currentTarget.style.transform = 'translateX(-50%) translateY(0)'
          }}
        >
          🔼 Show Info
        </button>
      )}

      {/* Controls & Story Description Panel - Bottom overlay */}
      {(game?.controls || game?.storyDescription) && isPanelOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: 'rgba(10, 10, 26, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTop: '2px solid rgba(100, 181, 246, 0.3)',
            padding: '1.5rem 2rem',
            maxHeight: '240px',
            overflowY: 'auto',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Toggle Button - Hide Panel */}
          <button
            onClick={() => setIsPanelOpen(false)}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '2rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'rgba(100, 181, 246, 0.6)',
              cursor: 'pointer',
              fontSize: '20px',
              transition: 'all 0.3s ease',
              padding: '0.25rem 0.5rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(100, 181, 246, 1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(100, 181, 246, 0.6)'
            }}
            title="Hide panel"
          >
            🔽
          </button>

          {/* Controls Section - PROMINENT */}
          {game?.controls && (
            <div
              style={{
                color: 'rgba(100, 181, 246, 1)',
                fontSize: '15px',
                fontWeight: '700',
                lineHeight: '1.8',
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(100, 181, 246, 0.1)',
                borderLeft: '4px solid rgba(100, 181, 246, 0.8)',
                borderRadius: '4px',
                maxWidth: '1200px',
              }}
            >
              <span style={{ marginRight: '0.5rem' }}>⌨️ CONTROLS:</span>
              {game.controls}
            </div>
          )}

          {/* Story Description Section */}
          {game?.storyDescription && (
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '14px',
                lineHeight: '1.6',
                fontStyle: 'italic',
                maxWidth: '1200px',
              }}
            >
              <span style={{ color: 'rgba(100, 181, 246, 0.8)', marginRight: '0.5rem' }}>✦</span>
              {game.storyDescription}
            </div>
          )}

          {/* SEO Keywords */}
          {game?.seoKeywords && game.seoKeywords.length > 0 && (
            <div
              style={{
                marginTop: '0.75rem',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.4)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              {game.seoKeywords.map((keyword, idx) => (
                <span key={idx} style={{ display: 'inline-block' }}>
                  #{keyword}
                </span>
              ))}
            </div>
          )}

          {/* License & Attribution Notice */}
          <div
            style={{
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(100, 181, 246, 0.2)',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.5)',
              lineHeight: '1.4',
            }}
          >
            <span style={{ display: 'block', marginBottom: '0.25rem' }}>
              © Game provided by Cometest Portal Educational Archive
            </span>
            <span style={{ display: 'block' }}>
              🎮 For personal entertainment and educational use only. Non-commercial use.
            </span>
          </div>
        </div>
      )}

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
          color: '#000000',
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
          e.currentTarget.style.color = '#000000'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'
        }}
      >
        ← {t('home_button')}
      </button>
    </div>
  )
}
