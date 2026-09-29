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

    // Smooth speed increase with slower ramp in early game
    const speedRampFactor = Math.min(1, state.score / 200) // Gradually increase acceleration after 200m
    const speedIncrement = 0.3 * speedRampFactor * deltaTime
    const newSpeed = Math.min(state.speed + speedIncrement, state.maxSpeed)

    // Update position
    const [px, py, pz] = state.playerPos
    const newZ = pz + newSpeed * deltaTime * 10
    const [vx, vy, vz] = state.playerVelocity

    // Gravity and jumping with increased friction
    const newVy = vy - 25 * deltaTime
    let newPy = py + vy * deltaTime

    // Smooth lateral friction - makes controls tighter
    const lateralFriction = 0.92
    const newVx = vx * lateralFriction

    // Generous track boundaries (wide track)
    const trackWidth = 6.5
    let isOutOfBounds = Math.abs(px) > trackWidth || newPy < 0.2

    // Curved track after 200m - smooth sine wave
    let trackCurve = 0
    if (state.score > 200) {
      const curveAmount = Math.sin((state.score - 200) * 0.002) * 0.8
      trackCurve = curveAmount
    }

    // Adjust track boundaries based on curve
    const adjustedTrackWidth = trackWidth + Math.abs(trackCurve) * 0.5

    // Generate obstacles with varied spacing
    let newObstacles = [...state.obstacles]
    const shouldAddObstacle = Math.random() < diffSettings.obstacleFrequency * deltaTime

    if (shouldAddObstacle) {
      const isGap = Math.random() < diffSettings.gapChance
      const xOffset = trackCurve + (Math.random() - 0.5) * 4
      newObstacles.push({
        id: state.nextObstacleId,
        x: Math.max(-adjustedTrackWidth, Math.min(adjustedTrackWidth, xOffset)),
        z: newZ + 50,
        type: isGap ? 'gap' : 'block',
      })
    }

    // Remove obstacles that are behind the player
    newObstacles = newObstacles.filter(obs => obs.z > newZ - 10)

    // Check collision with obstacles (generous hitbox)
    let collision = false
    for (const obs of newObstacles) {
      const distZ = Math.abs(obs.z - newZ)
      const distX = Math.abs(obs.x - px)

      if (distZ < 2.5 && distX < 1.8) {
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
      playerVelocity: [newVx, newVy, vz],
      playerRotation: 0, // Remove auto-rotation, player controls rotation
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
    // Faster, tighter controls - 1.0 per input instead of 0.5
    const newX = Math.max(-7, Math.min(7, px + direction * 1.0))
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
