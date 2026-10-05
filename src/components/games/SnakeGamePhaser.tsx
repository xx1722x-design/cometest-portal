import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'

export function SnakeGamePhaser() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const gameInitialized = useRef(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    if (gameInitialized.current || !gameContainerRef.current) return

    gameInitialized.current = true

    class SnakeScene extends Phaser.Scene {
      snake: Phaser.Physics.Arcade.Sprite[] = []
      food: Phaser.Physics.Arcade.Sprite | null = null
      direction = { x: 1, y: 0 }
      nextDirection = { x: 1, y: 0 }
      currentScore = 0
      gameOverFlag = false
      gridSize = 20
      gameActive = false
      moveTimer = 0
      moveDelay = 150

      constructor() {
        super({ key: 'SnakeScene' })
      }

      create() {
        this.cameras.main.setBackgroundColor('#0a0a1a')
        this.gameActive = false

        // Create initial snake (3 segments)
        for (let i = 2; i >= 0; i--) {
          this.addSnakeSegment(5 - i, 5)
        }

        // Spawn food
        this.spawnFood()

        // Keyboard input
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
          switch (event.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
              if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 }
              break
            case 'arrowdown':
            case 's':
              if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 }
              break
            case 'arrowleft':
            case 'a':
              if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 }
              break
            case 'arrowright':
            case 'd':
              if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 }
              break
            case ' ':
              if (!this.gameActive) {
                this.gameActive = true
                setGameStarted(true)
              } else if (this.gameOverFlag) {
                this.scene.restart()
              }
              break
          }
        })
      }

      update(time: number) {
        if (!this.gameActive) return

        this.moveTimer += this.game.loop.delta
        if (this.moveTimer < this.moveDelay) return

        this.moveTimer = 0
        this.direction = { ...this.nextDirection }

        // Move snake
        const head = this.snake[0]
        const newX = head.x / this.gridSize + this.direction.x
        const newY = head.y / this.gridSize + this.direction.y

        // Check wall collision
        if (newX < 0 || newX >= 20 || newY < 0 || newY >= 20) {
          this.endGame()
          return
        }

        // Check self collision
        for (let i = 1; i < this.snake.length; i++) {
          if (this.snake[i].x / this.gridSize === newX && this.snake[i].y / this.gridSize === newY) {
            this.endGame()
            return
          }
        }

        // Add new head
        this.addSnakeSegment(newX, newY)

        // Check food collision
        if (this.food && this.food.x / this.gridSize === newX && this.food.y / this.gridSize === newY) {
          this.currentScore += 10
          this.moveDelay = Math.max(80, this.moveDelay - 2)
          setScore(this.currentScore)
          this.food.destroy()
          this.spawnFood()
        } else {
          // Remove tail if no food eaten
          const tail = this.snake.pop()
          tail?.destroy()
        }
      }

      addSnakeSegment(x: number, y: number) {
        const segment = this.add.rectangle(x * this.gridSize + this.gridSize / 2, y * this.gridSize + this.gridSize / 2, this.gridSize - 2, this.gridSize - 2, 0x60a5fa)
        segment.x = x * this.gridSize + this.gridSize / 2
        segment.y = y * this.gridSize + this.gridSize / 2
        this.snake.unshift(segment as any)
      }

      spawnFood() {
        const x = Math.floor(Math.random() * 20)
        const y = Math.floor(Math.random() * 20)

        // Check if position is not occupied by snake
        if (this.snake.some(seg => seg.x / this.gridSize === x && seg.y / this.gridSize === y)) {
          this.spawnFood()
          return
        }

        const colors = [0xef4444, 0xf59e0b, 0x10b981, 0x60a5fa, 0xa855f7]
        const color = Phaser.Utils.Array.GetRandom(colors)
        this.food = this.add.rectangle(x * this.gridSize + this.gridSize / 2, y * this.gridSize + this.gridSize / 2, this.gridSize - 2, this.gridSize - 2, color) as any
      }

      endGame() {
        this.gameOverFlag = true
        this.gameActive = false
        setGameOver(true)
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current as HTMLElement,
      width: 400,
      height: 400,
      backgroundColor: '#0a0a1a',
      scene: SnakeScene,
    }

    gameRef.current = new Phaser.Game(config)

    return () => {
      if (gameRef.current) {
        try {
          gameRef.current.destroy(true)
        } catch (e) {
          console.error('Error destroying Phaser game:', e)
        }
        gameRef.current = null
      }
      gameInitialized.current = false
    }
  }, [])

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.scene.start('SnakeScene')
      setScore(0)
      setGameOver(false)
      setGameStarted(false)
    }
  }

  const handleQuit = () => {
    if (gameRef.current) {
      gameRef.current.destroy(true)
      gameRef.current = null
    }
    gameInitialized.current = false
    window.location.href = '/game'
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a1a',
        fontFamily: "'Segoe UI', sans-serif",
        color: '#fff',
        position: 'relative',
      }}
    >
      <div id="snake-game-container" ref={gameContainerRef} style={{ width: '400px', height: '400px' }} />

      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #60a5fa',
          borderRadius: '12px',
          padding: '16px 24px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(96, 165, 250, 0.2)',
          zIndex: 100,
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#60a5fa', fontWeight: '700' }}>🐍 Snake Game</h3>
        <p style={{ margin: '4px 0', fontSize: '20px', fontWeight: 'bold', color: '#60a5fa' }}>Score: {score}</p>
      </div>

      {!gameStarted && !gameOver && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(10, 10, 26, 0.98)',
            border: '2px solid #60a5fa',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            backdropFilter: 'blur(15px)',
            zIndex: 200,
            minWidth: '300px',
            boxShadow: '0 12px 48px rgba(96, 165, 250, 0.3)',
          }}
        >
          <h2 style={{ margin: '0 0 16px 0', fontSize: '32px', color: '#60a5fa', fontWeight: '700' }}>🐍 Snake Game</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#aaa' }}>Use arrow keys or WASD to move</p>
          <button
            onClick={() => {
              if (gameRef.current?.scene.isActive('SnakeScene')) {
                ;(gameRef.current.scene.scenes[0] as any).gameActive = true
                setGameStarted(true)
              }
            }}
            style={{
              padding: '12px 32px',
              backgroundColor: '#60a5fa',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '16px',
            }}
          >
            Press SPACE or Click Start
          </button>
        </div>
      )}

      {gameOver && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(10, 10, 26, 0.98)',
            border: '2px solid #ef4444',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            backdropFilter: 'blur(15px)',
            zIndex: 200,
            minWidth: '300px',
            boxShadow: '0 12px 48px rgba(239, 68, 68, 0.3)',
          }}
        >
          <h2 style={{ margin: '0 0 16px 0', fontSize: '32px', color: '#ef4444', fontWeight: '700' }}>Game Over</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '24px', color: '#fff', fontWeight: 'bold' }}>Final Score: {score}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={handleRestart}
              style={{
                padding: '10px 24px',
                backgroundColor: '#60a5fa',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Restart
            </button>
            <button
              onClick={handleQuit}
              style={{
                padding: '10px 24px',
                backgroundColor: '#ef4444',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Quit
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #60a5fa',
          borderRadius: '12px',
          padding: '16px 24px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(96, 165, 250, 0.2)',
          zIndex: 100,
          fontSize: '12px',
          color: '#888',
          maxWidth: '200px',
          textAlign: 'center',
        }}
      >
        ⬆️ ⬇️ ⬅️ ➡️ Arrow Keys or WASD
      </div>
    </div>
  )
}
