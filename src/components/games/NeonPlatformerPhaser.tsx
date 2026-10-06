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
      score = 0
      level = 1
      cursors: any = null
      canJump = true
      spacePressed = false

      constructor() {
        super({ key: 'NeonPlatformerScene' })
      }

      create() {
        this.cameras.main.setBackgroundColor('#0a0a1a')

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

        // Input
        this.cursors = this.input.keyboard?.createCursorKeys()
        this.input.keyboard?.addKey('SPACE')

        // Collisions
        if (this.player) {
          this.physics.add.collider(this.player, this.platforms, () => {
            this.canJump = true
          })
        }

        this.physics.add.overlap(this.player, this.coins, (player: any, coin: any) => {
          this.handleCoinPickup(coin)
        })

        this.physics.add.overlap(this.player, this.enemies, () => {
          this.handleEnemyCollision()
        })
      }

      createPlayerShip() {
        // Create cyan player sprite
        const graphics = this.make.graphics({ x: 0, y: 0 }, false)
        graphics.fillStyle(0x00ffff, 1)
        graphics.fillRect(0, 0, 30, 40)
        graphics.fillStyle(0x0088ff, 1)
        graphics.fillCircle(15, 10, 6)
        graphics.generateTexture('playerShip', 30, 40)
        graphics.destroy()

        this.player = this.physics.add.sprite(100, 400, 'playerShip')
        this.player.setBounce(0)
        this.player.setCollideWorldBounds(true)
      }

      generateLevel() {
        if (!this.platforms) return

        // Ground
        const groundGraphics = this.make.graphics({ x: 0, y: 0 }, false)
        groundGraphics.fillStyle(0x00ff88, 1)
        groundGraphics.fillRect(0, 0, 800, 16)
        groundGraphics.lineStyle(2, 0x00ffff, 1)
        groundGraphics.strokeRect(0, 0, 800, 16)
        groundGraphics.generateTexture('ground', 800, 16)
        groundGraphics.destroy()

        this.platforms.create(400, 568, 'ground').setScale(1).refreshBody()

        // Procedural platforms - increasing difficulty per level
        const platformCount = 5 + this.level * 2
        let currentX = 100
        let currentY = 480

        for (let i = 0; i < platformCount; i++) {
          const platformWidth = 80 + Math.random() * 40

          // Draw neon platform with gradient effect
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

          currentX += platformWidth + 40 + Math.random() * 60
          currentY -= 60 + Math.random() * 40

          if (currentX > 700) {
            currentX = 100
            currentY -= 80
          }
        }
      }

      generateCoins() {
        if (!this.coins) return

        for (let i = 0; i < 10 + this.level * 3; i++) {
          const x = Phaser.Math.Between(50, 750)
          const y = Phaser.Math.Between(80, 500)

          const coinGraphics = this.make.graphics({ x: 0, y: 0 }, false)
          coinGraphics.fillStyle(0xffff00, 1)
          coinGraphics.fillCircle(6, 6, 6)
          coinGraphics.lineStyle(1, 0xffd700, 1)
          coinGraphics.strokeCircle(6, 6, 6)
          coinGraphics.generateTexture('coin', 12, 12)
          coinGraphics.destroy()

          const coin = this.coins.create(x, y, 'coin')
          coin.setBounce(0.5)
          coin.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-100, 0))
        }
      }

      generateEnemies() {
        if (!this.enemies) return

        const enemyCount = 2 + this.level
        for (let i = 0; i < enemyCount; i++) {
          const x = Phaser.Math.Between(100, 700)
          const y = Phaser.Math.Between(100, 400)

          const enemyGraphics = this.make.graphics({ x: 0, y: 0 }, false)
          enemyGraphics.fillStyle(0xff00ff, 1)
          enemyGraphics.fillCircle(10, 10, 8)
          enemyGraphics.lineStyle(2, 0xff88ff, 1)
          enemyGraphics.strokeCircle(10, 10, 8)
          enemyGraphics.generateTexture('enemy', 20, 20)
          enemyGraphics.destroy()

          const enemy = this.enemies.create(x, y, 'enemy')
          enemy.setBounce(1)
          enemy.setCollideWorldBounds(true)
          enemy.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-50, 50))
        }
      }

      handleCoinPickup(coin: any) {
        coin.destroy()
        this.score += 10
        setScore(this.score)

        if (this.coins && this.coins.children.size === 0) {
          this.levelUp()
        }
      }

      handleEnemyCollision() {
        this.score = Math.max(0, this.score - 50)
        setScore(this.score)
        this.player?.setPosition(100, 400)
      }

      levelUp() {
        this.level++
        setLevel(this.level)
        this.scene.restart()
      }

      update() {
        if (!this.player) return

        // Horizontal movement
        this.player.setVelocityX(0)

        if (this.cursors?.left.isDown) {
          this.player.setVelocityX(-300)
        } else if (this.cursors?.right.isDown) {
          this.player.setVelocityX(300)
        }

        // Jump (space or up)
        const spaceKey = this.input.keyboard?.addKey('SPACE')
        if ((this.cursors?.up.isDown || spaceKey?.isDown) && this.canJump) {
          this.player.setVelocityY(-400)
          this.canJump = false
        }

        // Reset jump when not pressing
        if (!this.cursors?.up.isDown && !spaceKey?.isDown) {
          this.canJump = false
        }

        // Respawn if fall off
        if (this.player.y > 600) {
          this.player.setPosition(100, 400)
          this.score = Math.max(0, this.score - 25)
          setScore(this.score)
        }

        // Update enemies
        if (this.enemies) {
          Array.from(this.enemies.children).forEach((enemy: any) => {
            if (enemy && (enemy.x < 50 || enemy.x > 750)) {
              enemy.setVelocityX(-enemy.body.velocity.x)
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
          gravity: { x: 0, y: 300 },
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
        ← → Move • SPACE/↑ Jump • Collect coins!
      </div>
    </div>
  )
}
