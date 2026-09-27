import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Mesh } from 'three'
import { useGameStore } from '../hooks/useGameStore'

const COUNTER_POS_X = 0
const COUNTER_POS_Z = 2
const COUNTER_INTERACT_RADIUS = 2.5 // 2D 거리

export function CounterZone() {
  const playerPos = useGameStore((s) => s?.playerPos)
  const burgerCount = useGameStore((s) => s?.burgerCount) || 0
  const npcs = useGameStore((s) => s?.npcs) || new Map()

  const serveBurgers = useGameStore((s) => s?.serveBurgers) || (() => 0)
  const updateNPCState = useGameStore((s) => s?.updateNPCState) || (() => {})

  const counterMeshRef = useRef<Mesh>(null)
  const lastInteractTimeRef = useRef(0)
  const INTERACT_COOLDOWN = 0.5

  useFrame(() => {
    try {
      if (!playerPos) return

      // 2D 거리 계산 (X, Z만)
      const dx = playerPos.x - COUNTER_POS_X
      const dz = playerPos.z - COUNTER_POS_Z
      const distance2D = Math.sqrt(dx * dx + dz * dz)
      const now = Date.now() / 1000

      // 플레이어가 카운터 근처 + 햄버거 있음
      if (distance2D < COUNTER_INTERACT_RADIUS && burgerCount > 0) {
        if (now - lastInteractTimeRef.current > INTERACT_COOLDOWN) {
          try {
            // 카운터 근처의 첫번째 손님 찾기 (ordering 상태)
            const npcAtCounter = Array.from(npcs.values()).find((npc) => {
              const npcDx = npc.position.x - COUNTER_POS_X
              const npcDz = npc.position.z - COUNTER_POS_Z
              const npcDistance = Math.sqrt(npcDx * npcDx + npcDz * npcDz)
              return npc.state === 'ordering' && npcDistance < 2.0
            })

            if (npcAtCounter) {
              // 손님이 있으면 햄버거 판매
              const earnedMoney = serveBurgers(1)
              lastInteractTimeRef.current = now

              // 손님 상태 변경 (ordering → going_to_table)
              if (earnedMoney > 0) {
                // 비어 있는 Clean 테이블 찾기
                const cleanTableIds = useGameStore.getState().getCleanTables()
                if (cleanTableIds.length > 0) {
                  const tableId = cleanTableIds[0]
                  const tableIndex = parseInt(tableId.split('-')[1])
                  updateNPCState(npcAtCounter.id, 'going_to_table')
                  useGameStore.getState().setNPCTableIndex(npcAtCounter.id, tableIndex)
                }
              }

              // 카운터 시각 피드백
              if (counterMeshRef?.current) {
                counterMeshRef.current.scale.set(1.05, 1.05, 1.05)
              }
            }
          } catch (error) {
            console.warn('[CounterZone] Interaction error:', error)
          }
        }
      }

      // 카운터 스케일 애니메이션
      if (counterMeshRef?.current && counterMeshRef.current.scale.x > 1) {
        counterMeshRef.current.scale.lerp(new Vector3(1, 1, 1), 0.1)
      }
    } catch (error) {
      console.error('[CounterZone] Error in useFrame:', error)
    }
  })

  return (
    <group>
      <mesh ref={counterMeshRef} position={[COUNTER_POS_X, 0.5, COUNTER_POS_Z]} visible={false}>
        <cylinderGeometry args={[COUNTER_INTERACT_RADIUS, COUNTER_INTERACT_RADIUS, 1, 16]} />
        <meshStandardMaterial color="#ff0000" wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
