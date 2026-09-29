import { useEffect } from 'react'
import { usePrismRushStore, Difficulty } from './prismRushState'

export function PrismRushUI() {
  const {
    score,
    isGameRunning,
    isGameOver,
    gameStarted,
    difficulty,
    nickname,
    showNicknameInput,
    highScores,
    startGame,
    resetGame,
    setDifficulty,
    setNickname,
    setShowNicknameInput,
    saveHighScore,
    loadHighScores,
  } = usePrismRushStore()

  useEffect(() => {
    loadHighScores()
  }, [])

  const handleSaveScore = () => {
    if (nickname.trim()) {
      saveHighScore(nickname)
      resetGame()
      setShowNicknameInput(false)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '2rem',
        pointerEvents: 'none',
        fontFamily: "'Arial', sans-serif",
        color: '#ffffff',
        textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
      }}
    >
      {/* 상단 UI - 점수 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(10, 10, 26, 0.8)',
          padding: '1.5rem 2rem',
          borderRadius: '12px',
          border: '2px solid #00ffff',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
        }}
      >
        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
          <span style={{ color: '#ff1493' }}>🎯 SCORE:</span>
          <span style={{ marginLeft: '1rem', color: '#00ffff' }}>{Math.floor(score)}</span>
        </div>

        <div style={{ fontSize: '16px', color: '#a0a0a0' }}>
          <span style={{ marginRight: '1rem' }}>⚙️ {difficulty.toUpperCase()}</span>
        </div>
      </div>

      {/* 중앙 - 게임 시작/오버 화면 */}
      {!gameStarted && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(10, 10, 26, 0.95)',
              padding: '3rem',
              borderRadius: '20px',
              border: '3px solid #00ffff',
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(0, 255, 255, 0.5)',
              maxWidth: '500px',
            }}
          >
            <h1
              style={{
                fontSize: '48px',
                margin: '0 0 2rem 0',
                background: 'linear-gradient(135deg, #ff1493 0%, #00ffff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              🌈 PRISM RUSH
            </h1>

            {/* 난이도 선택 */}
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ color: '#a0a0a0', marginBottom: '1rem' }}>SELECT DIFFICULTY:</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    style={{
                      pointerEvents: 'auto',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: difficulty === diff ? '#ff1493' : '#1a1a2e',
                      color: '#ffffff',
                      border: `2px solid ${difficulty === diff ? '#ff1493' : '#00ffff'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (difficulty !== diff) {
                        e.currentTarget.style.backgroundColor = '#00ffff'
                        e.currentTarget.style.color = '#0a0a1a'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (difficulty !== diff) {
                        e.currentTarget.style.backgroundColor = '#1a1a2e'
                        e.currentTarget.style.color = '#ffffff'
                      }
                    }}
                  >
                    {diff.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '16px', color: '#a0a0a0', marginBottom: '2rem', lineHeight: '1.8' }}>
              <p>⬅️ Arrow Keys or A/D to Move</p>
              <p>⬆️ Spacebar to Jump</p>
              <p>🛣️ Stay on white track to survive!</p>
            </div>

            <button
              onClick={() => startGame()}
              style={{
                pointerEvents: 'auto',
                padding: '1rem 2.5rem',
                fontSize: '20px',
                fontWeight: 'bold',
                backgroundColor: '#00ffff',
                color: '#0a0a1a',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '1.5rem',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.6)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#00ffff'
                e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.9)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#00ffff'
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.6)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              🎮 START GAME
            </button>
          </div>
        </div>
      )}

      {/* 게임 오버 + 닉네임 입력 */}
      {isGameOver && showNicknameInput && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(10, 10, 26, 0.95)',
              padding: '3rem',
              borderRadius: '20px',
              border: '3px solid #ff1493',
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(255, 20, 147, 0.5)',
              maxWidth: '500px',
            }}
          >
            <h1
              style={{
                fontSize: '48px',
                margin: '0 0 1.5rem 0',
                background: 'linear-gradient(135deg, #ff1493 0%, #00ffff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              GAME OVER
            </h1>

            <p style={{ fontSize: '32px', margin: '1rem 0', color: '#00ffff' }}>
              🎯 Score: <strong>{Math.floor(score)}</strong>
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ color: '#a0a0a0', marginBottom: '0.5rem', display: 'block' }}>
                Enter your nickname:
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveScore()
                }}
                placeholder="Your name"
                style={{
                  pointerEvents: 'auto',
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#1a1a2e',
                  border: '2px solid #00ffff',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  marginBottom: '1rem',
                }}
              />
              <button
                onClick={handleSaveScore}
                disabled={!nickname.trim()}
                style={{
                  pointerEvents: 'auto',
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: nickname.trim() ? '#ff1493' : '#555555',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: nickname.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (nickname.trim()) {
                    e.currentTarget.style.backgroundColor = '#ff69b4'
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 20, 147, 0.6)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (nickname.trim()) {
                    e.currentTarget.style.backgroundColor = '#ff1493'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                💾 SAVE & PLAY AGAIN
              </button>
            </div>

            {/* 순위 표시 */}
            {highScores.length > 0 && (
              <div
                style={{
                  marginTop: '2rem',
                  paddingTop: '2rem',
                  borderTop: '1px solid #00ffff',
                }}
              >
                <p style={{ color: '#a0a0a0', marginBottom: '1rem' }}>🏆 TOP 10 SCORES:</p>
                <div style={{ textAlign: 'left', fontSize: '14px' }}>
                  {highScores.slice(0, 10).map((hs, idx) => (
                    <div key={idx} style={{ margin: '0.5rem 0', color: '#00ffff' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '1rem' }}>#{idx + 1}</span>
                      <span>{hs.nickname}</span>
                      <span style={{ marginLeft: '1rem', color: '#ff1493' }}>
                        {Math.floor(hs.score)} pts ({hs.difficulty})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 하단 - 조작 안내 */}
      <div
        style={{
          fontSize: '14px',
          color: '#a0a0a0',
          textAlign: 'center',
          backgroundColor: 'rgba(10, 10, 26, 0.6)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #00ffff',
        }}
      >
        {isGameRunning ? (
          <>
            <p style={{ margin: '0 0 0.5rem 0' }}>⬅️➡️ Move | Spacebar Jump 🚀</p>
            <p style={{ margin: 0 }}>Stay on white track • Don't fall off! 🛣️</p>
          </>
        ) : (
          <p style={{ margin: 0 }}>Get ready to master the Prism Rush... 🌌</p>
        )}
      </div>

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
