import { useEffect, Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { Html } from '@react-three/drei'
import { useGameStore } from '../hooks/useGameStore'
import { Character } from './Character'
import { GrillZone } from './GrillZone'
import { CounterZone } from './CounterZone'
import { BurgerStack } from './BurgerStack'

const COUNTER_POS = new Vector3(0, 1.0, 2)
const COUNTER_RADIUS = 2.0
const QUEUE_START_POS = new Vector3(0, 1.0, -8)
const ENTRANCE_POS = new Vector3(0, 1.0, 15) // 정문 위치
const SPAWN_EXIT_POS = new Vector3(0, 1.0, 24) // 외부 인도로 퇴장
const CENTER_HUB = new Vector3(0, 1.0, 0)
const LEFT_CORRIDOR = new Vector3(-5, 1.0, 0)
const RIGHT_CORRIDOR = new Vector3(5, 1.0, 0)
const NPC_SPEED = 0.05
const BOUNDARY_X = 14
const BOUNDARY_Z = 14
const DEFAULT_PLAYER_POS = { x: 0, y: 1.0, z: 0 }
const NPC_SPAWN_INTERVAL = 2.0 // 손님 2초마다 스폰
const MAX_NPCS = 12
const Y_FIXED = 1.0
const WAYPOINT_RADIUS = 0.8
const NPC_SEPARATION_DISTANCE = 0.7
const COLLISION_CHECK_RADIUS = 0.6
const NPC_SPAWN_RADIUS = 8.0

// ===== 외부 인도 대기열(OUTDOOR QUEUE) 좌표 =====
const OUTDOOR_QUEUE_Z = 23.0 // 인도 라인 Z좌표
const OUTDOOR_QUEUE_X_START = -12 // 대기열 시작 X
const OUTDOOR_QUEUE_SPACING = 1.3 // 손님 간 간격
const DOOR_FRONT_X = 0 // 정문 앞 X좌표
const DOOR_FRONT_Z = 15.5 // 정문 앞 Z좌표 (문 직전)
const COUNTER_X = 0 // 카운터 X좌표
const COUNTER_Z = 2 // 카운터 Z좌표

// 충돌 경계(Collision Boundaries) - 고정 오브젝트
const COLLISION_OBSTACLES = [
  // 벽들 - AABB 방식
  { type: 'aabb', pos: { x: -15.0, z: 0 }, size: { x: 0.2, z: 30 } }, // 좌측 벽
  { type: 'aabb', pos: { x: 15.0, z: 0 }, size: { x: 0.2, z: 30 } }, // 우측 벽
  { type: 'aabb', pos: { x: 0, z: -15.0 }, size: { x: 30, z: 0.2 } }, // 후면 벽
  { type: 'aabb', pos: { x: -8.5, z: 15.0 }, size: { x: 13, z: 0.2 } }, // 전면 벽 좌측
  { type: 'aabb', pos: { x: 8.5, z: 15.0 }, size: { x: 13, z: 0.2 } }, // 전면 벽 우측

  // 테이블들 (원형 충돌)
  { type: 'circle', pos: { x: -8, z: -8 }, radius: 1.8 },
  { type: 'circle', pos: { x: 0, z: -10 }, radius: 1.8 },
  { type: 'circle', pos: { x: 8, z: -8 }, radius: 1.8 },
  { type: 'circle', pos: { x: -10, z: 0 }, radius: 1.8 },
  { type: 'circle', pos: { x: 10, z: 0 }, radius: 1.8 },
  { type: 'circle', pos: { x: -8, z: 8 }, radius: 1.8 },
  { type: 'circle', pos: { x: 0, z: 10 }, radius: 1.8 },
  { type: 'circle', pos: { x: 8, z: 8 }, radius: 1.8 },

  // 카운터 (원형)
  { type: 'circle', pos: { x: 0, z: 2 }, radius: 1.5 },

  // 그릴 (원형)
  { type: 'circle', pos: { x: 0, z: -2 }, radius: 1.5 },
]

// 장애물 충돌 확인 (AABB + Circle)
const checkCollisionWithObstacles = (x: number, z: number): boolean => {
  const NPC_RADIUS = 0.5 // NPC 캐릭터 반경 - 더 크게 설정

  return COLLISION_OBSTACLES.some((obstacle: any) => {
    if (obstacle.type === 'aabb') {
      // AABB 충돌 (벽) - 더 엄격하게
      const halfX = obstacle.size.x / 2 + 0.1
      const halfZ = obstacle.size.z / 2 + 0.1
      const left = obstacle.pos.x - halfX - NPC_RADIUS
      const right = obstacle.pos.x + halfX + NPC_RADIUS
      const top = obstacle.pos.z - halfZ - NPC_RADIUS
      const bottom = obstacle.pos.z + halfZ + NPC_RADIUS
      return x >= left && x <= right && z >= top && z <= bottom
    } else if (obstacle.type === 'circle') {
      // Circle 충돌 (테이블, 카운터 등)
      const dx = x - obstacle.pos.x
      const dz = z - obstacle.pos.z
      const distance = Math.sqrt(dx * dx + dz * dz)
      return distance < obstacle.radius + NPC_RADIUS + 0.2
    }
    return false
  })
}

// Waypoint 경로 맵 (테이블별) - 개선된 우회 경로
const getWaypointsToTable = (tableId: string): Array<{ x: number; z: number }> => {
  const tablePos: { [key: string]: [number, number] } = {
    'table-0': [-8, -8],   // 좌후측
    'table-1': [0, -10],   // 중후측
    'table-2': [8, -8],    // 우후측
    'table-3': [-10, 0],   // 좌중측
    'table-4': [10, 0],    // 우중측
    'table-5': [-8, 8],    // 좌전측
    'table-6': [0, 10],    // 중전측
    'table-7': [8, 8],     // 우전측
  }

  const [tx, tz] = tablePos[tableId] || [0, 0]

  // 명확한 우회 경로 - 카운터(0, 2) 주변 회피
  if (tz > 5) {
    // 전면 테이블: 카운터 → 전측 통로
    if (tx < -4) {
      return [{ x: 0, z: 2 }, { x: -6, z: 4 }, { x: -6, z: tz }, { x: tx, z: tz }]
    } else if (tx > 4) {
      return [{ x: 0, z: 2 }, { x: 6, z: 4 }, { x: 6, z: tz }, { x: tx, z: tz }]
    } else {
      return [{ x: 0, z: 2 }, { x: 0, z: 5 }, { x: tx, z: tz }]
    }
  } else if (tz < -5) {
    // 후면 테이블: 카운터 → 후측 통로 → 테이블
    if (tx < -4) {
      return [{ x: 0, z: 2 }, { x: -6, z: 0 }, { x: -6, z: tz }, { x: tx, z: tz }]
    } else if (tx > 4) {
      return [{ x: 0, z: 2 }, { x: 6, z: 0 }, { x: 6, z: tz }, { x: tx, z: tz }]
    } else {
      return [{ x: 0, z: 2 }, { x: 0, z: -5 }, { x: tx, z: tz }]
    }
  } else {
    // 중간 높이 테이블 (z: -5 ~ 5): 카운터 → 좌우 통로 → 테이블
    if (tx < -6) {
      return [{ x: 0, z: 2 }, { x: -6, z: 2 }, { x: -6, z: tz }, { x: tx, z: tz }]
    } else if (tx > 6) {
      return [{ x: 0, z: 2 }, { x: 6, z: 2 }, { x: 6, z: tz }, { x: tx, z: tz }]
    } else {
      return [{ x: 0, z: 2 }, { x: tx, z: tz }]
    }
  }
}

const getRandomSpawnPos = (): Vector3 => {
  const angle = Math.random() * Math.PI * 2
  const x = Math.cos(angle) * NPC_SPAWN_RADIUS
  const z = Math.sin(angle) * NPC_SPAWN_RADIUS
  return new Vector3(x, Y_FIXED, z)
}

const getSafePlayerPos = () => {
  try {
    const state = useGameStore.getState()
    const playerPos = state?.playerPos
    if (!playerPos || typeof playerPos !== 'object') {
      return DEFAULT_PLAYER_POS
    }
    return {
      x: typeof playerPos.x === 'number' ? playerPos.x : 0,
      y: Y_FIXED,
      z: typeof playerPos.z === 'number' ? playerPos.z : 0,
    }
  } catch {
    return DEFAULT_PLAYER_POS
  }
}

export function GameScene() {
  // Zustand에서 상태 가져오기
  const playerPosFromStore = useGameStore((s) => s?.playerPos)
  const burgerCountFromStore = useGameStore((s) => s?.burgerCount)
  const npcs = useGameStore((s) => s?.npcs) || new Map()
  const queuedNpcs = useGameStore((s) => s?.queuedNpcs) || []
  const tables = useGameStore((s) => s?.tables) || new Map()

  const playerPos = playerPosFromStore
    ? {
        x: typeof playerPosFromStore.x === 'number' ? playerPosFromStore.x : 0,
        y: Y_FIXED,
        z: typeof playerPosFromStore.z === 'number' ? playerPosFromStore.z : 0,
      }
    : DEFAULT_PLAYER_POS

  const burgerCount = typeof burgerCountFromStore === 'number' ? burgerCountFromStore : 0

  const setKey = useGameStore((s) => s?.setKey) || (() => {})
  const updatePlayerMovement = useGameStore((s) => s?.updatePlayerMovement) || (() => {})
  const serveBurgers = useGameStore((s) => s?.serveBurgers) || (() => 0)
  const spawnNPC = useGameStore((s) => s?.spawnNPC) || (() => {})
  const updateNPCPosition = useGameStore((s) => s?.updateNPCPosition) || (() => {})
  const updateNPCQueueIndex = useGameStore((s) => s?.updateNPCQueueIndex) || (() => {})
  const updateNPCState = useGameStore((s) => s?.updateNPCState) || (() => {})
  const updateNPCEmotion = useGameStore((s) => s?.updateNPCEmotion) || (() => {})
  // const updateNPCRotation = useGameStore((s) => s?.updateNPCRotation) || (() => {})
  const removeNPC = useGameStore((s) => s?.removeNPC) || (() => {})
  const setTableDirty = useGameStore((s) => s?.setTableDirty) || (() => {})
  const cleanTable = useGameStore((s) => s?.cleanTable) || (() => 0)
  const setNPCWaypointPath = useGameStore((s) => s?.setNPCWaypointPath) || (() => {})
  const isDoorOpen = useGameStore((s) => s?.isDoorOpen) ?? false
  const openDoor = useGameStore((s) => s?.openDoor) || (() => {})
  const closeDoor = useGameStore((s) => s?.closeDoor) || (() => {})
  const updateDoorTimer = useGameStore((s) => s?.updateDoorTimer) || (() => {})

  const lastNPCSpawnTimeRef = useRef(0)
  const lastServeTimeRef = useRef(0)
  const SERVE_COOLDOWN = 0.8
  const npcEatingTimersRef = useRef<Map<string, number>>(new Map())
  const EATING_DURATION = 5.0
  const carPositionRef = useRef(0)
  const dayNightCycleRef = useRef(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKey(e.key, true)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      setKey(e.key, false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [setKey])

  useFrame(() => {
    try {
      const now = Date.now() / 1000
      updatePlayerMovement()

      const safePos = getSafePlayerPos()
      const playerVector = new Vector3(safePos.x, safePos.y, safePos.z)

      // NPC 주기적 스폰 (Define.GUEST_SPAWN_INTERVAL = 3초)
      if (now - lastNPCSpawnTimeRef.current > NPC_SPAWN_INTERVAL) {
        if (npcs.size < MAX_NPCS) {
          spawnNPC()
          lastNPCSpawnTimeRef.current = now
        }
      }

      // 🚪 자동문 시스템 - NPC와 정문 거리 감지
      try {
        const DOOR_POS = new Vector3(0, 1.0, 15)
        const DOOR_TRIGGER_RADIUS = 2.0

        let anyNearDoor = false
        Array.from(npcs.values()).forEach((npc) => {
          const npcVector = new Vector3(npc.position.x, npc.position.y, npc.position.z)
          const distToDoor = npcVector.distanceTo(DOOR_POS)

          // NPC가 정문 2m 이내에 있으면 문 열기
          if (distToDoor < DOOR_TRIGGER_RADIUS && npc.position.z > 10) {
            anyNearDoor = true
            if (!isDoorOpen) {
              openDoor()
            }
          }
        })

        // 타이머 업데이트 (3초 후 자동 닫힘)
        updateDoorTimer(1 / 60) // 약 60fps 기준

        // 문을 닫아야 하면 닫기
        if (!anyNearDoor && isDoorOpen) {
          // 문이 열려있고 주변에 NPC가 없으면 타이머 계속 진행
        }
      } catch (doorError) {
        console.warn('[GameScene] Door system error:', doorError)
      }

      // 🤖 NPC AI - Waypoint 기반 네비게이션
      try {
        const allTables = Array.from(tables.values())

        npcs.forEach((npc) => {
          try {
            const npcVector = new Vector3(npc.position.x, npc.position.y, npc.position.z)

            // ===== 상태 진입 로직 =====
            if (npc.state === 'outdoor_queue') {
              // 🚶 **외부 인도에서 대기 중** - 절대 이동 금지!
              // z > 20인 인도에 고정 (z=24.5 근처)
              if (!npc.waypointPath || npc.waypointPath.length === 0 || npc.waypointPath[0].z < 20) {
                setNPCWaypointPath(npc.id, [{ x: npc.position.x, z: 24.5 }]) // 인도에 고정
              }

              // 🚪 **입장 조건**: 실내에 3명 미만 + 순번이 되면
              const indoorCount = Array.from(npcs.values()).filter((n) =>
                n.state !== 'outdoor_queue' && n.state !== 'leaving'
              ).length

              // 현재 NPC가 대기열 맨 앞이고 실내에 자리가 있으면 입장
              const queueIndex = Array.from(npcs.values())
                .filter((n) => n.state === 'outdoor_queue')
                .sort((a, b) => a.queueIndex - b.queueIndex)[0]?.queueIndex

              if (npc.queueIndex === queueIndex && indoorCount < 3) {
                updateNPCState(npc.id, 'entering')
                // **경로: 인도 → 정문 앞 → 카운터**
                setNPCWaypointPath(npc.id, [
                  { x: 0, z: 15.5 },  // 정문 앞
                  { x: 0, z: 2 }      // 카운터
                ])
              }
              const queueIdx = Array.from(npcs.values()).filter((n) => n.state === 'waiting').length
              updateNPCQueueIndex(npc.id, queueIdx)

              // 대기열 위치 분산 - 좌우로 넓혀서 일렬 배치
              // 홀수/짝수로 좌우 번갈아 배치
              const offset = queueIdx % 2 === 0 ? -2.5 - (Math.floor(queueIdx / 2) * 1.2) : 2.5 + (Math.floor(queueIdx / 2) * 1.2)
              // 경로: 인도 → 정문 (z=14.5) → 안전 영역 (z=8) → 대기열 (z=-8)
              setNPCWaypointPath(npc.id, [
                { x: offset, z: 14.5 }, // 정문 통과
                { x: offset, z: 8 },    // 안전 영역
                { x: offset, z: -8 }    // 대기열
              ])
            } else if (npc.state === 'spawned') {
              // 스폰된 NPC → 외부 인도 대기열로
              updateNPCState(npc.id, 'outdoor_queue')
              setNPCWaypointPath(npc.id, [{ x: Math.random() * 20 - 10, z: 24.5 }])
            } else if (npc.state === 'entering') {
              // 🚪 **정문 앞(z=15.5)에서 대기 중** - 1명씩만 입장!
              // entering 상태: 절대로 z < 15로 이동 금지!
              if (npc.position.z < 15) {
                setNPCWaypointPath(npc.id, [{ x: 0, z: 15.5 }]) // 정문 앞으로 강제 복원
              }

              // 자동문 열림 감지
              const dx = npc.position.x - 0
              const dz = npc.position.z - 15.5
              const doorDist = Math.sqrt(dx * dx + dz * dz)
              if (doorDist < 2.0 && !isDoorOpen) {
                openDoor()
              }

              // **1명씩만 입장**: 실내에 1명 미만(0명)일 때만 카운터로
              const indoorGoing = Array.from(npcs.values()).filter((n) =>
                n.state === 'going_to_counter' || n.state === 'ordering' || n.state === 'waiting' || n.state === 'going_to_table' || n.state === 'eating'
              ).length

              if (indoorGoing === 0 && npc.position.z > 10) {
                updateNPCState(npc.id, 'going_to_counter')
                setNPCWaypointPath(npc.id, [{ x: 0, z: 2 }])
              }
            } else if (npc.state === 'waiting') {
              // 첫번째 대기자 → 카운터로
              if (npc.queueIndex === 0) {
                updateNPCState(npc.id, 'going_to_counter')
                setNPCWaypointPath(npc.id, [{ x: 0, z: 2 }])
              }
            } else if (npc.state === 'going_to_table') {
              // 테이블 경로 설정
              if (npc.tableIndex !== undefined) {
                const tableWaypoints = getWaypointsToTable(`table-${npc.tableIndex}`)
                setNPCWaypointPath(npc.id, tableWaypoints)
              }
            } else if (npc.state === 'leaving') {
              setNPCWaypointPath(npc.id, [{ x: 0, z: -16 }])
            }

            // Waypoint 기반 이동
            const waypoints = npc.waypointPath || []
            if (waypoints.length === 0) return

            const currentWaypoint = waypoints[npc.currentWaypointIndex] || waypoints[waypoints.length - 1]
            const targetVector = new Vector3(currentWaypoint.x, Y_FIXED, currentWaypoint.z)

            const dx = targetVector.x - npcVector.x
            const dz = targetVector.z - npcVector.z
            const distance = Math.sqrt(dx * dx + dz * dz)

            // Waypoint 도달 여부
            if (distance < WAYPOINT_RADIUS) {
              // 다음 waypoint로
              if (npc.currentWaypointIndex < waypoints.length - 1) {
                useGameStore.setState((state) => {
                  const npcToUpdate = state.npcs.get(npc.id)
                  if (npcToUpdate) {
                    const updated = new Map(state.npcs)
                    updated.set(npc.id, { ...npcToUpdate, currentWaypointIndex: npcToUpdate.currentWaypointIndex + 1 })
                    return { npcs: updated }
                  }
                  return {}
                })
              } else {
                // 최종 waypoint 도달
                if (npc.state === 'going_to_counter') {
                  updateNPCState(npc.id, 'ordering')
                } else if (npc.state === 'going_to_table') {
                  updateNPCState(npc.id, 'eating')
                } else if (npc.state === 'leaving') {
                  removeNPC(npc.id)
                  return
                }
              }
            } else {
              // 다음 waypoint로 이동 - 충돌 회피 적용
              let nextX = npcVector.x
              let nextZ = npcVector.z

              const dir = new Vector3(dx, 0, dz).normalize()
              const moveStep = NPC_SPEED
              nextX += dir.x * moveStep
              nextZ += dir.z * moveStep

              // NPC 회전 업데이트 - 이동 방향을 바라봐야 함
              const targetRotation = Math.atan2(dir.x, dir.z)
              // updateNPCRotation(npc.id, targetRotation)

              // 경계 내로 제한
              nextX = Math.max(-BOUNDARY_X, Math.min(BOUNDARY_X, nextX))
              nextZ = Math.max(-BOUNDARY_Z, Math.min(BOUNDARY_Z, nextZ))

              // **outdoor_queue 상태: 절대로 매장 내부(z < 20)로 이동 금지!**
              if (npc.state === 'outdoor_queue' && nextZ < 20) {
                nextZ = 24.5 // 인도 라인으로 강제 복원
              }

              // **entering 상태: 절대로 매장 내부(z < 15)로 이동 금지!**
              if (npc.state === 'entering' && nextZ < 15) {
                nextZ = 15.5 // 정문 앞으로 강제 복원
              }

              // **going_to_counter 상태: 카운터 직전(z=5)까지만 진입!**
              if (npc.state === 'going_to_counter' && nextZ < 5) {
                nextZ = 5 // 카운터 앞에서 멈춤
              }

              // 장애물 충돌 확인 - 충돌하면 이전 위치 유지 또는 우회
              if (checkCollisionWithObstacles(nextX, nextZ)) {
                // 측면 회피 시도 (좌측)
                const leftX = nextX - dir.z * 0.3
                const leftZ = nextZ + dir.x * 0.3
                if (!checkCollisionWithObstacles(leftX, leftZ)) {
                  nextX = leftX
                  nextZ = leftZ
                } else {
                  // 우측 회피 시도
                  const rightX = nextX + dir.z * 0.3
                  const rightZ = nextZ - dir.x * 0.3
                  if (!checkCollisionWithObstacles(rightX, rightZ)) {
                    nextX = rightX
                    nextZ = rightZ
                  }
                  // 둘 다 불가능하면 현재 위치 유지
                }
              }

              // NPC 간 분리(Separation) - 다른 NPC와의 충돌 회피
              Array.from(npcs.values()).forEach((otherNpc) => {
                if (otherNpc.id === npc.id) return
                const otherX = otherNpc.position.x
                const otherZ = otherNpc.position.z
                const diffX = nextX - otherX
                const diffZ = nextZ - otherZ
                const dist = Math.sqrt(diffX * diffX + diffZ * diffZ)

                // 최소 거리 미만이면 반대 방향으로 밀어내기
                if (dist < NPC_SEPARATION_DISTANCE && dist > 0.01) {
                  const pushDir = new Vector3(diffX, 0, diffZ).normalize()
                  nextX += pushDir.x * 0.2
                  nextZ += pushDir.z * 0.2
                }
              })

              updateNPCPosition(npc.id, nextX, nextZ)
            }
          } catch (err) {
            console.warn('[GameScene] NPC error:', err)
          }
        })
      } catch (npcError) {
        console.warn('[GameScene] NPC system error:', npcError)
      }

      // 카운터 서빙 로직 (플레이어가 카운터 근처 + 햄버거 있음)
      try {
        const playerDistToCounter = playerVector.distanceTo(COUNTER_POS)

        if (playerDistToCounter < COUNTER_RADIUS && burgerCount > 0) {
          if (now - lastServeTimeRef.current > SERVE_COOLDOWN) {
            // 카운터 근처에 있는 첫번째 손님 찾기
            const npcAtCounter = Array.from(npcs.values()).find(
              (npc) =>
                npc.state === 'ordering' &&
                new Vector3(npc.position.x, npc.position.y, npc.position.z).distanceTo(COUNTER_POS) < 1.5
            )

            if (npcAtCounter) {
              try {
                serveBurgers(1)
                lastServeTimeRef.current = now
                // 손님 상태 업데이트 (나중에 추가)
              } catch (serveError) {
                console.warn('[GameScene] Serve burger error:', serveError)
              }
            }
          }
        }
      } catch (serveLogicError) {
        console.warn('[GameScene] Counter serve logic error:', serveLogicError)
      }

      // 👥 NPC 식사 후 퇴장 로직 (eating → leaving)
      try {
        Array.from(npcs.values()).forEach((npc) => {
          if (npc.state === 'eating') {
            const timerId = npc.id
            const eatingStartTime = npcEatingTimersRef.current.get(timerId) || now
            npcEatingTimersRef.current.set(timerId, eatingStartTime)

            if (now - eatingStartTime > EATING_DURATION) {
              // 식사 완료 - NPC를 'leaving' 상태로 변경
              updateNPCState(npc.id, 'leaving')
              updateNPCEmotion(npc.id, 'happy')

              // 테이블을 Dirty로 설정 (돈 100달러)
              if (npc.tableIndex !== undefined) {
                const tableId = `table-${npc.tableIndex}`
                setTableDirty(tableId, 100)
              }

              npcEatingTimersRef.current.delete(timerId)
            }
          }
        })
      } catch (eatingError) {
        console.warn('[GameScene] Eating state error:', eatingError)
      }

      // 🚪 NPC 제거 (leaving 상태이고 외부 인도로 나감)
      try {
        Array.from(npcs.values()).forEach((npc) => {
          if (npc.state === 'leaving') {
            // 인도 너머(z > 30) 또는 범위 밖으로 나가면 제거
            if (npc.position.z > 30 || Math.abs(npc.position.x) > 20) {
              removeNPC(npc.id)
            }
          }
        })
      } catch (removeError) {
        console.warn('[GameScene] NPC removal error:', removeError)
      }

      // 🚗 자동차 애니메이션 - 차도에서 루프
      try {
        carPositionRef.current += 0.08
        if (carPositionRef.current > 60) {
          carPositionRef.current = -20
        }
      } catch (carError) {
        console.warn('[GameScene] Car animation error:', carError)
      }

      // 🧹 자동 청소 로직 - 더러운 테이블이 1.5m 범위 내면 자동 정산
      try {
        Array.from(tables.values()).forEach((table) => {
          if (table.isDirty) {
            const tablePos = new Vector3(table.position.x, table.position.y, table.position.z)
            const distToTable = playerVector.distanceTo(tablePos)

            if (distToTable < 1.5) {
              cleanTable(table.id)
            }
          }
        })
      } catch (cleanError) {
        console.warn('[GameScene] Table cleaning error:', cleanError)
      }
    } catch (error) {
      console.error('[GameScene] Error in useFrame:', error)
    }
  })

  return (
    <group>
      {/* ===== 매장 내부 ===== */}

      {/* 🏪 실내 바닥 */}
      <mesh position={[0, -0.1, 0]} rotation={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[30, 0.2, 30]} />
        <meshStandardMaterial color="#c4a878" roughness={0.75} metalness={0} />
      </mesh>

      {/* 🧱 완전히 밀폐된 실내 벽 시스템 */}

      {/* ===== 좌측 벽 (완전 높이) ===== */}
      {/* 좌측 벽 - 실내 (z: -15 ~ 15) */}
      <mesh position={[-15.1, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3.2, 30]} />
        <meshStandardMaterial color="#d4c4b4" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* ===== 우측 벽 (완전 높이) ===== */}
      {/* 우측 벽 - 실내 (z: -15 ~ 15) */}
      <mesh position={[15.1, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3.2, 30]} />
        <meshStandardMaterial color="#d4c4b4" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* ===== 후면 벽 (완전 너비) ===== */}
      {/* 후면 벽 - 실내 전체 (x: -15 ~ 15) */}
      <mesh position={[0, 1.5, -15.1]} castShadow receiveShadow>
        <boxGeometry args={[30, 3.2, 0.2]} />
        <meshStandardMaterial color="#d4c4b4" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* ===== 전면 벽 (입구 포함) ===== */}
      {/* 전면 벽 - 좌측 부분 (x: -15 ~ -2, 입구 좌측) */}
      <mesh position={[-8.5, 1.5, 15.1]} castShadow receiveShadow>
        <boxGeometry args={[13, 3.2, 0.2]} />
        <meshStandardMaterial color="#d4c4b4" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* 전면 벽 - 우측 부분 (x: 2 ~ 15, 입구 우측) */}
      <mesh position={[8.5, 1.5, 15.1]} castShadow receiveShadow>
        <boxGeometry args={[13, 3.2, 0.2]} />
        <meshStandardMaterial color="#d4c4b4" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* 🚪 정문 (자동문 시스템) */}
      {/* 입구 좌측 프레임 */}
      <mesh position={[-2, 1.5, 15.0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 2.5, 0.2]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* 입구 우측 프레임 */}
      <mesh position={[2, 1.5, 15.0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 2.5, 0.2]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* 입구 상단 프레임 */}
      <mesh position={[0, 2.5, 15.0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.2, 0.2]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* 좌측 문짝 - 열림/닫힘 애니메이션 */}
      <group
        position={[-2, 1.25, 15.0]}
        rotation={[0, isDoorOpen ? -Math.PI / 2 : 0, 0]}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.1, 2.2, 1.8]} />
          <meshStandardMaterial color="#a0826d" roughness={0.5} metalness={0.2} />
        </mesh>
        {/* 문 손잡이 */}
        <mesh position={[0, 0, 0.85]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>

      {/* 우측 문짝 - 열림/닫힘 애니메이션 */}
      <group
        position={[2, 1.25, 15.0]}
        rotation={[0, isDoorOpen ? Math.PI / 2 : 0, 0]}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.1, 2.2, 1.8]} />
          <meshStandardMaterial color="#a0826d" roughness={0.5} metalness={0.2} />
        </mesh>
        {/* 문 손잡이 */}
        <mesh position={[0, 0, 0.85]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>

      {/* ===== 외부 환경 ===== */}

      {/* 🚶 인도 (Sidewalk - Concrete) */}
      <mesh position={[0, -0.08, 24]} receiveShadow>
        <boxGeometry args={[40, 0.15, 8]} />
        <meshStandardMaterial color="#b8b8b0" roughness={0.85} metalness={0} />
      </mesh>

      {/* 보도블록 패턴 */}
      {Array.from({ length: 40 }).map((_, i) =>
        Array.from({ length: 8 }).map((_, j) => (
          <mesh
            key={`sidewalk-block-${i}-${j}`}
            position={[-20 + i, -0.07, 20 + j]}
            receiveShadow
          >
            <boxGeometry args={[1, 0.1, 1]} />
            <meshStandardMaterial
              color={Math.random() > 0.5 ? '#c0c0b8' : '#b8b8b0'}
              roughness={0.9}
              metalness={0}
            />
          </mesh>
        ))
      )}

      {/* 🚗 차도 (Road/Asphalt - Dark Gray) */}
      <mesh position={[0, -0.065, 32]} receiveShadow>
        <boxGeometry args={[50, 0.13, 10]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.95} metalness={0.02} />
      </mesh>

      {/* 🛣️ 중앙선 (Center Line - Dashed White) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`road-center-line-${i}`} position={[0, -0.062, 27.5 + i * 1.5]} receiveShadow>
          <boxGeometry args={[0.15, 0.08, 0.8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
        </mesh>
      ))}

      {/* 🛣️ 측면선 (Side Lines - White) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`road-left-line-${i}`} position={[-24, -0.062, 27.5 + i * 1.5]} receiveShadow>
          <boxGeometry args={[0.1, 0.08, 0.8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
        </mesh>
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`road-right-line-${i}`} position={[24, -0.062, 27.5 + i * 1.5]} receiveShadow>
          <boxGeometry args={[0.1, 0.08, 0.8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
        </mesh>
      ))}

      {/* 🏢 대면 건물 (Opposite Building - 차도 건너편) */}
      <mesh position={[0, 2.2, 50]} castShadow receiveShadow>
        <boxGeometry args={[60, 4.5, 2]} />
        <meshStandardMaterial color="#6b5b52" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* 🪟 대면 건물 창문들 */}
      {Array.from({ length: 12 }).map((_, i) =>
        Array.from({ length: 4 }).map((_, j) => (
          <mesh
            key={`building-window-front-${i}-${j}`}
            position={[-28 + i * 5, 2.5 + j * 0.9, 50.4]}
            castShadow
          >
            <boxGeometry args={[0.9, 0.7, 0.1]} />
            <meshStandardMaterial
              color={Math.random() > 0.4 ? '#ffff99' : '#2a2a2a'}
              emissive={Math.random() > 0.4 ? '#ffff00' : '#000000'}
              emissiveIntensity={Math.random() > 0.4 ? 0.35 : 0}
              roughness={0.2}
              metalness={0.5}
            />
          </mesh>
        ))
      )}

      {/* 🏢 좌측 건물 (건물 1 - 차도 좌측) */}
      <mesh position={[-35, 2.0, 20]} castShadow receiveShadow>
        <boxGeometry args={[8, 3.8, 20]} />
        <meshStandardMaterial color="#7a6560" roughness={0.75} metalness={0.03} />
      </mesh>

      {/* 🪟 좌측 건물 창문들 */}
      {Array.from({ length: 2 }).map((_, i) =>
        Array.from({ length: 3 }).map((_, j) => (
          <mesh
            key={`building-left-window-${i}-${j}`}
            position={[-35, 2.0 + j * 1.0, 10 + i * 10]}
            castShadow
          >
            <boxGeometry args={[0.7, 0.6, 0.1]} />
            <meshStandardMaterial
              color={Math.random() > 0.35 ? '#ffff99' : '#2a2a2a'}
              emissive={Math.random() > 0.35 ? '#ffff00' : '#000000'}
              emissiveIntensity={Math.random() > 0.35 ? 0.3 : 0}
              roughness={0.2}
              metalness={0.5}
            />
          </mesh>
        ))
      )}

      {/* 🏢 우측 건물 (건물 2 - 차도 우측) */}
      <mesh position={[35, 2.0, 20]} castShadow receiveShadow>
        <boxGeometry args={[8, 3.8, 20]} />
        <meshStandardMaterial color="#7a6560" roughness={0.75} metalness={0.03} />
      </mesh>

      {/* 🪟 우측 건물 창문들 */}
      {Array.from({ length: 2 }).map((_, i) =>
        Array.from({ length: 3 }).map((_, j) => (
          <mesh
            key={`building-right-window-${i}-${j}`}
            position={[35, 2.0 + j * 1.0, 10 + i * 10]}
            castShadow
          >
            <boxGeometry args={[0.7, 0.6, 0.1]} />
            <meshStandardMaterial
              color={Math.random() > 0.35 ? '#ffff99' : '#2a2a2a'}
              emissive={Math.random() > 0.35 ? '#ffff00' : '#000000'}
              emissiveIntensity={Math.random() > 0.35 ? 0.3 : 0}
              roughness={0.2}
              metalness={0.5}
            />
          </mesh>
        ))
      )}

      {/* 🚦 신호등들 (Traffic Lights) */}
      {/* 좌측 신호등 */}
      <mesh position={[-30, 2.5, 20]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 5.5, 0.15]} />
        <meshStandardMaterial color="#333333" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[-30, 4.5, 20]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 1.2, 0.35]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[-30, 4.9, 20.2]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 16]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
      </mesh>

      {/* 우측 신호등 */}
      <mesh position={[30, 2.5, 20]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 5.5, 0.15]} />
        <meshStandardMaterial color="#333333" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[30, 4.5, 20]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 1.2, 0.35]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[30, 4.9, 20.2]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 16]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.7} />
      </mesh>

      {/* 💡 가로등들 (Street Lights) */}
      {/* 가로등 1 - 좌측 인도 */}
      <mesh position={[-25, 2.3, 16]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 4.8, 0.12]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.65} metalness={0.25} />
      </mesh>
      <mesh position={[-22, 4.8, 16]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.08, 0.08]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.65} metalness={0.25} />
      </mesh>
      <mesh position={[-21, 4.8, 16]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff77" emissiveIntensity={0.65} />
      </mesh>

      {/* 가로등 2 - 좌측 차도 */}
      <mesh position={[-25, 2.3, 32]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 4.8, 0.12]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.65} metalness={0.25} />
      </mesh>
      <mesh position={[-22, 4.8, 32]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.08, 0.08]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.65} metalness={0.25} />
      </mesh>
      <mesh position={[-21, 4.8, 32]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff77" emissiveIntensity={0.65} />
      </mesh>

      {/* 가로등 3 - 우측 인도 */}
      <mesh position={[25, 2.3, 16]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 4.8, 0.12]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.65} metalness={0.25} />
      </mesh>
      <mesh position={[22, 4.8, 16]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.08, 0.08]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.65} metalness={0.25} />
      </mesh>
      <mesh position={[21, 4.8, 16]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff77" emissiveIntensity={0.65} />
      </mesh>

      {/* 가로등 4 - 우측 차도 */}
      <mesh position={[25, 2.3, 32]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 4.8, 0.12]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.65} metalness={0.25} />
      </mesh>
      <mesh position={[22, 4.8, 32]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.08, 0.08]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.65} metalness={0.25} />
      </mesh>
      <mesh position={[21, 4.8, 32]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff77" emissiveIntensity={0.65} />
      </mesh>

      {/* 🚗 현실적인 저폴리곤 자동차 */}
      {Array.from({ length: 4 }).map((_, i) => {
        const carColors = ['#c41e3a', '#003da5', '#ffd700', '#ff9900']
        const carColor = carColors[i % 4]
        return (
          <group key={`car-${i}`} position={[carPositionRef.current + i * 15 - 30, 0.3, 32]}>
            {/* 자동차 본체 */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.8, 0.8, 4]} />
              <meshStandardMaterial color={carColor} roughness={0.4} metalness={0.4} />
            </mesh>

            {/* 자동차 지붕 */}
            <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.6, 0.6, 2.4]} />
              <meshStandardMaterial color={carColor} roughness={0.4} metalness={0.4} />
            </mesh>

            {/* 앞 범퍼 */}
            <mesh position={[0, 0.25, 1.8]} castShadow receiveShadow>
              <boxGeometry args={[1.8, 0.3, 0.3]} />
              <meshStandardMaterial color="#333333" roughness={0.6} metalness={0.2} />
            </mesh>

            {/* 헤드라이트 (좌측) */}
            <mesh position={[-0.75, 0.5, 2]} castShadow>
              <cylinderGeometry args={[0.25, 0.25, 0.1, 8]} />
              <meshStandardMaterial color="#ffff99" emissive="#ffff00" emissiveIntensity={0.6} />
            </mesh>

            {/* 헤드라이트 (우측) */}
            <mesh position={[0.75, 0.5, 2]} castShadow>
              <cylinderGeometry args={[0.25, 0.25, 0.1, 8]} />
              <meshStandardMaterial color="#ffff99" emissive="#ffff00" emissiveIntensity={0.6} />
            </mesh>

            {/* 윈드실드 (앞 창문) */}
            <mesh position={[0, 1, 1]} castShadow>
              <boxGeometry args={[1.6, 0.5, 0.05]} />
              <meshStandardMaterial color="#4499ff" roughness={0.2} metalness={0.7} />
            </mesh>

            {/* 리어 윈드 (뒷 창문) */}
            <mesh position={[0, 1, -1]} castShadow>
              <boxGeometry args={[1.5, 0.4, 0.05]} />
              <meshStandardMaterial color="#4499ff" roughness={0.2} metalness={0.7} />
            </mesh>

            {/* 사이드 윈도우 (좌측) */}
            <mesh position={[-0.95, 1, 0]} castShadow>
              <boxGeometry args={[0.05, 0.4, 1.5]} />
              <meshStandardMaterial color="#4499ff" roughness={0.2} metalness={0.7} />
            </mesh>

            {/* 사이드 윈도우 (우측) */}
            <mesh position={[0.95, 1, 0]} castShadow>
              <boxGeometry args={[0.05, 0.4, 1.5]} />
              <meshStandardMaterial color="#4499ff" roughness={0.2} metalness={0.7} />
            </mesh>

            {/* 바퀴들 (전좌, 전우, 후좌, 후우) */}
            {[[-0.8, 0, -1.2], [0.8, 0, -1.2], [-0.8, 0, 1.2], [0.8, 0, 1.2]].map((pos, wi) => (
              <group key={`wheel-${wi}`} position={pos as [number, number, number]}>
                {/* 타이어 */}
                <mesh castShadow>
                  <cylinderGeometry args={[0.45, 0.45, 0.25, 12]} />
                  <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0.1} />
                </mesh>
                {/* 휠 디스크 */}
                <mesh position={[0, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.35, 0.35, 0.26, 8]} />
                  <meshStandardMaterial color="#666666" roughness={0.4} metalness={0.6} />
                </mesh>
              </group>
            ))}
          </group>
        )
      })}

      {/* 🛏️ 식탁들 (손님이 앉는 곳) - 상판과 다리 분리 */}
      {Array.from(tables.values()).map((table) => {
        const isDirty = table.isDirty
        const tableTopColor = isDirty ? '#8b4513' : '#a0825c'
        const tableBorderColor = isDirty ? '#6b3410' : '#8b7355'

        return (
          <group key={table.id} position={[table.position.x, table.position.y, table.position.z]}>
            {/* 테이블 상판 - 더러우면 어두운 색 */}
            <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
              <boxGeometry args={[3, 0.15, 3]} />
              <meshStandardMaterial color={tableTopColor} roughness={isDirty ? 0.8 : 0.6} metalness={0.2} />
            </mesh>

            {/* 테이블 테두리 강조 */}
            <mesh position={[0, 0.34, -1.5]} castShadow receiveShadow>
              <boxGeometry args={[3, 0.08, 0.15]} />
              <meshStandardMaterial color={tableBorderColor} roughness={0.5} metalness={0.15} />
            </mesh>

            {/* 테이블 다리 (4개) */}
            {[
              [-1.2, -0.25, -1.2],
              [1.2, -0.25, -1.2],
              [-1.2, -0.25, 1.2],
              [1.2, -0.25, 1.2],
            ].map((legPos, legIdx) => (
              <mesh
                key={`leg-${legIdx}`}
                position={legPos as [number, number, number]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.15, 0.7, 0.15]} />
                <meshStandardMaterial color="#6b5847" roughness={0.8} metalness={0.05} />
              </mesh>
            ))}

            {/* 💰 돈더미 - 테이블이 더러울 때만 표시 */}
            {isDirty && (
              <mesh position={[0.8, 0.5, 0.8]} castShadow>
                <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
                <meshStandardMaterial color="#22aa22" roughness={0.3} metalness={0.8} />
              </mesh>
            )}

            {/* 🗑️ 쓰레기 더미 - 테이블이 더러울 때만 표시 */}
            {isDirty && (
              <mesh position={[-0.8, 0.5, 0.8]} castShadow>
                <boxGeometry args={[0.5, 0.4, 0.5]} />
                <meshStandardMaterial color="#664422" roughness={0.9} metalness={0.05} />
              </mesh>
            )}
          </group>
        )
      })}

      {/* 💰 돈 표시 (떨어진 동전들) */}
      {[
        [-5, 0.2, 5],
        [5, 0.2, -5],
        [0, 0.2, -8],
        [-8, 0.2, 0],
        [8, 0.2, 3],
      ].map((pos, i) => (
        <mesh key={`money-${i}`} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
          <meshStandardMaterial color="#22aa22" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}

      {/* 🏪 카운터 (햄버거 가게) - 입체 디자인 */}
      <group position={[0, 0, 2]} rotation={[0, 0, 0]}>
        {/* 카운터 본체 */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 1.6, 2.2]} />
          <meshStandardMaterial
            color="#d84c1f"
            roughness={0.4}
            metalness={0.2}
            emissive={0x4d1a0a}
            emissiveIntensity={0.1}
          />
        </mesh>

        {/* 카운터 상판 - 하이라이트 */}
        <mesh position={[0, 1.65, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.15, 2.4]} />
          <meshStandardMaterial
            color="#e85d2f"
            roughness={0.3}
            metalness={0.3}
          />
        </mesh>

        {/* 카운터 테두리 - 입체감 */}
        <mesh position={[0, 1.63, -1.3]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.1, 0.2]} />
          <meshStandardMaterial
            color="#c53d0a"
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>

        {/* 카운터 테두리 - 전면 */}
        <mesh position={[0, 1.63, 1.3]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.1, 0.2]} />
          <meshStandardMaterial
            color="#c53d0a"
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>

        {/* 카운터 좌측 테두리 */}
        <mesh position={[-1.3, 1.63, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.1, 2.4]} />
          <meshStandardMaterial
            color="#c53d0a"
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>

        {/* 카운터 우측 테두리 */}
        <mesh position={[1.3, 1.63, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.1, 2.4]} />
          <meshStandardMaterial
            color="#c53d0a"
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>

        {/* 카운터 다리 */}
        {[[-0.8, 0.5, -0.8], [0.8, 0.5, -0.8], [-0.8, 0.5, 0.8], [0.8, 0.5, 0.8]].map((pos, i) => (
          <mesh key={`counter-leg-${i}`} position={pos as [number, number, number]} castShadow receiveShadow>
            <boxGeometry args={[0.15, 1, 0.15]} />
            <meshStandardMaterial
              color="#8b3a0a"
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* 그릴 존 */}
      <GrillZone />

      {/* 카운터 상호작용 영역 */}
      <CounterZone />

      <Suspense fallback={null}>
        {/* 플레이어: 1.glb + 햄버거 스택 */}
        <Character
          modelPath="/3000polygon/1.glb"
          position={[playerPos.x, playerPos.y, playerPos.z]}
          rotation={[0, 0, 0]}
        />
        {burgerCount > 0 && (
          <BurgerStack count={burgerCount} position={[playerPos.x, playerPos.y, playerPos.z]} />
        )}

        {/* NPC 렌더링: Zustand에서 가져온 npcs Map */}
        {Array.from(npcs.values()).map((npc, idx) => {
          const modelIndex = ((idx % 9) + 2) // 2.glb ~ 10.glb 순환
          const emotionIcon = npc.emotion === 'happy' ? '🥰' : npc.emotion === 'hungry' ? '🤤' : '😐'

          return (
            <group key={`npc-${npc.id}`}>
              <Character
                modelPath={`/3000polygon/${modelIndex}.glb`}
                position={[npc.position.x, npc.position.y, npc.position.z]}
                rotation={[0, npc.rotation, 0]}
              />
              {/* 👤 NPC 머리 위 감정 아이콘 */}
              <Html position={[npc.position.x, npc.position.y + 1.8, npc.position.z]} center>
                <div
                  style={{
                    fontSize: '28px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '32px',
                    height: '32px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '50%',
                    animation: 'none',
                  }}
                >
                  {emotionIcon}
                </div>
              </Html>
            </group>
          )
        })}
      </Suspense>

      {/* ✨ 조명 설정 - 밝고 깔끔한 매장 분위기 */}

      {/* 기본 환경광 - 밝은 분위기 */}
      <ambientLight intensity={0.85} color="#ffffff" />

      {/* 주요 방향성 조명 - 따뜻한 톤 + 최적화된 그림자 */}
      <directionalLight
        position={[15, 20, 15]}
        intensity={1.0}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={0.5}
        shadow-camera-far={150}
        shadow-bias={-0.001}
        shadow-radius={3}
      />

      {/* 채우기 조명 1 - 좌측 (부드러운) */}
      <pointLight
        position={[-15, 10, 15]}
        intensity={0.4}
        color="#f5ead1"
        distance={70}
      />

      {/* 채우기 조명 2 - 우측 (부드러운) */}
      <pointLight
        position={[15, 10, -15]}
        intensity={0.3}
        color="#e8dcc0"
        distance={60}
      />
    </group>
  )
}
