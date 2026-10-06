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
      particles: Phaser.GameObjects.Particles.ParticleEmitter | null = null
      score = 0
      health = 100
      wave = 1
      enemyCount = 0

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
          const brightness = Phaser.Math.Between(100, 255)
          this.add
            .circle(x, y, size, Phaser.Display.Color.GetColor(brightness, brightness, brightness))
            .setDepth(-2)
        }

        // Player ship (neon triangle)
        this.player = this.physics.add.sprite(400, 550, undefined)
        this.drawNeonPlayer()
        this.player.setCollideWorldBounds(true)
        this.player.setData('health', 100)

        // Bullets
        this.bullets = this.physics.add.group()

        // Enemies
        this.enemies = this.physics.add.group()

        // Particles
        const graphics = this.make.graphics({ x: 0, y: 0 } as any)
        graphics.fillStyle(0x00ffff, 1)
        graphics.fillCircle(4, 4, 4)
        ;(graphics as any).generateTexture('particle', 8, 8)
        graphics.destroy()

        const particleConfig = {
          speed: { min: -200, max: 200 },
          angle: { min: 240, max: 300 },
          scale: { start: 1, end: 0 },
          lifespan: 600,
          gravityY: 300,
        }
        this.particles = this.add.particles('particle')
        this.particles.createEmitter(particleConfig)

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

        // Input
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
          if (event.key === ' ' || event.key.toLowerCase() === 'w') {
            this.shoot()
          }
        })
      }

      drawNeonPlayer() {
        if (!this.player) return
        const graphics = this.make.graphics({ x: 0, y: 0 } as any)
        graphics.fillStyle(0x00ffff, 1)
        graphics.beginPath()
        graphics.moveTo(15, 0)
        graphics.lineTo(0, 30)
        graphics.lineTo(30, 30)
        graphics.closePath()
        graphics.fillPath()
        graphics.strokePath()
        ;(graphics as any).generateTexture('player_ship', 30, 30)
        graphics.destroy()
        this.player.setTexture('player_ship')
      }

      spawnEnemy() {
        if (!this.enemies || this.enemies.children.size > 15) return

        const x = Phaser.Math.Between(50, 750)
        const y = Phaser.Math.Between(-100, -20)
        const enemy = this.enemies.create(x, y, undefined)

        // Neon enemy (square)
        const enemyGraphics = this.make.graphics({ x: 0, y: 0 } as any)
        enemyGraphics.fillStyle(0xff00ff, 1)
        enemyGraphics.fillRect(0, 0, 20, 20)
        ;(enemyGraphics as any).generateTexture('enemy', 20, 20)
        enemyGraphics.destroy()

        enemy.setTexture('enemy')
        enemy.setVelocityY(150 + this.wave * 30)
        enemy.setData('health', 1)
        this.enemyCount++
      }

      shoot() {
        if (!this.player || !this.bullets) return

        const bullet = this.bullets.create(this.player.x, this.player.y - 20, undefined)

        // Neon bullet
        const bulletGraphics = this.make.graphics({ x: 0, y: 0 } as any)
        bulletGraphics.fillStyle(0x00ff88, 1)
        bulletGraphics.fillCircle(3, 3, 3)
        ;(bulletGraphics as any).generateTexture('bullet', 6, 6)
        bulletGraphics.destroy()

        bullet.setTexture('bullet')
        bullet.setVelocityY(-400)

        // Particle burst
        if (this.particles) {
          this.particles.emitParticleAt(this.player.x, this.player.y, 5)
        }
      }

      handleBulletHit(bullet: any, enemy: any) {
        if (bullet) bullet.destroy()
        if (enemy) {
          enemy.destroy()
          this.score += 10
          setScore(this.score)
          this.enemyCount--

          // Particle explosion
          if (this.particles) {
            this.particles.emitParticleAt(enemy.x, enemy.y, 20)
          }

          // Wave progression
          if (this.enemyCount === 0 && this.enemies && this.enemies.children.size === 0) {
            this.wave++
          }
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
        if (!this.player) return

        // Player movement
        const cursors = this.input.keyboard?.createCursorKeys()
        if (cursors?.left.isDown || this.input.keyboard?.addKey('A').isDown) {
          this.player.setVelocityX(-300)
        } else if (cursors?.right.isDown || this.input.keyboard?.addKey('D').isDown) {
          this.player.setVelocityX(300)
        } else {
          this.player.setVelocityX(0)
        }

        // Remove off-screen bullets
        if (this.bullets) {
          Array.from(this.bullets.children).forEach((bullet: any) => {
            if (bullet.y < -50) bullet.destroy()
          })
        }

        // Remove off-screen enemies
        if (this.enemies) {
          Array.from(this.enemies.children).forEach((enemy: any) => {
            if (enemy.y > 650) enemy.destroy()
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
      <div id="neon-shooter-container" ref={gameContainerRef} style={{ width: '800px', height: '600px' }} />

      {/* HUD Overlay */}
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
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#00ff88', fontWeight: '700' }}>
          💥 Neon Space Shooter
        </h3>
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
        ← → Move • SPACE Shoot • Destroy all enemies!
      </div>

      {/* Game Over Screen */}
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
            <button
              onClick={handleRestart}
              style={{
                padding: '10px 24px',
                backgroundColor: '#00ff88',
                color: '#0a0a1a',
                border: 'none',
                borderRadius: '8px',
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
                backgroundColor: '#ff4444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
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
    </div>
  )
}
