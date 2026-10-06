import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'

export function BreakoutArcadePhaser() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const gameInitializedRef = useRef(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver' | 'levelComplete'>('menu')

  useEffect(() => {
    if (gameInitializedRef.current || !gameContainerRef.current) return
    gameInitializedRef.current = true

    class BreakoutScene extends Phaser.Scene {
      paddle: Phaser.Physics.Arcade.Sprite | null = null
      ball: Phaser.Physics.Arcade.Sprite | null = null
      bricks: Phaser.Physics.Arcade.Group | null = null
      score = 0
      level = 1
      health = 3
      gameActive = false
      ballLaunched = false
      cursors: any = null

      constructor() {
        super({ key: 'BreakoutScene' })
      }

      create() {
        this.cameras.main.setBackgroundColor('#0a0a1a')

        // Create paddle
        const paddleGraphics = this.make.graphics({ x: 0, y: 0 }, false)
        paddleGraphics.fillStyle(0x00ffff, 1)
        paddleGraphics.fillRoundedRect(0, 0, 100, 16, 8)
        paddleGraphics.lineStyle(2, 0x00ff88, 1)
        paddleGraphics.strokeRoundedRect(0, 0, 100, 16, 8)
        paddleGraphics.generateTexture('paddle', 100, 16)
        paddleGraphics.destroy()

        this.paddle = this.physics.add.sprite(400, 550, 'paddle')
        this.paddle.setCollideWorldBounds(true)
        this.paddle.setBounce(1)
        this.paddle.setImmovable(true)

        // Create ball
        const ballGraphics = this.make.graphics({ x: 0, y: 0 }, false)
        ballGraphics.fillStyle(0xff0080, 1)
        ballGraphics.fillCircle(8, 8, 8)
        ballGraphics.lineStyle(2, 0xffff00, 1)
        ballGraphics.strokeCircle(8, 8, 8)
        ballGraphics.generateTexture('ball', 16, 16)
        ballGraphics.destroy()

        this.ball = this.physics.add.sprite(400, 500, 'ball')
        this.ball.setBounce(1)
        this.ball.setData('onPaddle', true)

        // Create bricks
        this.bricks = this.physics.add.group()
        this.generateBricks()

        // Inputs
        this.cursors = this.input.keyboard?.createCursorKeys()
        this.input.keyboard?.addKey('SPACE')

        // Collisions
        if (this.ball && this.paddle) {
          this.physics.add.collider(this.ball, this.paddle, () => this.handlePaddleHit())
        }
        if (this.ball && this.bricks) {
          this.physics.add.collider(this.ball, this.bricks, (_: any, brick: any) => this.handleBrickHit(_,brick))
        }

        // Show start message
        this.add.text(400, 300, 'PRESS SPACE TO LAUNCH', {
          fontSize: '24px',
          color: '#00ff88',
          fontFamily: 'Arial',
          align: 'center',
        }).setOrigin(0.5)

        this.gameActive = true
      }

      generateBricks() {
        if (!this.bricks) return

        const colors = [0xff0080, 0x00ffff, 0x00ff88, 0xffff00, 0xff6600]
        const rows = 3 + this.level
        const cols = 8

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * 90 + 50
            const y = row * 40 + 40

            const brickGraphics = this.make.graphics({ x: 0, y: 0 }, false)
            brickGraphics.fillStyle(colors[row % colors.length], 1)
            brickGraphics.fillRoundedRect(0, 0, 80, 30, 4)
            brickGraphics.lineStyle(2, 0x00ffff, 0.5)
            brickGraphics.strokeRoundedRect(0, 0, 80, 30, 4)
            brickGraphics.generateTexture(`brick${row}${col}`, 80, 30)
            brickGraphics.destroy()

            const brick = this.bricks.create(x, y, `brick${row}${col}`)
            brick.setImmovable(true)
            brick.setData('health', 1 + Math.floor(row / 2))
          }
        }
      }

      handlePaddleHit() {
        if (!this.ball || !this.paddle) return

        const diff = this.ball.x - this.paddle.x
        this.ball.setVelocityX(8 * diff)

        // Add particles on hit
        this.createParticles(this.ball.x, this.ball.y, '#00ffff')
      }

      handleBrickHit(_ball: any, brick: any) {
        if (!this.ball) return

        brick.setData('health', brick.getData('health') - 1)

        if (brick.getData('health') <= 0) {
          this.createParticles(brick.x, brick.y, brick.texture.key)
          brick.destroy()
          this.score += 100
          setScore(this.score)

          if (this.bricks && this.bricks.children.size === 0) {
            this.levelUp()
          }
        }

        if (this.ball.body) {
          this.ball.setVelocityY(-Math.abs(this.ball.body.velocity.y))
        }
      }

      createParticles(x: number, y: number, color: string) {
        const particles = this.add.particles(0x00ffff)
        particles.emitParticleAt(x, y, 10)

        this.time.delayedCall(500, () => particles.destroy())
      }

      levelUp() {
        this.level++
        setLevel(this.level)
        this.score += 1000
        setScore(this.score)
        setGameState('levelComplete')
        this.gameActive = false

        this.time.delayedCall(2000, () => {
          this.scene.restart()
          setGameState('playing')
        })
      }

      handleGameOver() {
        this.health--
        if (this.health <= 0) {
          setGameState('gameOver')
          this.gameActive = false
        } else {
          this.ball?.setPosition(400, 500)
          this.ball?.setData('onPaddle', true)
          this.ball?.setVelocity(0, 0)
        }
      }

      update() {
        if (!this.gameActive || !this.ball || !this.paddle) return

        // Paddle control
        if (this.cursors?.left.isDown) {
          this.paddle.setVelocityX(-400)
        } else if (this.cursors?.right.isDown) {
          this.paddle.setVelocityX(400)
        } else {
          this.paddle.setVelocityX(0)
        }

        // Ball on paddle
        if (this.ball.getData('onPaddle')) {
          this.ball.x = this.paddle.x
          this.ball.y = this.paddle.y - 20

          const spaceKey = this.input.keyboard?.addKey('SPACE')
          if (spaceKey?.isDown) {
            this.ball.setData('onPaddle', false)
            this.ball.setVelocity(Phaser.Math.Between(-300, 300), -400)
          }
        }

        // Ball out of bounds
        if (this.ball.y > 600) {
          this.handleGameOver()
        }
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: 800,
      height: 600,
      backgroundColor: '#0a0a1a',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: BreakoutScene,
    }

    gameRef.current = new Phaser.Game(config)

    return () => {
      if (gameRef.current) {
        try {
          gameRef.current.destroy(true)
        } catch (e) {}
        gameRef.current = null
      }
      gameInitializedRef.current = false
    }
  }, [])

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.scene.start('BreakoutScene')
      setScore(0)
      setLevel(1)
      setGameState('playing')
    }
  }

  const handleQuit = () => {
    if (gameRef.current) gameRef.current.destroy(true)
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
      <div id="breakout-container" ref={gameContainerRef} style={{ width: '800px', height: '600px', border: '2px solid #00ffff' }} />

      {/* HUD */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #00ff88',
          borderRadius: '12px',
          padding: '16px 24px',
          backdropFilter: 'blur(10px)',
          zIndex: 100,
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#00ff88', fontWeight: '700' }}>🎮 Breakout Arcade</h3>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#888' }}>Score: {score}</p>
        <p style={{ margin: '0', fontSize: '12px', color: '#00ffff' }}>Level: {level}</p>
      </div>

      {/* Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #ff00ff',
          borderRadius: '12px',
          padding: '12px 20px',
          backdropFilter: 'blur(10px)',
          fontSize: '12px',
          color: '#aaa',
          zIndex: 100,
        }}
      >
        ← → Move Paddle • SPACE Launch Ball • Destroy all bricks!
      </div>

      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(10, 10, 26, 0.98)',
            border: '2px solid #ff4444',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            backdropFilter: 'blur(15px)',
            zIndex: 200,
            minWidth: '300px',
          }}
        >
          <h2 style={{ margin: '0 0 16px 0', fontSize: '32px', color: '#ff4444', fontWeight: '700' }}>Game Over</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#fff', fontWeight: 'bold' }}>Final Score: {score}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleRestart} style={{ padding: '10px 24px', backgroundColor: '#00ff88', color: '#0a0a1a', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              Restart
            </button>
            <button onClick={handleQuit} style={{ padding: '10px 24px', backgroundColor: '#ff4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              Quit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
