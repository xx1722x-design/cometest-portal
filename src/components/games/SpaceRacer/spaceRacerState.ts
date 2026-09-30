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
      speed: 20, // Start with higher initial speed
      maxSpeed: initialDifficulties[difficulty].maxSpeed,
      obstacles: [],
      nextObstacleId: 0,
    })
  },

  updateGame: (deltaTime: number) => {
    const state = get()
    if (!state.isAlive || state.gameState !== 'playing') return

    const diffSettings = initialDifficulties[state.difficulty]
    const score = state.score

    // PROGRESSIVE DIFFICULTY: Speed increases faster over time
    const speedFactor = Math.min(1.5, 1 + score / 300) // Doubles at 300m
    const baseMaxSpeed = diffSettings.maxSpeed
    const adjustedMaxSpeed = baseMaxSpeed * speedFactor
    const speedIncrement = 0.12 * speedFactor * deltaTime
    const newSpeed = Math.min(state.speed + speedIncrement, adjustedMaxSpeed)

    // Update position
    const [px, py, pz] = state.playerPos
    const newZ = pz + newSpeed * deltaTime * 10
    const [vx, vy, vz] = state.playerVelocity

    // Gravity and jumping with increased friction
    const newVy = vy - 25 * deltaTime
    let newPy = py + vy * deltaTime

    // Smooth lateral friction
    const lateralFriction = 0.90
    const newVx = vx * lateralFriction

    // DYNAMIC TRACK CURVES & HEIGHTS: MUST MATCH Track.tsx calculation exactly
    const curveAmplitude = 1.2 + Math.min(2, score / 200) // Max 3.2 units at 200m
    const curveFrequency = 0.004 + score / 50000 // Curves get tighter
    const trackCurve = Math.sin(newZ * curveFrequency) * curveAmplitude

    // TRACK HEIGHT (Y-axis): Calculate exact ground level at player Z position
    const heightAmplitude = 0.5 + Math.min(1, score / 300)
    const heightFrequency = 0.003
    const trackGroundY = Math.sin(newZ * heightFrequency) * heightAmplitude

    // Ship height offset - keep ship ON TOP of track surface
    const shipHeightOffset = 0.3

    // Base track width - narrows slightly with difficulty
    const baseTrackWidth = 8.0
    const trackWidth = baseTrackWidth - Math.min(2, score / 500)

    // CHECK FALL OFF: Only trigger if off-track sides AND falling below the track surface
    let isOutOfBounds = false
    const distanceFromCenterLine = Math.abs(px - trackCurve)

    if (distanceFromCenterLine > trackWidth / 2) {
      // Player is off the track sides - check if they're falling below the track
      if (newPy < trackGroundY - 1.0) {
        isOutOfBounds = true
      }
    }

    // Force player to stay ON the track surface (rigid ground)
    // This prevents sinking and creates firm ground for jumping
    const targetPy = trackGroundY + shipHeightOffset
    const clampedPy = newPy > targetPy ? newPy : targetPy

    // Generate obstacles with PROGRESSIVE DIFFICULTY
    let newObstacles = [...state.obstacles]
    const obstacleFrequency = Math.min(1.5, diffSettings.obstacleFrequency * (1 + score / 400))
    const shouldAddObstacle = Math.random() < obstacleFrequency * deltaTime

    if (shouldAddObstacle) {
      const isGap = Math.random() < diffSettings.gapChance
      const randomOffset = (Math.random() - 0.5) * 3
      const xOffset = trackCurve + randomOffset
      newObstacles.push({
        id: state.nextObstacleId,
        x: Math.max(-trackWidth, Math.min(trackWidth, xOffset)),
        z: newZ + 50,
        type: isGap ? 'gap' : 'block',
      })
    }

    // Remove obstacles behind the player
    newObstacles = newObstacles.filter(obs => obs.z > newZ - 10)

    // FAIR COLLISION DETECTION: Small hitbox relative to visual model
    let collision = false
    const hitboxRadius = 0.3 // 60% of visual ship size
    for (const obs of newObstacles) {
      const distZ = Math.abs(obs.z - newZ)
      const distX = Math.abs(obs.x - px)

      // Tighter collision detection - only hits if very close
      if (distZ < 2 && distX < hitboxRadius) {
        if (obs.type === 'block' && py <= 0.8) {
          collision = true
          break
        }
      }
    }

    set({
      speed: newSpeed,
      playerPos: [px, clampedPy, newZ],
      playerVelocity: [newVx, newVy, vz],
      playerRotation: 0,
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
    const trackWidth = 8.0
    // Faster, tighter controls - allow full track width
    const newX = Math.max(-trackWidth, Math.min(trackWidth, px + direction * 1.0))
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
