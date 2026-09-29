import { usePrismRushStore } from './prismRushState'

export function PrismRushUI() {
  const { score, timeLeft, isGameRunning, isGameOver, startGame, resetGame } = usePrismRushStore()

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
      {/* 상단 UI - 점수 & 타이머 */}
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
        {/* 점수 */}
        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
          <span style={{ color: '#ff1493' }}>🎯 SCORE:</span>
          <span style={{ marginLeft: '1rem', color: '#00ffff' }}>{Math.floor(score)}</span>
        </div>

        {/* 타이머 */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: timeLeft <= 5 ? '#ff1493' : '#00ffff',
            animation: timeLeft <= 5 ? 'pulse 0.5s infinite' : 'none',
          }}
        >
          ⏱️ {Math.ceil(timeLeft)}s
        </div>
      </div>

      {/* 중앙 - 게임 오버/시작 화면 */}
      {!isGameRunning && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            pointerEvents: 'auto',
          }}
        >
          {isGameOver && (
            <div
              style={{
                backgroundColor: 'rgba(10, 10, 26, 0.95)',
                padding: '3rem',
                borderRadius: '20px',
                border: '3px solid #ff1493',
                backdropFilter: 'blur(20px)',
                textAlign: 'center',
                boxShadow: '0 0 40px rgba(255, 20, 147, 0.5)',
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
                🎯 Final Score: <strong>{Math.floor(score)}</strong>
              </p>

              <button
                onClick={() => {
                  resetGame()
                  startGame()
                }}
                style={{
                  pointerEvents: 'auto',
                  padding: '1rem 2.5rem',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  backgroundColor: '#ff1493',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginTop: '1.5rem',
                  boxShadow: '0 0 20px rgba(255, 20, 147, 0.6)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff69b4'
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 20, 147, 0.9)'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff1493'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 20, 147, 0.6)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                🚀 PLAY AGAIN
              </button>
            </div>
          )}

          {!isGameOver && (
            <div
              style={{
                backgroundColor: 'rgba(10, 10, 26, 0.95)',
                padding: '3rem',
                borderRadius: '20px',
                border: '3px solid #00ffff',
                backdropFilter: 'blur(20px)',
                textAlign: 'center',
                boxShadow: '0 0 40px rgba(0, 255, 255, 0.5)',
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
                🌈 PRISM RUSH
              </h1>

              <div style={{ fontSize: '18px', color: '#a0a0a0', marginBottom: '2rem', lineHeight: '1.8' }}>
                <p>⬅️ Arrow Keys or A/D to Move</p>
                <p>⬆️ Spacebar to Jump</p>
                <p>⏱️ 30 seconds to get the highest score!</p>
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
          )}
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
            <p style={{ margin: 0 }}>Avoid obstacles • Maximize score!</p>
          </>
        ) : (
          <p style={{ margin: 0 }}>Get ready to jump into the prismatic void... 🌌</p>
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
