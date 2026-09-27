import { create } from 'zustand'

interface BurgerStack {
  id: string
  burgers: number
}

interface NPC {
  id: string
  position: { x: number; y: number; z: number }
  rotation: number // 라디안 - Y축 회전
  state: 'spawned' | 'outdoor_queue' | 'entering' | 'waiting' | 'going_to_counter' | 'ordering' | 'going_to_table' | 'eating' | 'leaving'
  queueIndex: number
  orderCount: number
  tableIndex?: number
  emotion: 'hungry' | 'happy' | 'neutral'
  targetPosition: { x: number; z: number }
  nextState?: string
  waypointPath: Array<{ x: number; z: number }>
  currentWaypointIndex: number
  orderMenuId?: string // 주문한 메뉴 ID
}

interface Table {
  id: string
  position: { x: number; y: number; z: number }
  isOccupied: boolean
  capacity: number
  occupants: string[]
  isDirty: boolean
  moneyAmount: number
  eatingDuration: number
}

interface GameState {
  // 플레이어
  playerPos: { x: number; y: number; z: number }
  keys: { [key: string]: boolean }

  // 경제 시스템
  money: number
  burgerCount: number
  readonly maxBurgers: number
  readonly burgerPrice: number

  // Pile 시스템
  burgerPile: { count: number } // 카운터의 햄버거 스택
  moneyPile: number // 카운터에서 획득한 돈 (추가 경제)

  // 건물 시스템
  isDoorOpen: boolean // 정문 개폐 상태
  doorCloseTimer: number // 정문 자동 닫힘 타이머

  // 카메라 회전 시스템
  cameraRotation: number // 0, 90, 180, 270 (도 단위)
  isRotating: boolean // 애니메이션 중인지 여부
  targetRotation: number // 목표 회전 각도
  cameraDistance: number // 카메라 거리
  targetCameraDistance: number // 목표 카메라 거리

  // NPC & 손님 시스템
  npcs: Map<string, NPC>
  queuedNpcs: string[] // 대기열에서 대기 중인 NPC
  indoorNpcs: string[] // 매장 내부에 있는 NPC
  tables: Map<string, Table>

  // 액션
  setPlayerPos: (x: number, y: number, z: number) => void
  setKey: (key: string, pressed: boolean) => void
  updatePlayerMovement: () => void
  addBurger: () => void
  serveBurgers: (count: number) => number
  addBurgerToPile: (count: number) => void
  removeBurgerFromPile: (count: number) => number
  addMoneyToPile: (amount: number) => void
  removeMoneyFromPile: () => number
  spawnNPC: () => void
  updateNPCPosition: (id: string, x: number, z: number) => void
  updateNPCState: (id: string, state: NPC['state']) => void
  updateNPCEmotion: (id: string, emotion: NPC['emotion']) => void
  updateNPCQueueIndex: (id: string, index: number) => void
  setNPCTableIndex: (id: string, tableIndex?: number) => void
  removeNPC: (id: string) => void
  addTableOccupant: (tableId: string, npcId: string) => void
  removeTableOccupant: (tableId: string, npcId: string) => void
  setNPCTargetPosition: (id: string, x: number, z: number) => void
  setNPCWaypointPath: (id: string, waypoints: Array<{ x: number; z: number }>) => void
  setTableDirty: (tableId: string, moneyAmount: number) => void
  cleanTable: (tableId: string) => number
  getQueuedNPCsCount: () => number
  getCleanTables: () => string[]
  openDoor: () => void
  closeDoor: () => void
  updateDoorTimer: (deltaTime: number) => void
  rotateCameraClockwise: () => void
  updateCameraRotation: (deltaTime: number) => void
  zoomIn: () => void
  zoomOut: () => void
  updateCameraZoom: (deltaTime: number) => void
  kickOutAllNPCs: () => void // 모든 손님 내쫒기
}

const BURGER_PRICE = 100
const MAX_NPC_COUNT = 9
const INITIAL_BURGER_PILE_CAPACITY = 20

export const useGameStore = create<GameState>((set, get) => ({
  playerPos: { x: 0, y: 1.0, z: 0 },
  keys: {},
  money: 0,
  burgerCount: 0,
  maxBurgers: 3,
  burgerPrice: BURGER_PRICE,

  burgerPile: { count: 0 },
  moneyPile: 0,

  isDoorOpen: false,
  doorCloseTimer: 0,

  cameraRotation: 0,
  isRotating: false,
  targetRotation: 0,
  cameraDistance: Math.sqrt(20 * 20 + 25 * 25),
  targetCameraDistance: Math.sqrt(20 * 20 + 25 * 25),

  npcs: new Map(),
  queuedNpcs: [],
  indoorNpcs: [],
  tables: new Map([
    ['table-0', { id: 'table-0', position: { x: -8, y: 1, z: -8 }, isOccupied: false, capacity: 4, occupants: [], isDirty: false, moneyAmount: 0, eatingDuration: 0 }],
    ['table-1', { id: 'table-1', position: { x: 0, y: 1, z: -10 }, isOccupied: false, capacity: 4, occupants: [], isDirty: false, moneyAmount: 0, eatingDuration: 0 }],
    ['table-2', { id: 'table-2', position: { x: 8, y: 1, z: -8 }, isOccupied: false, capacity: 4, occupants: [], isDirty: false, moneyAmount: 0, eatingDuration: 0 }],
    ['table-3', { id: 'table-3', position: { x: -10, y: 1, z: 0 }, isOccupied: false, capacity: 4, occupants: [], isDirty: false, moneyAmount: 0, eatingDuration: 0 }],
    ['table-4', { id: 'table-4', position: { x: 10, y: 1, z: 0 }, isOccupied: false, capacity: 4, occupants: [], isDirty: false, moneyAmount: 0, eatingDuration: 0 }],
    ['table-5', { id: 'table-5', position: { x: -8, y: 1, z: 8 }, isOccupied: false, capacity: 4, occupants: [], isDirty: false, moneyAmount: 0, eatingDuration: 0 }],
    ['table-6', { id: 'table-6', position: { x: 0, y: 1, z: 10 }, isOccupied: false, capacity: 4, occupants: [], isDirty: false, moneyAmount: 0, eatingDuration: 0 }],
    ['table-7', { id: 'table-7', position: { x: 8, y: 1, z: 8 }, isOccupied: false, capacity: 4, occupants: [], isDirty: false, moneyAmount: 0, eatingDuration: 0 }],
  ]),

  setPlayerPos: (x, y, z) =>
    set({ playerPos: { x, y, z } }),

  setKey: (key, pressed) =>
    set((state) => ({
      keys: { ...state.keys, [key.toLowerCase()]: pressed },
    })),

  updatePlayerMovement: () => {
    const { keys, playerPos } = get()
    const speed = 0.1
    const BOUNDARY_X = 14
    const BOUNDARY_Z = 14

    let newX = playerPos.x
    let newZ = playerPos.z

    if (keys['w']) newZ -= speed
    if (keys['s']) newZ += speed
    if (keys['a']) newX -= speed
    if (keys['d']) newX += speed

    newX = Math.max(-BOUNDARY_X, Math.min(BOUNDARY_X, newX))
    newZ = Math.max(-BOUNDARY_Z, Math.min(BOUNDARY_Z, newZ))

    if (newX !== playerPos.x || newZ !== playerPos.z) {
      set({ playerPos: { x: newX, y: playerPos.y, z: newZ } })
    }
  },

  addBurger: () =>
    set((state) => ({
      burgerCount: Math.min(state.burgerCount + 1, state.maxBurgers),
    })),

  serveBurgers: (count) => {
    const { burgerCount } = get()
    const actualCount = Math.min(count, burgerCount)
    const earnedMoney = actualCount * BURGER_PRICE

    set((state) => ({
      burgerCount: state.burgerCount - actualCount,
      money: state.money + earnedMoney,
    }))

    return earnedMoney
  },

  addBurgerToPile: (count) =>
    set((state) => ({
      burgerPile: { count: Math.min(state.burgerPile.count + count, INITIAL_BURGER_PILE_CAPACITY) },
    })),

  removeBurgerFromPile: (count) => {
    const { burgerPile } = get()
    const actualCount = Math.min(count, burgerPile.count)
    set((state) => ({
      burgerPile: { count: state.burgerPile.count - actualCount },
    }))
    return actualCount
  },

  addMoneyToPile: (amount) =>
    set((state) => ({
      moneyPile: state.moneyPile + amount,
    })),

  removeMoneyFromPile: () => {
    const { moneyPile } = get()
    if (moneyPile > 0) {
      set({ moneyPile: 0 })
      return moneyPile
    }
    return 0
  },

  spawnNPC: () => {
    const { npcs } = get()
    if (npcs.size >= MAX_NPC_COUNT) return

    const id = `npc-${Date.now()}-${Math.random()}`
    // 🏠 **가게 외부 인도(Sidewalk)에서만 스폰**: z=24.5 (정문 바깥쪽), x는 무작위 배치
    const queueCount = Array.from(npcs.values()).filter((n) => n.state === 'outdoor_queue').length
    const spawnX = -12 + (queueCount % 20) * 1.3
    const spawnZ = 24.5 // 정문(z=15)보다 훨씬 뒤쪽 인도

    const newNPC: NPC = {
      id,
      position: { x: spawnX, y: 1.0, z: spawnZ },
      rotation: 0,
      state: 'outdoor_queue', // 외부 인도 대기열
      queueIndex: queueCount,
      orderCount: 0,
      emotion: 'hungry',
      targetPosition: { x: spawnX, z: spawnZ },
      waypointPath: [{ x: spawnX, z: spawnZ }], // **인도에서 절대 이동 금지**
      currentWaypointIndex: 0,
    }

    set((state) => ({
      npcs: new Map(state.npcs).set(id, newNPC),
      queuedNpcs: [...state.queuedNpcs, id],
    }))
  },

  updateNPCPosition: (id, x, z) =>
    set((state) => {
      const npc = state.npcs.get(id)
      if (npc) {
        const updated = new Map(state.npcs)
        updated.set(id, { ...npc, position: { ...npc.position, x, z } })
        return { npcs: updated }
      }
      return {}
    }),

  updateNPCState: (id, state) =>
    set((prevState) => {
      const npc = prevState.npcs.get(id)
      if (npc) {
        const updated = new Map(prevState.npcs)
        updated.set(id, { ...npc, state })
        return { npcs: updated }
      }
      return {}
    }),

  updateNPCEmotion: (id, emotion) =>
    set((prevState) => {
      const npc = prevState.npcs.get(id)
      if (npc) {
        const updated = new Map(prevState.npcs)
        updated.set(id, { ...npc, emotion })
        return { npcs: updated }
      }
      return {}
    }),

  updateNPCRotation: (id: string, rotation: number) =>
    set((state) => {
      const npc = state.npcs.get(id)
      if (npc) {
        const updated = new Map(state.npcs)
        updated.set(id, { ...npc, rotation })
        return { npcs: updated }
      }
      return {}
    }),

  updateNPCQueueIndex: (id, index) =>
    set((state) => {
      const npc = state.npcs.get(id)
      if (npc) {
        const updated = new Map(state.npcs)
        updated.set(id, { ...npc, queueIndex: index })
        return { npcs: updated }
      }
      return {}
    }),

  setNPCTableIndex: (id, tableIndex) =>
    set((state) => {
      const npc = state.npcs.get(id)
      if (npc) {
        const updated = new Map(state.npcs)
        updated.set(id, { ...npc, tableIndex })
        return { npcs: updated }
      }
      return {}
    }),

  setNPCTargetPosition: (id, x, z) =>
    set((state) => {
      const npc = state.npcs.get(id)
      if (npc) {
        const updated = new Map(state.npcs)
        updated.set(id, { ...npc, targetPosition: { x, z } })
        return { npcs: updated }
      }
      return {}
    }),

  setNPCWaypointPath: (id, waypoints: Array<{ x: number; z: number }>) =>
    set((state) => {
      const npc = state.npcs.get(id)
      if (npc) {
        const updated = new Map(state.npcs)
        updated.set(id, { ...npc, waypointPath: waypoints, currentWaypointIndex: 0 })
        return { npcs: updated }
      }
      return {}
    }),

  removeNPC: (id) =>
    set((state) => {
      const updated = new Map(state.npcs)
      updated.delete(id)
      return {
        npcs: updated,
        queuedNpcs: state.queuedNpcs.filter((npcId) => npcId !== id),
      }
    }),

  addTableOccupant: (tableId, npcId) =>
    set((state) => {
      const table = state.tables.get(tableId)
      if (table && !table.occupants.includes(npcId)) {
        const updated = new Map(state.tables)
        updated.set(tableId, {
          ...table,
          occupants: [...table.occupants, npcId],
          isOccupied: true,
        })
        return { tables: updated }
      }
      return {}
    }),

  removeTableOccupant: (tableId, npcId) =>
    set((state) => {
      const table = state.tables.get(tableId)
      if (table) {
        const updated = new Map(state.tables)
        const occupants = table.occupants.filter((id) => id !== npcId)
        updated.set(tableId, {
          ...table,
          occupants,
          isOccupied: occupants.length > 0,
        })
        return { tables: updated }
      }
      return {}
    }),

  setTableDirty: (tableId, moneyAmount) =>
    set((state) => {
      const table = state.tables.get(tableId)
      if (table) {
        const updated = new Map(state.tables)
        updated.set(tableId, {
          ...table,
          isDirty: true,
          moneyAmount,
          occupants: [],
          isOccupied: false,
        })
        return { tables: updated }
      }
      return {}
    }),

  cleanTable: (tableId) => {
    const { tables, money } = get()
    const table = tables.get(tableId)
    if (table && table.isDirty) {
      const earnedMoney = table.moneyAmount
      set((state) => {
        const updated = new Map(state.tables)
        updated.set(tableId, {
          ...table,
          isDirty: false,
          moneyAmount: 0,
        })
        return {
          tables: updated,
          money: state.money + earnedMoney,
        }
      })
      return earnedMoney
    }
    return 0
  },

  getQueuedNPCsCount: () => {
    const { queuedNpcs } = get()
    return queuedNpcs.length
  },

  getCleanTables: () => {
    const { tables } = get()
    return Array.from(tables.values())
      .filter((t) => !t.isDirty && !t.isOccupied)
      .map((t) => t.id)
  },

  openDoor: () =>
    set({ isDoorOpen: true, doorCloseTimer: 0 }),

  closeDoor: () =>
    set({ isDoorOpen: false }),

  updateDoorTimer: (deltaTime: number) =>
    set((state) => {
      if (!state.isDoorOpen) return {}
      const newTimer = state.doorCloseTimer + deltaTime
      if (newTimer > 3.0) {
        return { isDoorOpen: false, doorCloseTimer: 0 }
      }
      return { doorCloseTimer: newTimer }
    }),

  rotateCameraClockwise: () =>
    set((state) => {
      if (state.isRotating) return {}
      const newRotation = (state.cameraRotation + 90) % 360
      return {
        isRotating: true,
        targetRotation: newRotation,
      }
    }),

  updateCameraRotation: (deltaTime: number) =>
    set((state) => {
      if (!state.isRotating) return {}

      const current = state.cameraRotation
      const target = state.targetRotation
      const diff = target - current

      // 최단 경로 계산
      let shortestDiff = diff
      if (diff > 180) {
        shortestDiff = diff - 360
      } else if (diff < -180) {
        shortestDiff = diff + 360
      }

      // Lerp 애니메이션
      const speed = 360 // 도/초
      const step = speed * deltaTime
      let newRotation = current + Math.sign(shortestDiff) * Math.min(Math.abs(shortestDiff), step)

      // 정규화 (0-360)
      newRotation = ((newRotation % 360) + 360) % 360

      // 목표 도달 확인
      const isComplete = Math.abs(newRotation - target) < 1
      if (isComplete) {
        return {
          cameraRotation: target,
          isRotating: false,
          targetRotation: target,
        }
      }

      return { cameraRotation: newRotation }
    }),

  zoomIn: () =>
    set((state) => ({
      targetCameraDistance: Math.max(15, state.cameraDistance - 5),
    })),

  zoomOut: () =>
    set((state) => ({
      targetCameraDistance: Math.min(80, state.cameraDistance + 5),
    })),

  updateCameraZoom: (deltaTime: number) =>
    set((state) => {
      const current = state.cameraDistance
      const target = state.targetCameraDistance
      const diff = target - current

      if (Math.abs(diff) < 0.1) {
        return { cameraDistance: target }
      }

      // Lerp 애니메이션
      const speed = 30 // 단위/초
      const step = speed * deltaTime
      const newDistance = current + Math.sign(diff) * Math.min(Math.abs(diff), step)

      return { cameraDistance: newDistance }
    }),

  kickOutAllNPCs: () =>
    set((state) => ({
      npcs: new Map(), // 모든 NPC 제거
      queuedNpcs: [],
      indoorNpcs: [],
      money: state.money, // 벌어들인 돈은 유지
    })),
}))
