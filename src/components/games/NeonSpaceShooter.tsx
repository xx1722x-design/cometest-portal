import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'

export function NeonSpaceShooter() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const gameInitialized = useRef(false)
  const [score, setScore] = useState(0)
  const [health, setHealth] = useState(100)

  useEffect(() => {
    if (gameInitialized.current || !gameContainerRef.current) return
    gameInitialized.current = true

    class NeonShooterScene extends Phaser.Scene {
      player: Phaser.Physics.Arcade.Sprite | null = null
      bullets: Phaser.Physics.Arcade.Group | null = null
      enemies: Phaser.Physics.Arcade.Group | null = null
      exhaustEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null
      score = 0
      health = 100
      wave = 1
      enemyCount = 0
      lastShootTime = 0

      constructor() {
        super({ key: 'NeonShooterScene' })
      }

      create() {
        this.cameras.main.setBackgroundColor('#0a0a1a')

        // Parallax starfield
        for (let i = 0; i < 200; i++) {
          const x = Phaser.Math.Between(0, 800)
          const y = Phaser.Math.Between(0, 600)
          const size = Phaser.Math.Between(1, 3)
          this.add.circle(x, y, size, 0xffffff).setDepth(-2)
        }

        // Create player spaceship texture - upward-facing fighter jet
        this.createPlayerShipTexture()

        // Player sprite with cyan fighter ship
        this.player = this.physics.add.sprite(400, 550, 'playerShip')
        this.player.setDisplaySize(50, 50)
        this.player.setCollideWorldBounds(true)
        this.player.setBounce(0, 0)
        this.player.setDepth(1)

        // Engine exhaust particles
        const particleGraphics = this.make.graphics({ x: 0, y: 0 }, false)
        particleGraphics.fillStyle(0x00ffff, 0.8)
        particleGraphics.fillCircle(2, 2, 2)
        particleGraphics.generateTexture('exhaust', 4, 4)
        particleGraphics.destroy()

        const particles = this.add.particles('exhaust')
        this.exhaustEmitter = particles.createEmitter({
          speed: { min: -50, max: 50 },
          angle: { min: 220, max: 320 },
          scale: { start: 0.8, end: 0 },
          lifespan: 400,
          gravityY: 100,
          emitZone: { type: 'rectangle', source: new Phaser.Geom.Rectangle(400, 550, 50, 50) },
        })

        // Bullets
        this.bullets = this.physics.add.group()

        // Enemies
        this.enemies = this.physics.add.group()

        // Create enemy ship texture - downward-facing alien
        this.createEnemyShipTexture()

        // Physics collisions
        this.physics.add.overlap(this.bullets, this.enemies, (bullet: any, enemy: any) => {
          this.handleBulletHit(bullet, enemy)
        })

        this.physics.add.overlap(this.player, this.enemies, (player: any, enemy: any) => {
          this.handlePlayerHit(player, enemy)
        })

        // Spawn enemies
        this.time.addEvent({
          delay: 1000,
          callback: () => this.spawnEnemy(),
          loop: true,
        })
      }

      createPlayerShipTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0 }, false)

        // Upward-facing fighter jet in cyan
        graphics.fillStyle(0x00ffff, 1)

        // Main hull (triangle pointing up)
        graphics.beginPath()
        graphics.moveTo(25, 5) // Tip
        graphics.lineTo(10, 45) // Bottom left
        graphics.lineTo(40, 45) // Bottom right
        graphics.closePath()
        graphics.fillPath()

        // Cockpit (small circle)
        graphics.fillStyle(0x0088ff, 1)
        graphics.fillCircle(25, 15, 4)

        // Wing details (lines)
        graphics.strokeStyle(0x00ff88, 2, 1)
        graphics.beginPath()
        graphics.moveTo(15, 25)
        graphics.lineTo(35, 25)
        graphics.strokePath()

        graphics.generateTexture('playerShip', 50, 50)
        graphics.destroy()
      }

      createEnemyShipTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0 }, false)

        // Downward-facing alien ship in magenta
        graphics.fillStyle(0xff00ff, 1)

        // Main hull (inverted triangle pointing down)
        graphics.beginPath()
        graphics.moveTo(15, 5) // Top left
        graphics.lineTo(35, 5) // Top right
        graphics.lineTo(25, 45) // Bottom point
        graphics.closePath()
        graphics.fillPath()

        // Alien eye (circle)
        graphics.fillStyle(0xffff00, 1)
        graphics.fillCircle(25, 20, 3)

        // Tentacle-like protrusions
        graphics.strokeStyle(0xff88ff, 2, 1)
        graphics.beginPath()
        graphics.moveTo(10, 15)
        graphics.quadraticCurveTo(5, 25, 8, 35)
        graphics.strokePath()

        graphics.beginPath()
        graphics.moveTo(40, 15)
        graphics.quadraticCurveTo(45, 25, 42, 35)
        graphics.strokePath()

        graphics.generateTexture('enemyShip', 50, 50)
        graphics.destroy()
      }

      spawnEnemy() {
        if (!this.enemies || this.enemies.children.size > 15) return

        const x = Phaser.Math.Between(50, 750)
        const y = Phaser.Math.Between(-50, -20)

        const enemy = this.enemies.create(x, y, 'enemyShip') as Phaser.Physics.Arcade.Sprite
        enemy.setDisplaySize(50, 50)
        enemy.setVelocityY(200 + this.wave * 30)
        enemy.setDepth(1)
        this.enemyCount++
      }

      shoot() {
        if (!this.player || !this.bullets || this.lastShootTime + 150 > Date.now()) return
        this.lastShootTime = Date.now()

        // Create bullet graphics (green energy ball)
        const bulletGraphics = this.make.graphics({ x: 0, y: 0 }, false)
        bulletGraphics.fillStyle(0x00ff88, 1)
        bulletGraphics.fillCircle(5, 5, 5)
        bulletGraphics.strokeStyle(0x00ffff, 1, 1)
        bulletGraphics.strokeCircleShape(new Phaser.Geom.Circle(5, 5, 5))
        bulletGraphics.generateTexture('bullet', 10, 10)
        bulletGraphics.destroy()

        const bullet = this.bullets.create(this.player.x + 5, this.player.y - 30, 'bullet') as Phaser.Physics.Arcade.Sprite
        bullet.setDisplaySize(15, 15)
        bullet.setVelocityY(-500)
        bullet.setDepth(1)
      }

      handleBulletHit(bullet: any, enemy: any) {
        if (bullet) bullet.destroy()
        if (enemy) {
          enemy.destroy()
          this.score += 10
          setScore(this.score)
          this.enemyCount--
        }
      }

      handlePlayerHit(player: any, enemy: any) {
        this.health -= 10
        setHealth(Math.max(0, this.health))
        if (enemy) enemy.destroy()

        if (this.health <= 0) {
          this.scene.restart()
          this.score = 0
          this.health = 100
          this.wave = 1
          setScore(0)
          setHealth(100)
        }
      }

      update() {
        if (!this.player || !this.exhaustEmitter) return

        const cursors = this.input.keyboard?.createCursorKeys()
        const aKey = this.input.keyboard?.addKey('A')
        const dKey = this.input.keyboard?.addKey('D')
        const spaceKey = this.input.keyboard?.addKey('SPACE')

        // Reset velocity
        this.player.setVelocityX(0)

        // Move left/right
        if (cursors?.left.isDown || aKey?.isDown) {
          this.player.setVelocityX(-300)
        } else if (cursors?.right.isDown || dKey?.isDown) {
          this.player.setVelocityX(300)
        }

        // Update exhaust emitter position
        this.exhaustEmitter.emitZoneData.source.setPosition(this.player.x - 25, this.player.y + 20)

        // Shoot on space
        if (spaceKey?.isDown) {
          this.shoot()
        }

        // Clean up off-screen bullets
        if (this.bullets) {
          Array.from(this.bullets.children).forEach((bullet: any) => {
            if (bullet && bullet.y < -50) {
              bullet.destroy()
            }
          })
        }

        // Clean up off-screen enemies
        if (this.enemies) {
          Array.from(this.enemies.children).forEach((enemy: any) => {
            if (enemy && enemy.y > 650) {
              enemy.destroy()
              this.enemyCount--
            }
          })
        }
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current as HTMLElement,
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
      scene: NeonShooterScene,
    }

    gameRef.current = new Phaser.Game(config)

    return () => {
      if (gameRef.current) {
        try {
          gameRef.current.destroy(true)
        } catch (e) {}
        gameRef.current = null
      }
      gameInitialized.current = false
    }
  }, [])

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.scene.start('NeonShooterScene')
      setScore(0)
      setHealth(100)
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
      <div id="neon-shooter-container" ref={gameContainerRef} style={{ width: '800px', height: '600px', border: '2px solid #00ffff' }} />

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
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#00ff88', fontWeight: '700' }}>💥 Neon Space Shooter</h3>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#888' }}>Score: {score}</p>
        <p style={{ margin: '0', fontSize: '12px', color: health > 30 ? '#00ff88' : '#ff4444' }}>Health: {health}%</p>
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
        ← → Move • SPACE Shoot • Destroy enemies!
      </div>

      {/* Game Over */}
      {health === 0 && (
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
