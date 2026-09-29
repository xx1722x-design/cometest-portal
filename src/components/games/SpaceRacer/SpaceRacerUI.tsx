import { useState, useEffect } from 'react'
import { useSpaceRacerStore } from './spaceRacerState'

const SHIP_MODELS = [
  { color: '#ff6b6b', name: 'Red Speed' },
  { color: '#4ecdc4', name: 'Cyan Dream' },
  { color: '#ffe66d', name: 'Gold Rush' },
  { color: '#95e1d3', name: 'Mint Fresh' },
  { color: '#f38181', name: 'Pink Force' },
  { color: '#aa96da', name: 'Purple Star' },
  { color: '#fcbad3', name: 'Coral Nova' },
  { color: '#a8dadc', name: 'Sky Blue' },
  { color: '#f1faee', name: 'Pearl White' },
  { color: '#1d3557', name: 'Navy Dark' },
]

export function SpaceRacerUI() {
  const { gameState, difficulty, selectedShip, score, startGame, saveRanking, resetGame, rankings } =
    useSpaceRacerStore()
  const [nickname, setNickname] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal')
  const [selectedShipForGame, setSelectedShipForGame] = useState(0)

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: gameState === 'playing' ? 'none' : 'auto',
        zIndex: 10,
      }}
    >
      {gameState === 'menu' && (
        <MenuScreen
          selectedShip={selectedShipForGame}
          onSelectShip={setSelectedShipForGame}
          selectedDifficulty={selectedDifficulty}
          onSelectDifficulty={setSelectedDifficulty}
          onStartGame={() => startGame(selectedDifficulty, selectedShipForGame)}
        />
      )}

      {gameState === 'playing' && <GameHUD score={score} />}

      {gameState === 'gameOver' && (
        <GameOverScreen
          score={score}
          nickname={nickname}
          onNicknameChange={setNickname}
          onSaveScore={() => {
            if (nickname.trim()) {
              saveRanking(nickname)
              setNickname('')
            }
          }}
        />
      )}

      {gameState === 'ranking' && <RankingScreen rankings={rankings} onBack={resetGame} />}
    </div>
  )
}

function MenuScreen({
  selectedShip,
  onSelectShip,
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
}: {
  selectedShip: number
  onSelectShip: (idx: number) => void
  selectedDifficulty: 'easy' | 'normal' | 'hard'
  onSelectDifficulty: (d: 'easy' | 'normal' | 'hard') => void
  onStartGame: () => void
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 100%)',
        padding: '40px',
        gap: '40px',
      }}
    >
      <h1
        style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #ffe66d)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          textShadow: '0 0 30px rgba(255, 107, 107, 0.5)',
          margin: 0,
        }}
      >
        INFINITE SPACE RACER
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
        {/* Ship Selection */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#4ecdc4', fontSize: '1.5rem', marginBottom: '15px' }}>
            SELECT YOUR SHIP
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
            {SHIP_MODELS.map((ship, idx) => (
              <button
                key={idx}
                onClick={() => onSelectShip(idx)}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '10px',
                  border: selectedShip === idx ? `3px solid ${ship.color}` : '2px solid #444',
                  background: `${ship.color}20`,
                  color: ship.color,
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow:
                    selectedShip === idx ? `0 0 20px ${ship.color}80` : 'none',
                }}
              >
                {ship.name}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#ffe66d', fontSize: '1.5rem', marginBottom: '15px' }}>
            SELECT DIFFICULTY
          </h2>
          <div style={{ display: 'flex', gap: '20px' }}>
            {(['easy', 'normal', 'hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => onSelectDifficulty(d)}
                style={{
                  padding: '12px 30px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  border: selectedDifficulty === d ? '2px solid #4ecdc4' : '2px solid #666',
                  background: selectedDifficulty === d ? '#4ecdc420' : '#222',
                  color: selectedDifficulty === d ? '#4ecdc4' : '#aaa',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textTransform: 'uppercase',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStartGame}
          style={{
            padding: '15px 50px',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4)',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(255, 107, 107, 0.5)',
            transition: 'all 0.3s',
            textTransform: 'uppercase',
          }}
          onMouseOver={(e) => {
            ;(e.target as HTMLElement).style.transform = 'scale(1.05)'
            ;(e.target as HTMLElement).style.boxShadow = '0 0 50px rgba(255, 107, 107, 0.8)'
          }}
          onMouseOut={(e) => {
            ;(e.target as HTMLElement).style.transform = 'scale(1)'
            ;(e.target as HTMLElement).style.boxShadow = '0 0 30px rgba(255, 107, 107, 0.5)'
          }}
        >
          START RACE
        </button>
      </div>

      {/* Controls Help */}
      <div
        style={{
          fontSize: '0.9rem',
          color: '#888',
          textAlign: 'center',
          marginTop: '20px',
        }}
      >
        <p>← / A or → / D to Move | SPACE to Jump</p>
      </div>
    </div>
  )
}

function GameHUD({ score }: { score: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: '#4ecdc4',
        fontSize: '2rem',
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(78, 205, 196, 0.5)',
      }}
    >
      DISTANCE: {score}m
    </div>
  )
}

function GameOverScreen({
  score,
  nickname,
  onNicknameChange,
  onSaveScore,
}: {
  score: number
  nickname: string
  onNicknameChange: (name: string) => void
  onSaveScore: () => void
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(10, 10, 26, 0.95)',
        backdropFilter: 'blur(5px)',
        gap: '30px',
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          color: '#ff6b6b',
          margin: 0,
        }}
      >
        GAME OVER
      </h1>

      <div style={{ fontSize: '2rem', color: '#ffe66d' }}>SCORE: {score}m</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
        <label style={{ color: '#4ecdc4', fontSize: '1.1rem' }}>
          ENTER YOUR NAME:
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          placeholder="Player Name"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSaveScore()
            }
          }}
          maxLength={20}
          style={{
            padding: '10px 15px',
            fontSize: '1rem',
            borderRadius: '5px',
            border: '2px solid #4ecdc4',
            background: '#0a0a1a',
            color: '#4ecdc4',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        />

        <button
          onClick={onSaveScore}
          disabled={!nickname.trim()}
          style={{
            padding: '10px 30px',
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '5px',
            border: 'none',
            background: nickname.trim() ? 'linear-gradient(90deg, #ff6b6b, #4ecdc4)' : '#444',
            color: '#fff',
            cursor: nickname.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s',
            textTransform: 'uppercase',
          }}
        >
          SUBMIT SCORE
        </button>
      </div>
    </div>
  )
}

function RankingScreen({
  rankings,
  onBack,
}: {
  rankings: Array<{ nickname: string; score: number; timestamp: number }>
  onBack: () => void
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 100%)',
        padding: '40px',
        gap: '30px',
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          color: '#ffe66d',
          margin: 0,
        }}
      >
        RANKINGS
      </h1>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        {rankings.length === 0 ? (
          <div style={{ color: '#888', fontSize: '1.2rem' }}>No rankings yet...</div>
        ) : (
          rankings.map((entry, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 20px',
                background: idx === 0 ? 'rgba(255, 215, 0, 0.1)' : 'rgba(78, 205, 196, 0.05)',
                borderRadius: '8px',
                borderLeft: `4px solid ${idx === 0 ? '#ffd700' : '#4ecdc4'}`,
                minWidth: '300px',
              }}
            >
              <div style={{ color: '#ffe66d', fontSize: '1.1rem', fontWeight: 'bold' }}>
                #{idx + 1}
              </div>
              <div style={{ color: '#4ecdc4', fontSize: '1rem', flex: 1, marginLeft: '20px' }}>
                {entry.nickname}
              </div>
              <div style={{ color: '#ff6b6b', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {entry.score}m
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={onBack}
        style={{
          padding: '12px 40px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          borderRadius: '8px',
          border: 'none',
          background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4)',
          color: '#fff',
          cursor: 'pointer',
          transition: 'all 0.3s',
          textTransform: 'uppercase',
        }}
      >
        PLAY AGAIN
      </button>
    </div>
  )
}
