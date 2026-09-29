import { create } from 'zustand'

export type Difficulty = 'easy' | 'normal' | 'hard'

export interface HighScore {
  nickname: string
  score: number
  difficulty: Difficulty
  timestamp: number
}

export interface PrismRushState {
  // 게임 상태
  score: number
  isGameRunning: boolean
  isGameOver: boolean
  gameStarted: boolean

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

  // 난이도 & 닉네임
  difficulty: Difficulty
  nickname: string
  showNicknameInput: boolean

  // 순위
  highScores: HighScore[]

  // 게임 설정
  baseSpeed: number

  // 액션
  setScore: (score: number) => void
  startGame: () => void
  endGame: () => void
  resetGame: () => void

  setPlayerPosition: (x: number, y: number, z: number) => void
  setPlayerVelocityY: (vy: number) => void
  setIsJumping: (jumping: boolean) => void

  setMoveLeft: (left: boolean) => void
  setMoveRight: (right: boolean) => void
  setJump: (jump: boolean) => void

  setDifficulty: (difficulty: Difficulty) => void
  setNickname: (nickname: string) => void
  setShowNicknameInput: (show: boolean) => void

  saveHighScore: (nickname: string) => void
  loadHighScores: () => void

  // 게임 루프용
  tick: () => void
}

const GRAVITY = -0.015
const JUMP_FORCE = 0.3
const GROUND_LEVEL = 0
const JUMP_THRESHOLD = 0.1
const TRACK_WIDTH = 6 // 트랙 폭 (좌우 3씩)

const getDifficultySettings = (difficulty: Difficulty) => {
  switch (difficulty) {
    case 'easy':
      return { moveSpeed: 0.12, trackSpeed: 0.12, obstacleFrequency: 0.4 }
    case 'normal':
      return { moveSpeed: 0.15, trackSpeed: 0.15, obstacleFrequency: 0.6 }
    case 'hard':
      return { moveSpeed: 0.18, trackSpeed: 0.18, obstacleFrequency: 0.8 }
  }
}

export const usePrismRushStore = create<PrismRushState>((set, get) => ({
  // 초기 상태
  score: 0,
  isGameRunning: false,
  isGameOver: false,
  gameStarted: false,

  playerX: 0,
  playerY: 0,
  playerZ: 0,
  playerVelocityY: 0,
  isJumping: false,

  moveLeft: false,
  moveRight: false,
  jump: false,

  difficulty: 'normal',
  nickname: '',
  showNicknameInput: false,

  highScores: [],

  baseSpeed: 0.15,

  setScore: (score) => set({ score }),
  startGame: () => set({ isGameRunning: true, isGameOver: false, score: 0, gameStarted: true, showNicknameInput: false }),
  endGame: () => set({ isGameRunning: false, isGameOver: true, showNicknameInput: true }),
  resetGame: () => set({
    score: 0,
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
    nickname: '',
  }),

  setPlayerPosition: (x, y, z) => set({ playerX: x, playerY: y, playerZ: z }),
  setPlayerVelocityY: (vy) => set({ playerVelocityY: vy }),
  setIsJumping: (jumping) => set({ isJumping: jumping }),

  setMoveLeft: (left) => set({ moveLeft: left }),
  setMoveRight: (right) => set({ moveRight: right }),
  setJump: (jump) => set({ jump }),

  setDifficulty: (difficulty) => set({ difficulty }),
  setNickname: (nickname) => set({ nickname }),
  setShowNicknameInput: (show) => set({ showNicknameInput: show }),

  saveHighScore: (nickname) => {
    const state = get()
    const newScore: HighScore = {
      nickname,
      score: state.score,
      difficulty: state.difficulty,
      timestamp: Date.now(),
    }

    const scores = [newScore, ...state.highScores].sort((a, b) => b.score - a.score).slice(0, 10)
    set({ highScores: scores })
    localStorage.setItem('prismRushHighScores', JSON.stringify(scores))
  },

  loadHighScores: () => {
    const saved = localStorage.getItem('prismRushHighScores')
    if (saved) {
      try {
        set({ highScores: JSON.parse(saved) })
      } catch {
        set({ highScores: [] })
      }
    }
  },

  tick: () => {
    const state = get()
    if (!state.isGameRunning) return

    const settings = getDifficultySettings(state.difficulty)

    // 플레이어 이동 로직
    let newX = state.playerX
    if (state.moveLeft) newX -= settings.moveSpeed
    if (state.moveRight) newX += settings.moveSpeed

    // 트랙 경계 체크 (-3 ~ 3)
    if (Math.abs(newX) > TRACK_WIDTH / 2) {
      // 길을 벗어남 → 게임 오버
      set({ isGameRunning: false, isGameOver: true, showNicknameInput: true })
      return
    }

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

    // 점수 증가 (난이도별 배수)
    const scoreMultiplier = state.difficulty === 'hard' ? 1.5 : state.difficulty === 'easy' ? 0.8 : 1
    set({
      playerX: newX,
      playerY: newY,
      playerVelocityY: newVY,
      score: Math.floor(state.score + scoreMultiplier),
    })
  },
}))
