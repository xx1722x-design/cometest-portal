import { create } from 'zustand'

export interface PrismRushState {
  // 게임 상태
  score: number
  timeLeft: number
  isGameRunning: boolean
  isGameOver: boolean

  // 플레이어 상태
  playerX: number
  playerY: number
  playerZ: number
  playerVelocityY: number
  isJumping: boolean

  // 입력
  moveLeft: boolean
  moveRight: boolean
  jump: boolean

  // 게임 설정
  baseSpeed: number
  maxSpeed: number

  // 액션
  setScore: (score: number) => void
  setTimeLeft: (time: number) => void
  startGame: () => void
  endGame: () => void
  resetGame: () => void

  setPlayerPosition: (x: number, y: number, z: number) => void
  setPlayerVelocityY: (vy: number) => void
  setIsJumping: (jumping: boolean) => void

  setMoveLeft: (left: boolean) => void
  setMoveRight: (right: boolean) => void
  setJump: (jump: boolean) => void

  // 게임 루프용
  tick: () => void
}

const GAME_DURATION = 30 // 30초
const GRAVITY = -0.015
const JUMP_FORCE = 0.3
const MOVE_SPEED = 0.15
const GROUND_LEVEL = 0
const JUMP_THRESHOLD = 0.1

export const usePrismRushStore = create<PrismRushState>((set, get) => ({
  // 초기 상태
  score: 0,
  timeLeft: GAME_DURATION,
  isGameRunning: false,
  isGameOver: false,

  playerX: 0,
  playerY: 0,
  playerZ: 0,
  playerVelocityY: 0,
  isJumping: false,

  moveLeft: false,
  moveRight: false,
  jump: false,

  baseSpeed: 0.15,
  maxSpeed: 0.35,

  setScore: (score) => set({ score }),
  setTimeLeft: (time) => set({ timeLeft: Math.max(0, time) }),
  startGame: () => set({ isGameRunning: true, isGameOver: false, score: 0, timeLeft: GAME_DURATION }),
  endGame: () => set({ isGameRunning: false, isGameOver: true }),
  resetGame: () => set({
    score: 0,
    timeLeft: GAME_DURATION,
    isGameRunning: false,
    isGameOver: false,
    playerX: 0,
    playerY: 0,
    playerZ: 0,
    playerVelocityY: 0,
    isJumping: false,
    moveLeft: false,
    moveRight: false,
    jump: false,
  }),

  setPlayerPosition: (x, y, z) => set({ playerX: x, playerY: y, playerZ: z }),
  setPlayerVelocityY: (vy) => set({ playerVelocityY: vy }),
  setIsJumping: (jumping) => set({ isJumping: jumping }),

  setMoveLeft: (left) => set({ moveLeft: left }),
  setMoveRight: (right) => set({ moveRight: right }),
  setJump: (jump) => set({ jump }),

  tick: () => {
    const state = get()
    if (!state.isGameRunning) return

    // 시간 감소
    const newTimeLeft = state.timeLeft - 1 / 60 // 60fps 기준
    if (newTimeLeft <= 0) {
      set({ timeLeft: 0, isGameRunning: false, isGameOver: true })
      return
    }
    set({ timeLeft: newTimeLeft })

    // 플레이어 이동 로직
    let newX = state.playerX
    if (state.moveLeft) newX -= MOVE_SPEED
    if (state.moveRight) newX += MOVE_SPEED

    // 경계 제한 (-5 ~ 5)
    newX = Math.max(-5, Math.min(5, newX))

    // 중력 적용
    let newVY = state.playerVelocityY + GRAVITY
    let newY = state.playerY + newVY

    // 점프 로직
    if (state.jump && !state.isJumping && newY <= JUMP_THRESHOLD) {
      newVY = JUMP_FORCE
      set({ isJumping: true })
    }

    // 지면 충돌
    if (newY < GROUND_LEVEL) {
      newY = GROUND_LEVEL
      newVY = 0
      set({ isJumping: false })
    }

    // 점수 증가 (시간 기반)
    set({
      playerX: newX,
      playerY: newY,
      playerVelocityY: newVY,
      score: Math.floor(state.score + 1), // 매 프레임 +1
    })
  },
}))
