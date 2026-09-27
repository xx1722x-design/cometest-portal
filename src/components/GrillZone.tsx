import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Mesh } from 'three'
import { useGameStore } from '../hooks/useGameStore'

const GRILL_POS_X = 5
const GRILL_POS_Z = 0
const GRILL_RADIUS = 3.0

export function GrillZone() {
  const playerPos = useGameStore((s) => s?.playerPos)
  const addBurger = useGameStore((s) => s?.addBurger) || (() => {})

  const grillMeshRef = useRef<Mesh>(null)
  const lastChargeTimeRef = useRef(0)
  const CHARGE_COOLDOWN = 0.5

  useFrame(() => {
    try {
      if (!playerPos) return

      const dx = playerPos.x - GRILL_POS_X
      const dz = playerPos.z - GRILL_POS_Z
      const distance2D = Math.sqrt(dx * dx + dz * dz)

      if (distance2D < GRILL_RADIUS) {
        const now = Date.now() / 1000
        if (now - lastChargeTimeRef.current > CHARGE_COOLDOWN) {
          try {
            addBurger()
            lastChargeTimeRef.current = now

            if (grillMeshRef?.current) {
              grillMeshRef.current.scale.set(1.1, 1.1, 1.1)
            }
          } catch (burgerError) {
            console.warn('[GrillZone] Failed to add burger:', burgerError)
          }
        }
      }

      if (grillMeshRef?.current && grillMeshRef.current.scale.x > 1) {
        grillMeshRef.current.scale.lerp(new Vector3(1, 1, 1), 0.1)
      }
    } catch (error) {
      console.error('[GrillZone] Error in useFrame:', error)
    }
  })

  return (
    <group position={[GRILL_POS_X, 0, GRILL_POS_Z]}>
      {/* 🔥 그릴 본체 - 상세 디자인 */}

      {/* 그릴 베이스 다리 (4개) */}
      {[
        [-0.6, 0.25, -0.6],
        [0.6, 0.25, -0.6],
        [-0.6, 0.25, 0.6],
        [0.6, 0.25, 0.6],
      ].map((legPos, i) => (
        <mesh key={`grill-leg-${i}`} position={legPos as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.5, 0.15]} />
          <meshStandardMaterial color="#cc6600" roughness={0.5} metalness={0.2} />
        </mesh>
      ))}

      {/* 그릴 본체 */}
      <mesh ref={grillMeshRef} position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.0, 1.6]} />
        <meshStandardMaterial color="#ff8c00" roughness={0.35} metalness={0.3} />
      </mesh>

      {/* 그릴 상판 - 밝은 강조 */}
      <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.15, 1.8]} />
        <meshStandardMaterial color="#ffaa33" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* 그릴 격자 패턴 (요리면) */}
      {Array.from({ length: 3 }).map((_, i) =>
        Array.from({ length: 3 }).map((_, j) => (
          <mesh
            key={`grill-grid-${i}-${j}`}
            position={[-0.5 + i * 0.5, 1.56, -0.5 + j * 0.5]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.35, 0.08, 0.35]} />
            <meshStandardMaterial color="#333333" roughness={0.9} metalness={0.2} />
          </mesh>
        ))
      )}

      {/* 그릴 테두리 강조 */}
      <mesh position={[0, 1.54, -0.9]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.1, 0.15]} />
        <meshStandardMaterial color="#cc6600" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.54, 0.9]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.1, 0.15]} />
        <meshStandardMaterial color="#cc6600" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[-0.9, 1.54, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 0.1, 1.8]} />
        <meshStandardMaterial color="#cc6600" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0.9, 1.54, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 0.1, 1.8]} />
        <meshStandardMaterial color="#cc6600" roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  )
}
