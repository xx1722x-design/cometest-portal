import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'

export function CatchGamePhaser() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const gameInitialized = useRef(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    // 🔥 React Strict Mode fix: only initialize once, even if useEffect runs twice
    if (gameInitialized.current || !gameContainerRef.current) return

    gameInitialized.current = true
      class CatchScene extends Phaser.Scene {
        basket!: Phaser.Physics.Arcade.Sprite
        fruits!: Phaser.Physics.Arcade.Group
        currentScore = 0
        gameOverFlag = false
        spawnTimer?: Phaser.Time.TimerEvent

        constructor() {
          super({ key: 'CatchScene' })
        }

        create() {
          // Set background color explicitly
          this.cameras.main.setBackgroundColor('#1e293b')

          // Create basket texture
          const basketCanvas = this.textures.createCanvas('basket', 80, 20)
          const ctx = basketCanvas?.getContext()
          if (ctx) {
            ctx.fillStyle = '#60a5fa'
            ctx.fillRect(0, 0, 80, 20)
          }
          basketCanvas?.refresh()

          // Basket
          this.basket = this.physics.add.sprite(400, 550, 'basket')
          this.basket.setCollideWorldBounds(true)
          this.basket.setBounce(0)

          // Fruits group
          this.fruits = this.physics.add.group()

          // Collision
          this.physics.add.overlap(this.basket, this.fruits, this.collectFruit, undefined, this)

          // Mouse follow
          this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            this.basket.x = Phaser.Math.Clamp(pointer.x, 40, 760)
          })

          // Spawn fruits
          this.spawnTimer = this.time.addEvent({
            delay: 1500,
            callback: this.spawnFruit,
            callbackScope: this,
            loop: true,
          })
        }

        update() {
          if (this.gameOverFlag) return

          // Check for fallen fruits
          const entries = (this.fruits.children as any).entries || []
          entries.forEach((fruit: any) => {
            if (fruit.y > 650) {
              this.gameOverFlag = true
              this.physics.pause()
              setGameOver(true)
            }
          })
        }

        spawnFruit() {
          if (this.gameOverFlag) return

          const x = Phaser.Math.Between(50, 750)
          const colors = ['#ef4444', '#f59e0b', '#10b981', '#60a5fa', '#a855f7']
          const color = Phaser.Utils.Array.GetRandom(colors)
          const textureKey = `fruit_${Date.now()}_${Math.random()}`

          // Create fruit texture
          const fruitCanvas = this.textures.createCanvas(textureKey, 16, 16)
          const ctx = fruitCanvas?.getContext()
          if (ctx) {
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(8, 8, 8, 0, Math.PI * 2)
            ctx.fill()
          }
          fruitCanvas?.refresh()

          const fruit = this.fruits.create(x, -20, textureKey) as Phaser.Physics.Arcade.Sprite
          fruit.setVelocityY(Phaser.Math.Between(150, 250))
          fruit.setVelocityX(Phaser.Math.Between(-50, 50))
        }

        collectFruit(basket: any, fruit: any) {
          (fruit as Phaser.Physics.Arcade.Sprite).destroy()
          this.currentScore += 10
          setScore(this.currentScore)

          // Feedback
          this.tweens.add({
            targets: basket,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 100,
            yoyo: true,
          })
        }
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameContainerRef.current as HTMLElement,
        width: 800,
        height: 600,
        backgroundColor: '#1e293b',
        transparent: false,
        physics: {
          default: 'arcade',
          arcade: { gravity: { x: 0, y: 300 }, debug: false },
        },
        scene: CatchScene,
      }

      gameRef.current = new Phaser.Game(config)
    }

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
      try {
        gameRef.current.scene.start('CatchScene')
        setScore(0)
        setGameOver(false)
      } catch (e) {
        console.error('Error restarting scene:', e)
      }
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
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a1a', fontFamily: "'Segoe UI', sans-serif", color: '#fff', position: 'relative' }}>
      <div id="catch-game-container" ref={gameContainerRef} style={{ width: '800px', height: '600px' }} />

      <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(10, 10, 26, 0.95)', border: '2px solid #ff8c42', borderRadius: '12px', padding: '16px 24px', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)', zIndex: 100 }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#ff8c42', fontWeight: '700' }}>🎮 Catch Game</h3>
        <p style={{ margin: '4px 0', fontSize: '20px', fontWeight: 'bold', color: '#60a5fa' }}>Score: {score}</p>
      </div>

      {gameOver && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(10, 10, 26, 0.98)', border: '2px solid #ef4444', borderRadius: '16px', padding: '40px', textAlign: 'center', backdropFilter: 'blur(15px)', zIndex: 200, minWidth: '300px', boxShadow: '0 12px 48px rgba(239, 68, 68, 0.3)' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '32px', color: '#ef4444', fontWeight: '700' }}>Game Over</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '24px', color: '#fff', fontWeight: 'bold' }}>Final Score: {score}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleRestart} style={{ padding: '10px 24px', backgroundColor: '#60a5fa', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
              Restart
            </button>
            <button onClick={handleQuit} style={{ padding: '10px 24px', backgroundColor: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
              Quit
            </button>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: '20px', right: '20px', backgroundColor: 'rgba(10, 10, 26, 0.95)', border: '2px solid #ff8c42', borderRadius: '12px', padding: '16px 24px', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)', zIndex: 100 }}>
        <p style={{ margin: '0', fontSize: '12px', color: '#888' }}>🖱️ Move mouse to control basket</p>
      </div>
    </div>
  )
}
