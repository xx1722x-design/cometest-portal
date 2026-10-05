import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'

interface GameState {
  score: number
  gameOver: boolean
  isPaused: boolean
}

export function CatchGamePhaser() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    gameOver: false,
    isPaused: false,
  })

  useEffect(() => {
    if (gameContainerRef.current && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameContainerRef.current,
        width: 800,
        height: 600,
        backgroundColor: '#0a0a1a',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 300 },
            debug: false,
          },
        },
        scene: CatchScene,
      }

      gameRef.current = new Phaser.Game(config)

      // Expose game state updates to React
      const scene = gameRef.current.scene.getScene('CatchScene') as any
      scene.onStateChange = (newState: GameState) => {
        setGameState(newState)
      }
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.scene.start('CatchScene')
      setGameState({ score: 0, gameOver: false, isPaused: false })
    }
  }

  const handleTogglePause = () => {
    if (gameRef.current && !gameState.gameOver) {
      const scene = gameRef.current.scene.getScene('CatchScene') as any
      if (gameState.isPaused) {
        scene?.physics.resume()
      } else {
        scene?.physics.pause()
      }
      setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }))
    }
  }

  const handleQuit = () => {
    window.location.href = '/game'
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a1a',
        fontFamily: "'Segoe UI', sans-serif",
        color: '#fff',
      }}
    >
      <div
        ref={gameContainerRef}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />

      {/* HUD Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #ff8c42',
          borderRadius: '12px',
          padding: '16px 24px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)',
          zIndex: 100,
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#ff8c42', fontWeight: '700' }}>
          🎮 Catch Game
        </h3>
        <p style={{ margin: '4px 0', fontSize: '20px', fontWeight: 'bold', color: '#60a5fa' }}>
          Score: {gameState.score}
        </p>
      </div>

      {/* Game Over Screen */}
      {gameState.gameOver && (
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
          <h2 style={{ margin: '0 0 16px 0', fontSize: '32px', color: '#ef4444', fontWeight: '700' }}>
            Game Over
          </h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '24px', color: '#fff', fontWeight: 'bold' }}>
            Final Score: {gameState.score}
          </p>
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
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#60a5fa'
                e.currentTarget.style.transform = 'scale(1)'
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
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              Quit
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #ff8c42',
          borderRadius: '12px',
          padding: '16px 24px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <p style={{ margin: '0', fontSize: '12px', color: '#888' }}>🖱️ Move mouse to control basket</p>
        {!gameState.gameOver && (
          <button
            onClick={handleTogglePause}
            style={{
              padding: '8px 16px',
              backgroundColor: gameState.isPaused ? '#f59e0b' : '#60a5fa',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            {gameState.isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
        )}
      </div>
    </div>
  )
}

class CatchScene extends Phaser.Scene {
  private basket!: Phaser.Physics.Arcade.Sprite
  private fruits!: Phaser.Physics.Arcade.Group
  private scoreText!: Phaser.GameObjects.Text
  private score = 0
  private gameOverFlag = false
  private spawnRate = 1500
  private lastSpawnTime = 0
  public onStateChange?: (state: { score: number; gameOver: boolean; isPaused: boolean }) => void

  constructor() {
    super({ key: 'CatchScene' })
  }

  create() {
    this.score = 0
    this.gameOverFlag = false
    this.lastSpawnTime = 0

    // Background
    this.add.rectangle(400, 300, 800, 600, 0x0a0a1a)

    // Create basket texture
    const basketCanvas = this.textures.createCanvas('basket', 80, 20)
    const ctx = basketCanvas?.getContext()
    if (ctx) {
      ctx.fillStyle = '#60a5fa'
      ctx.fillRect(0, 0, 80, 20)
    }
    basketCanvas?.refresh()

    // Basket (player)
    this.basket = this.physics.add.sprite(400, 550, 'basket')
    this.basket.setCollideWorldBounds(true)
    this.basket.setBounce(0)

    // Fruits group
    this.fruits = this.physics.add.group()

    // Collision detection
    this.physics.add.overlap(
      this.basket,
      this.fruits,
      this.collectFruit,
      undefined,
      this
    )

    // Mouse follow
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.basket.x = Phaser.Math.Clamp(pointer.x, 40, 760)
    })

    // Spawn timer
    this.time.addEvent({
      delay: this.spawnRate,
      callback: this.spawnFruit,
      callbackScope: this,
      loop: true,
    })
  }

  update() {
    if (this.gameOverFlag) return

    // Gradually increase difficulty
    this.spawnRate = Math.max(800, 1500 - Math.floor(this.score / 10) * 50)

    // Remove fruits that fell off screen
    const childrenArray = (this.fruits.children as any).entries || []
    childrenArray.forEach((child: any) => {
      if (child.y > 650) {
        this.gameOverFlag = true
        this.onStateChange?.({ score: this.score, gameOver: true, isPaused: false })
        this.physics.pause()
      }
    })
  }

  private spawnFruit() {
    if (this.gameOverFlag) return

    const x = Phaser.Math.Between(50, 750)
    const colors = [0xef4444, 0xf59e0b, 0x10b981, 0x60a5fa, 0xa855f7]
    const colorHex = Phaser.Utils.Array.GetRandom(colors) as number
    const textureKey = `fruit_${colorHex}_${Math.random()}`

    // Create fruit texture dynamically
    const fruitCanvas = this.textures.createCanvas(textureKey, 16, 16)
    const ctx = fruitCanvas?.getContext()
    if (ctx) {
      ctx.fillStyle = '#' + colorHex.toString(16).padStart(6, '0')
      ctx.beginPath()
      ctx.arc(8, 8, 8, 0, Math.PI * 2)
      ctx.fill()
    }
    fruitCanvas?.refresh()

    const fruit = this.fruits.create(x, -20, textureKey) as Phaser.Physics.Arcade.Sprite
    fruit.setVelocityY(Phaser.Math.Between(150, 250))
    fruit.setVelocityX(Phaser.Math.Between(-50, 50))
  }

  private collectFruit(basket: any, fruit: any) {
    (fruit as Phaser.Physics.Arcade.Sprite).destroy()
    this.score += 10
    this.onStateChange?.({ score: this.score, gameOver: false, isPaused: false })

    // Visual feedback
    this.tweens.add({
      targets: basket,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 100,
      yoyo: true,
    })
  }
}
