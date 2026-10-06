import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'

export function NeonPlatformerPhaser() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const gameInitialized = useRef(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)

  useEffect(() => {
    if (gameInitialized.current || !gameContainerRef.current) return
    gameInitialized.current = true

    class NeonPlatformerScene extends Phaser.Scene {
      player: Phaser.Physics.Arcade.Sprite | null = null
      platforms: Phaser.Physics.Arcade.StaticGroup | null = null
      enemies: Phaser.Physics.Arcade.Group | null = null
      coins: Phaser.Physics.Arcade.Group | null = null
      portal: Phaser.Physics.Arcade.Sprite | null = null
      score = 0
      level = 1
      cursors: any = null
      isJumping = false
      coinsCollected = 0

      constructor() {
        super({ key: 'NeonPlatformerScene' })
      }

      create() {
        this.cameras.main.setBackgroundColor('#0a0a1a')

        // HUGE WORLD: Set physics world bounds for scrolling
        this.physics.world.setBounds(0, 0, 2000, 3000)

        // Create procedural level
        this.platforms = this.physics.add.staticGroup()
        this.generateLevel()

        // Player
        this.createPlayerShip()

        // Coins
        this.coins = this.physics.add.group()
        this.generateCoins()

        // Enemies
        this.enemies = this.physics.add.group()
        this.generateEnemies()

        // Portal at the top
        this.createPortal()

        // Camera follows player
        if (this.player) {
          this.cameras.main.startFollow(this.player)
          this.cameras.main.setBounds(0, 0, 2000, 3000)
        }

        // Input
        this.cursors = this.input.keyboard?.createCursorKeys()
        this.input.keyboard?.addKey('SPACE')

        // Collisions
        if (this.player && this.platforms) {
          this.physics.add.collider(this.player, this.platforms, () => {
            this.isJumping = false
          })
        }

        if (this.player && this.coins) {
          this.physics.add.overlap(this.player, this.coins, (_: any, coin: any) => {
            this.handleCoinPickup(coin)
          })
        }

        if (this.player && this.enemies) {
          this.physics.add.overlap(this.player, this.enemies, () => {
            this.handleEnemyCollision()
          })
        }

        if (this.player && this.portal) {
          this.physics.add.overlap(this.player, this.portal, () => {
            this.levelUp()
          })
        }
      }

      createPlayerShip() {
        // Create cyan player sprite
        const graphics = this.make.graphics({ x: 0, y: 0 }, false)
        graphics.fillStyle(0x00ffff, 1)
        graphics.fillRect(0, 0, 24, 32)
        graphics.fillStyle(0x0088ff, 1)
        graphics.fillCircle(12, 8, 5)
        graphics.generateTexture('playerShip', 24, 32)
        graphics.destroy()

        this.player = this.physics.add.sprite(100, 2800, 'playerShip')
        this.player.setBounce(0)
        this.player.setCollideWorldBounds(true)
      }

      createPortal() {
        // Glowing portal at top
        const portalGraphics = this.make.graphics({ x: 0, y: 0 }, false)
        portalGraphics.fillStyle(0xff00ff, 1)
        portalGraphics.fillCircle(24, 24, 20)
        portalGraphics.lineStyle(3, 0x00ffff, 1)
        portalGraphics.strokeCircle(24, 24, 20)
        portalGraphics.lineStyle(2, 0xffff00, 1)
        portalGraphics.strokeCircle(24, 24, 12)
        portalGraphics.generateTexture('portal', 48, 48)
        portalGraphics.destroy()

        this.portal = this.physics.add.sprite(1000, 100, 'portal')
        this.portal.setImmovable(true)
      }

      generateLevel() {
        if (!this.platforms) return

        // Ground
        const groundGraphics = this.make.graphics({ x: 0, y: 0 }, false)
        groundGraphics.fillStyle(0x00ff88, 1)
        groundGraphics.fillRect(0, 0, 2000, 20)
        groundGraphics.lineStyle(2, 0x00ffff, 1)
        groundGraphics.strokeRect(0, 0, 2000, 20)
        groundGraphics.generateTexture('ground', 2000, 20)
        groundGraphics.destroy()

        this.platforms.create(1000, 2920, 'ground').setScale(1).refreshBody()

        // Procedural climbing platforms - UPWARD progression
        const platformCount = 20 + this.level * 5
        let currentX = 500
        let currentY = 2750
        const platformWidth = 80

        for (let i = 0; i < platformCount; i++) {
          const platformGraphics = this.make.graphics({ x: 0, y: 0 }, false)
          platformGraphics.fillStyle(0x00ff88, 1)
          platformGraphics.fillRect(0, 0, platformWidth, 16)
          platformGraphics.lineStyle(2, 0x00ffff, 1)
          platformGraphics.strokeRect(0, 0, platformWidth, 16)
          platformGraphics.generateTexture(`platform${i}`, platformWidth, 16)
          platformGraphics.destroy()

          const platform = this.platforms.create(currentX, currentY, `platform${i}`)
          platform.setScale(1)
          platform.refreshBody()

          // Zig-zag pattern upward
          if (i % 2 === 0) {
            currentX = Phaser.Math.Between(200, 600)
          } else {
            currentX = Phaser.Math.Between(1200, 1800)
          }
          currentY -= 80 + Math.random() * 40
        }
      }

      generateCoins() {
        if (!this.coins) return

        const coinCount = 15 + this.level * 5
        for (let i = 0; i < coinCount; i++) {
          const x = Phaser.Math.Between(200, 1800)
          const y = Phaser.Math.Between(500, 2800)

          const coinGraphics = this.make.graphics({ x: 0, y: 0 }, false)
          coinGraphics.fillStyle(0xffff00, 1)
          coinGraphics.fillCircle(6, 6, 6)
          coinGraphics.lineStyle(1, 0xffd700, 1)
          coinGraphics.strokeCircle(6, 6, 6)
          coinGraphics.generateTexture('coin', 12, 12)
          coinGraphics.destroy()

          const coin = this.coins.create(x, y, 'coin')
          coin.setBounce(0.3)
        }
      }

      generateEnemies() {
        if (!this.enemies) return

        const enemyCount = 3 + this.level
        for (let i = 0; i < enemyCount; i++) {
          const x = Phaser.Math.Between(200, 1800)
          const y = Phaser.Math.Between(500, 2500)

          const enemyGraphics = this.make.graphics({ x: 0, y: 0 }, false)
          enemyGraphics.fillStyle(0xff00ff, 1)
          enemyGraphics.fillRect(0, 0, 20, 20)
          enemyGraphics.fillStyle(0xffff00, 1)
          enemyGraphics.fillCircle(10, 8, 3)
          enemyGraphics.generateTexture('enemy', 20, 20)
          enemyGraphics.destroy()

          const enemy = this.enemies.create(x, y, 'enemy')
          enemy.setCollideWorldBounds(true)
          enemy.setBounce(1)
          enemy.setVelocityX(Phaser.Math.Between(80, 150) * (Math.random() > 0.5 ? 1 : -1))
        }
      }

      handleCoinPickup(coin: any) {
        coin.destroy()
        this.score += 10
        this.coinsCollected++
        setScore(this.score)
      }

      handleEnemyCollision() {
        this.score = Math.max(0, this.score - 50)
        setScore(this.score)
        if (this.player) {
          this.player.setPosition(100, 2800)
        }
      }

      levelUp() {
        this.level++
        setLevel(this.level)
        this.score += 500
        setScore(this.score)
        this.scene.restart()
      }

      update() {
        if (!this.player) return

        // Horizontal movement
        this.player.setVelocityX(0)

        if (this.cursors?.left.isDown) {
          this.player.setVelocityX(-250)
        } else if (this.cursors?.right.isDown) {
          this.player.setVelocityX(250)
        }

        // Jump
        const spaceKey = this.input.keyboard?.addKey('SPACE')
        if ((this.cursors?.up.isDown || spaceKey?.isDown) && !this.isJumping) {
          this.player.setVelocityY(-350)
          this.isJumping = true
        }

        // Respawn if fall off
        if (this.player.y > 3100) {
          this.score = Math.max(0, this.score - 25)
          setScore(this.score)
          this.player.setPosition(100, 2800)
          this.player.setVelocity(0, 0)
        }

        // Update enemies - patrol left/right
        if (this.enemies) {
          Array.from(this.enemies.children).forEach((enemy: any) => {
            if (enemy) {
              if (enemy.x < 250 || enemy.x > 1750) {
                enemy.setVelocityX(-enemy.body.velocity.x)
              }
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
          gravity: { x: 0, y: 320 },
          debug: false,
        },
      },
      scene: NeonPlatformerScene,
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
      <div id="neon-platformer-container" ref={gameContainerRef} style={{ width: '800px', height: '600px', border: '2px solid #00ffff' }} />

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
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#00ff88', fontWeight: '700' }}>🎮 Neon Platformer</h3>
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
        ← → Move • SPACE/↑ Jump • Climb to the portal!
      </div>
    </div>
  )
}
