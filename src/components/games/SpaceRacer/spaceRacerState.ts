import { create } from 'zustand'

export type Difficulty = 'easy' | 'normal' | 'hard'
export type GameState = 'menu' | 'playing' | 'gameOver' | 'ranking'

export interface RankingEntry {
  nickname: string
  score: number
  timestamp: number
}

interface SpaceRacerStore {
  // Game State
  gameState: GameState
  difficulty: Difficulty
  selectedShip: number
  score: number
  elapsedTime: number
  isAlive: boolean
  playerPos: [number, number, number]
  playerVelocity: [number, number, number]
  playerRotation: number

  // Game Speed (distance-based, increases over time)
  speed: number
  maxSpeed: number

  // Obstacles
  obstacles: Array<{ id: number; x: number; z: number; type: 'block' | 'gap' }>
  nextObstacleId: number

  // Rankings
  rankings: RankingEntry[]

  // Actions
  startGame: (difficulty: Difficulty, shipIndex: number) => void
  updateGame: (deltaTime: number) => void
  movePlayer: (direction: number) => void
  jump: () => void
  endGame: () => void
  saveRanking: (nickname: string) => void
  resetGame: () => void
  loadRankings: () => void
}

const initialDifficulties = {
  easy: { maxSpeed: 30, obstacleFrequency: 0.3, gapChance: 0.2 },
  normal: { maxSpeed: 50, obstacleFrequency: 0.5, gapChance: 0.3 },
  hard: { maxSpeed: 80, obstacleFrequency: 0.8, gapChance: 0.5 },
}

export const useSpaceRacerStore = create<SpaceRacerStore>((set, get) => ({
  gameState: 'menu',
  difficulty: 'normal',
  selectedShip: 0,
  score: 0,
  elapsedTime: 0,
  isAlive: true,
  playerPos: [0, 0.5, 0],
  playerVelocity: [0, 0, 0],
  playerRotation: 0,
  speed: 0,
  maxSpeed: 50,
  obstacles: [],
  nextObstacleId: 0,
  rankings: [],

  startGame: (difficulty: Difficulty, shipIndex: number) => {
    set({
      gameState: 'playing',
      difficulty,
      selectedShip: shipIndex,
      score: 0,
      elapsedTime: 0,
      isAlive: true,
      playerPos: [0, 0.5, 0],
      playerVelocity: [0, 0, 0],
      playerRotation: 0,
      speed: 5,
      maxSpeed: initialDifficulties[difficulty].maxSpeed,
      obstacles: [],
      nextObstacleId: 0,
    })
  },

  updateGame: (deltaTime: number) => {
    const state = get()
    if (!state.isAlive || state.gameState !== 'playing') return

    const diffSettings = initialDifficulties[state.difficulty]

    // Increase speed gradually
    const newSpeed = Math.min(state.speed + 0.5 * deltaTime, state.maxSpeed)

    // Update position
    const [px, py, pz] = state.playerPos
    const newZ = pz + newSpeed * deltaTime * 10
    const [vx, vy, vz] = state.playerVelocity

    // Gravity and jumping
    const newVy = vy - 25 * deltaTime
    let newPy = py + vy * deltaTime

    // Check if player fell off the track (below ground or too far left/right)
    let isOutOfBounds = Math.abs(px) > 4.5 || newPy < 0.2

    // Sway effect (±10 degrees)
    const swayAngle = Math.sin(state.elapsedTime * 2) * (Math.PI / 18)

    // Generate obstacles
    let newObstacles = [...state.obstacles]
    const shouldAddObstacle = Math.random() < diffSettings.obstacleFrequency * deltaTime

    if (shouldAddObstacle) {
      const isGap = Math.random() < diffSettings.gapChance
      newObstacles.push({
        id: state.nextObstacleId,
        x: (Math.random() - 0.5) * 6,
        z: newZ + 50,
        type: isGap ? 'gap' : 'block',
      })
    }

    // Remove obstacles that are behind the player
    newObstacles = newObstacles.filter(obs => obs.z > newZ - 10)

    // Check collision with obstacles
    let collision = false
    for (const obs of newObstacles) {
      const distZ = Math.abs(obs.z - newZ)
      const distX = Math.abs(obs.x - px)

      if (distZ < 2 && distX < 1.5) {
        if (obs.type === 'block' && py < 1.5) {
          collision = true
          break
        } else if (obs.type === 'gap' && py < 0.5) {
          collision = true
          break
        }
      }
    }

    set({
      speed: newSpeed,
      playerPos: [px, Math.max(0.5, newPy), newZ],
      playerVelocity: [vx, newVy, vz],
      playerRotation: swayAngle,
      elapsedTime: state.elapsedTime + deltaTime,
      score: Math.floor(newZ),
      obstacles: newObstacles,
      nextObstacleId: shouldAddObstacle ? state.nextObstacleId + 1 : state.nextObstacleId,
      isAlive: !isOutOfBounds && !collision,
    })
  },

  movePlayer: (direction: number) => {
    const state = get()
    const [px, py, pz] = state.playerPos
    const newX = Math.max(-4, Math.min(4, px + direction * 0.5))
    set({ playerPos: [newX, py, pz] })
  },

  jump: () => {
    const state = get()
    const [px, py, pz] = state.playerPos
    if (py <= 0.51) {
      set({ playerVelocity: [0, 15, 0] })
    }
  },

  endGame: () => {
    set({ gameState: 'gameOver', isAlive: false })
  },

  saveRanking: (nickname: string) => {
    const state = get()
    const newEntry: RankingEntry = {
      nickname,
      score: state.score,
      timestamp: Date.now(),
    }

    let rankings = [...state.rankings, newEntry]
    rankings.sort((a, b) => b.score - a.score)
    rankings = rankings.slice(0, 10) // Keep top 10

    localStorage.setItem('spaceRacerRankings', JSON.stringify(rankings))
    set({ rankings, gameState: 'ranking' })
  },

  resetGame: () => {
    set({
      gameState: 'menu',
      difficulty: 'normal',
      selectedShip: 0,
      score: 0,
      elapsedTime: 0,
      isAlive: true,
      playerPos: [0, 0.5, 0],
      playerVelocity: [0, 0, 0],
      playerRotation: 0,
      speed: 0,
      maxSpeed: 50,
      obstacles: [],
      nextObstacleId: 0,
    })
  },

  loadRankings: () => {
    const stored = localStorage.getItem('spaceRacerRankings')
    if (stored) {
      try {
        const rankings = JSON.parse(stored)
        set({ rankings })
      } catch (e) {
        console.error('Failed to load rankings:', e)
      }
    }
  },
}))
