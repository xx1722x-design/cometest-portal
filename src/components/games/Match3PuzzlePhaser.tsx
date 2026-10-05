import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'

export function Match3PuzzlePhaser() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const gameInitialized = useRef(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    if (gameInitialized.current || !gameContainerRef.current) return
    gameInitialized.current = true

    class Match3Scene extends Phaser.Scene {
      grid: number[][] = []
      gridSize = 6
      tileSize = 50
      selectedTile: { x: number; y: number } | null = null
      currentScore = 0
      moveCount = 0
      matches: { x: number; y: number }[] = []

      constructor() {
        super({ key: 'Match3Scene' })
      }

      create() {
        this.cameras.main.setBackgroundColor('#0a0a1a')
        this.initializeGrid()
        this.renderGrid()

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          const x = Math.floor((pointer.x - 75) / this.tileSize)
          const y = Math.floor((pointer.y - 50) / this.tileSize)

          if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            if (this.selectedTile && this.isAdjacent(this.selectedTile, { x, y })) {
              this.swapTiles(this.selectedTile, { x, y })
              this.selectedTile = null
            } else {
              this.selectedTile = { x, y }
            }
            this.renderGrid()
          }
        })
      }

      initializeGrid() {
        for (let y = 0; y < this.gridSize; y++) {
          this.grid[y] = []
          for (let x = 0; x < this.gridSize; x++) {
            this.grid[y][x] = Phaser.Math.Between(0, 4)
          }
        }
      }

      renderGrid() {
        this.children.removeAll()
        for (let y = 0; y < this.gridSize; y++) {
          for (let x = 0; x < this.gridSize; x++) {
            const color = [0x60a5fa, 0xf59e0b, 0x10b981, 0xa855f7, 0xef4444][this.grid[y][x]]
            const rect = this.add.rectangle(
              75 + x * this.tileSize + this.tileSize / 2,
              50 + y * this.tileSize + this.tileSize / 2,
              this.tileSize - 4,
              this.tileSize - 4,
              color
            )
            rect.setInteractive()

            if (this.selectedTile && this.selectedTile.x === x && this.selectedTile.y === y) {
              rect.setStrokeStyle(3, 0xffffff)
            }
          }
        }
      }

      swapTiles(t1: { x: number; y: number }, t2: { x: number; y: number }) {
        ;[this.grid[t1.y][t1.x], this.grid[t2.y][t2.x]] = [this.grid[t2.y][t2.x], this.grid[t1.y][t1.x]]
        this.moveCount++
        this.detectMatches()
        this.removeMatches()
        this.dropTiles()
        this.fillGrid()
      }

      detectMatches() {
        this.matches = []
        for (let y = 0; y < this.gridSize; y++) {
          for (let x = 0; x < this.gridSize - 2; x++) {
            if (
              this.grid[y][x] === this.grid[y][x + 1] &&
              this.grid[y][x] === this.grid[y][x + 2]
            ) {
              this.matches.push({ x, y }, { x: x + 1, y }, { x: x + 2, y })
            }
          }
        }

        for (let x = 0; x < this.gridSize; x++) {
          for (let y = 0; y < this.gridSize - 2; y++) {
            if (
              this.grid[y][x] === this.grid[y + 1][x] &&
              this.grid[y][x] === this.grid[y + 2][x]
            ) {
              this.matches.push({ x, y }, { x, y: y + 1 }, { x, y: y + 2 })
            }
          }
        }
      }

      removeMatches() {
        const uniqueMatches = new Set(this.matches.map((m) => `${m.x},${m.y}`))
        uniqueMatches.forEach((key) => {
          const [x, y] = key.split(',').map(Number)
          this.grid[y][x] = -1
          this.currentScore += 10
          setScore(this.currentScore)

          const rect = this.add.rectangle(
            75 + x * this.tileSize + this.tileSize / 2,
            50 + y * this.tileSize + this.tileSize / 2,
            this.tileSize - 4,
            this.tileSize - 4,
            0xffff00
          )
          this.tweens.add({
            targets: rect,
            alpha: 0,
            scale: 0,
            duration: 300,
            onComplete: () => rect.destroy(),
          })
        })
      }

      dropTiles() {
        for (let x = 0; x < this.gridSize; x++) {
          let writeIndex = this.gridSize - 1
          for (let y = this.gridSize - 1; y >= 0; y--) {
            if (this.grid[y][x] !== -1) {
              this.grid[writeIndex][x] = this.grid[y][x]
              if (writeIndex !== y) this.grid[y][x] = -1
              writeIndex--
            }
          }
        }
      }

      fillGrid() {
        for (let y = 0; y < this.gridSize; y++) {
          for (let x = 0; x < this.gridSize; x++) {
            if (this.grid[y][x] === -1) {
              this.grid[y][x] = Phaser.Math.Between(0, 4)
            }
          }
        }
      }

      isAdjacent(t1: { x: number; y: number }, t2: { x: number; y: number }) {
        return Math.abs(t1.x - t2.x) + Math.abs(t1.y - t2.y) === 1
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current as HTMLElement,
      width: 400,
      height: 400,
      backgroundColor: '#0a0a1a',
      scene: Match3Scene,
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
      gameRef.current.scene.start('Match3Scene')
      setScore(0)
    }
  }

  const handleQuit = () => {
    if (gameRef.current) gameRef.current.destroy(true)
    window.location.href = '/game'
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a1a', fontFamily: "'Segoe UI', sans-serif", color: '#fff', position: 'relative' }}>
      <div id="match3-container" ref={gameContainerRef} style={{ width: '400px', height: '400px' }} />

      <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(10, 10, 26, 0.95)', border: '2px solid #60a5fa', borderRadius: '12px', padding: '16px 24px', backdropFilter: 'blur(10px)', zIndex: 100 }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#60a5fa', fontWeight: '700' }}>💎 Match-3 Puzzle</h3>
        <p style={{ margin: '0', fontSize: '20px', fontWeight: 'bold', color: '#60a5fa' }}>Score: {score}</p>
      </div>

      {gameOver && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(10, 10, 26, 0.98)', border: '2px solid #ef4444', borderRadius: '16px', padding: '40px', textAlign: 'center', backdropFilter: 'blur(15px)', zIndex: 200, minWidth: '300px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '32px', color: '#ef4444', fontWeight: '700' }}>Game Over</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '24px', color: '#fff', fontWeight: 'bold' }}>Final Score: {score}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleRestart} style={{ padding: '10px 24px', backgroundColor: '#60a5fa', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Restart</button>
            <button onClick={handleQuit} style={{ padding: '10px 24px', backgroundColor: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Quit</button>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: '20px', right: '20px', backgroundColor: 'rgba(10, 10, 26, 0.95)', border: '2px solid #60a5fa', borderRadius: '12px', padding: '16px 24px', backdropFilter: 'blur(10px)', zIndex: 100, fontSize: '12px', color: '#888' }}>
        Click tiles to select • Swap adjacent tiles • Match 3+ to score
      </div>
    </div>
  )
}
