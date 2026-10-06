import React, { useEffect, useRef } from 'react'
import Phaser from 'phaser'

export const NeonDodgePhaser: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameInstanceRef = useRef<Phaser.Game | null>(null)
  const gameInitializedRef = useRef(false)

  useEffect(() => {
    if (gameInitializedRef.current || !gameContainerRef.current) return
    gameInitializedRef.current = true

    const containerWidth = gameContainerRef.current.clientWidth
    const containerHeight = gameContainerRef.current.clientHeight

    class NeonDodgeScene extends Phaser.Scene {
      private player: Phaser.Physics.Arcade.Sprite | null = null
      private obstacles: Phaser.Physics.Arcade.Group | null = null
      private scoreText: Phaser.GameObjects.Text | null = null
      private startText: Phaser.GameObjects.Text | null = null
      private gameOverText: Phaser.GameObjects.Text | null = null
      private restartText: Phaser.GameObjects.Text | null = null
      private score = 0
      private gameRunning = false
      private spawnRate = 2000
      private obstacleSpeed = 300
      private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null
      private lastTrailTime = 0

      constructor() {
        super({ key: 'NeonDodgeScene' })
      }

      preload() {}

      create() {
        const centerX = this.cameras.main.width / 2
        const centerY = this.cameras.main.height / 2

        this.add
          .rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0a0a1a)
          .setOrigin(0, 0)

        // Player sprite - cyan circle
        const playerGraphics = this.make.graphics({ x: 0, y: 0 }, false)
        playerGraphics.fillStyle(0x00ffff, 1)
        playerGraphics.fillCircle(15, 15, 15)
        playerGraphics.generateTexture('player-sprite', 30, 30)
        playerGraphics.destroy()

        this.player = this.physics.add.sprite(centerX, this.cameras.main.height - 60, 'player-sprite')
        this.player.setCollideWorldBounds(true)
        this.player.setBounce(0)
        this.player.setMaxVelocity(400, 0)
        this.player.setBlendMode(Phaser.BlendModes.ADD)

        // Obstacles group
        this.obstacles = this.physics.add.group()

        // Score text
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
          fontSize: '32px',
          fontFamily: 'Arial, sans-serif',
          fontStyle: 'bold',
          color: '#00ffff',
          stroke: '#0066ff',
          strokeThickness: 2,
        })
        this.scoreText.setDepth(10)

        // Start screen
        this.startText = this.add
          .text(centerX, centerY - 60, 'NEON DODGE', {
            fontSize: '72px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ff00ff',
            stroke: '#00ffff',
            strokeThickness: 3,
          })
          .setOrigin(0.5, 0.5)
          .setDepth(10)

        this.add
          .text(centerX, centerY + 20, 'ARROW KEYS to MOVE • SPACE to START', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#00ffff',
          })
          .setOrigin(0.5, 0.5)
          .setDepth(10)

        this.add
          .text(centerX, centerY + 70, 'Dodge the falling neon obstacles!', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#aaaaaa',
          })
          .setOrigin(0.5, 0.5)
          .setDepth(10)

        // Game Over screen (hidden initially)
        this.gameOverText = this.add
          .text(centerX, centerY - 60, 'GAME OVER', {
            fontSize: '72px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ff0000',
            stroke: '#ffff00',
            strokeThickness: 3,
          })
          .setOrigin(0.5, 0.5)
          .setDepth(20)
          .setVisible(false)

        this.restartText = this.add
          .text(centerX, centerY + 60, 'CLICK TO RESTART', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ffff00',
          })
          .setOrigin(0.5, 0.5)
          .setDepth(20)
          .setVisible(false)

        // Input
        this.input.keyboard?.on('keydown-SPACE', () => {
          if (!this.gameRunning) {
            this.startGame()
          }
        })

        this.input.on('pointerdown', () => {
          if (!this.gameRunning && this.gameOverText?.visible) {
            this.scene.restart()
          }
        })

        // Arrow keys
        this.cursors = this.input.keyboard?.createCursorKeys() || null

        // Physics collision
        this.physics.add.overlap(this.player, this.obstacles, () => {
          if (this.gameRunning) {
            this.endGame()
          }
        })
      }

      startGame() {
        this.gameRunning = true
        this.score = 0
        this.spawnRate = 2000
        this.obstacleSpeed = 300

        if (this.startText) this.startText.setVisible(false)
        this.input.keyboard?.off('keydown-SPACE')

        this.time.addEvent({
          delay: this.spawnRate,
          callback: () => {
            if (this.gameRunning) {
              this.spawnObstacle()
              this.spawnRate = Math.max(800, this.spawnRate - 10)
              this.obstacleSpeed = Math.min(600, this.obstacleSpeed + 2)
            }
          },
          loop: true,
        })

        this.time.addEvent({
          delay: 100,
          callback: () => {
            if (this.gameRunning) {
              this.score += 1
              if (this.scoreText) this.scoreText.setText(`SCORE: ${this.score}`)
            }
          },
          loop: true,
        })
      }

      private spawnObstacle() {
        const spawnX = Phaser.Math.Between(40, this.cameras.main.width - 40)
        const obstacleGraphics = this.make.graphics({ x: 0, y: 0 }, false)
        obstacleGraphics.fillStyle(0xff00ff, 1)
        obstacleGraphics.fillRect(0, 0, 50, 20)
        obstacleGraphics.generateTexture('obstacle-sprite', 50, 20)
        obstacleGraphics.destroy()

        const obstacle = this.obstacles!.create(spawnX, -20, 'obstacle-sprite') as Phaser.Physics.Arcade.Sprite
        obstacle.setVelocityY(this.obstacleSpeed)
        obstacle.setBlendMode(Phaser.BlendModes.ADD)
        obstacle.setData('scored', false)

        this.time.delayedCall(3000, () => {
          if (obstacle && !obstacle.getData('scored') && this.gameRunning) {
            obstacle.destroy()
            this.score += 5
            if (this.scoreText) this.scoreText.setText(`SCORE: ${this.score}`)
          }
        })
      }

      endGame() {
        this.gameRunning = false

        if (this.player) {
          this.cameras.main.shake(300, 0.01)
          const expParticles = this.add.particles(0xff00ff)
          expParticles.emitParticleAt(this.player.x, this.player.y, 30)
          this.time.delayedCall(700, () => expParticles.destroy())
        }

        this.obstacles?.clear(true, true)

        if (this.gameOverText) {
          this.gameOverText.setText(`GAME OVER\nFINAL SCORE: ${this.score}`)
          this.gameOverText.setVisible(true)
        }
        if (this.restartText) this.restartText.setVisible(true)
      }

      update() {
        if (!this.gameRunning || !this.player || !this.cursors) return

        // Player movement
        this.player.setVelocityX(0)

        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-300)
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(300)
        }

        // Particle trail every 50ms
        if (this.time.now - this.lastTrailTime > 50) {
          const trailParticles = this.add.particles(0x00ffff)
          trailParticles.emitParticleAt(this.player.x, this.player.y, 1)
          this.time.delayedCall(300, () => trailParticles.destroy())
          this.lastTrailTime = this.time.now
        }

        // Remove off-screen obstacles
        if (this.obstacles) {
          const children = this.obstacles.getChildren()
          children.forEach((child: any) => {
            if (child.y > this.cameras.main.height + 50) {
              child.destroy()
            }
          })
        }
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: containerWidth,
      height: containerHeight,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 } as any,
          debug: false,
        },
      },
      scene: NeonDodgeScene,
      backgroundColor: '#0a0a1a',
      render: {
        pixelArt: false,
        antialias: true,
      },
    }

    gameInstanceRef.current = new Phaser.Game(config)

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true)
        gameInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={gameContainerRef}
      style={{
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        backgroundColor: '#0a0a1a',
      }}
    />
  )
}
