import { useRef, useEffect, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Group, Vector3, Points, BufferGeometry, BufferAttribute, PointsMaterial } from 'three'
import { usePrismRushStore } from './prismRushState'
import { playPanelBeep } from '../../../lib/sciFiFx'

// 플레이어 모델 (야광 구체)
function Player() {
  const { playerX, playerY, playerZ } = usePrismRushStore()
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(playerX, playerY + 0.3, playerZ)
      groupRef.current.rotation.x += 0.05
      groupRef.current.rotation.y += 0.03
    }
  })

  return (
    <group ref={groupRef}>
      {/* 플레이어 본체 */}
      <mesh>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial
          color={0xff1493}
          emissive={0xff69b4}
          emissiveIntensity={1.5}
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>

      {/* 외부 글로우 고리 */}
      <mesh scale={1.3}>
        <torusGeometry args={[0.35, 0.08, 16, 32]} />
        <meshStandardMaterial
          color={0x00ffff}
          emissive={0x00ffff}
          emissiveIntensity={1.2}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}

// 트랙 (곡선 경로)
function Track() {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.z -= 0.15 // 트랙이 지나가는 느낌
      if (groupRef.current.position.z < -50) {
        groupRef.current.position.z = 0
      }
    }
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: 40 }).map((_, i) => {
        const zPos = i * 2.5
        const xOffset = Math.sin(zPos * 0.3) * 3 // 곡선 경로

        return (
          <group key={i}>
            {/* 트랙 좌측 */}
            <mesh position={[xOffset - 3, -0.5, zPos]}>
              <boxGeometry args={[0.3, 0.3, 2.5]} />
              <meshStandardMaterial
                color={0x0a0a0a}
                emissive={0x1a1a1a}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>

            {/* 트랙 우측 */}
            <mesh position={[xOffset + 3, -0.5, zPos]}>
              <boxGeometry args={[0.3, 0.3, 2.5]} />
              <meshStandardMaterial
                color={0x0a0a0a}
                emissive={0x1a1a1a}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>

            {/* 중앙 선 (네온) */}
            <mesh position={[xOffset, -0.3, zPos]}>
              <boxGeometry args={[0.1, 0.1, 2.5]} />
              <meshStandardMaterial
                color={0x00ffff}
                emissive={0x00ffff}
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// 파티클 폭발 시스템
function ParticleExplosion() {
  const pointsRef = useRef<Points>(null)
  const { score } = usePrismRushStore()
  const particleCountRef = useRef(0)

  useEffect(() => {
    if (!pointsRef.current) return

    const count = Math.min(500 + Math.floor(score / 10), 2000) // 점수에 따라 파티클 증가
    const geometry = new BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // 랜덤 위치 (화면 전체)
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20

      // 무지개 색상
      const hue = Math.random()
      const saturation = 1
      const lightness = 0.5
      const rgb = hslToRgb(hue, saturation, lightness)
      colors[i * 3] = rgb.r / 255
      colors[i * 3 + 1] = rgb.g / 255
      colors[i * 3 + 2] = rgb.b / 255

      // 크기 변화
      sizes[i] = Math.random() * 0.5 + 0.1
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setAttribute('color', new BufferAttribute(colors, 3))
    geometry.setAttribute('size', new BufferAttribute(sizes, 1))

    pointsRef.current.geometry = geometry
    particleCountRef.current = count
  }, [score])

  useFrame(() => {
    if (pointsRef.current && pointsRef.current.geometry) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += (Math.random() - 0.5) * 0.5 // X 이동
        positions[i + 1] += Math.random() * 0.3 // Y 상향 (위로)
        positions[i + 2] += (Math.random() - 0.5) * 0.5 // Z 이동

        // 범위 벗어나면 재생성
        if (positions[i + 1] > 10) {
          positions[i + 1] = -8
          positions[i] = (Math.random() - 0.5) * 20
          positions[i + 2] = (Math.random() - 0.5) * 20
        }
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true
      pointsRef.current.rotation.x += 0.001
      pointsRef.current.rotation.y += 0.002
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.15}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
        fog={false}
      />
    </points>
  )
}

// HSL to RGB 변환
function hslToRgb(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = l - c / 2

  let r = 0, g = 0, b = 0

  if (h < 1 / 6) {
    r = c
    g = x
  } else if (h < 2 / 6) {
    r = x
    g = c
  } else if (h < 3 / 6) {
    g = c
    b = x
  } else if (h < 4 / 6) {
    g = x
    b = c
  } else if (h < 5 / 6) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

// 게임 배경
function Background() {
  return (
    <>
      {/* 우주 배경 */}
      <mesh position={[0, 0, -30]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color={0x0a0a1a}
          emissive={0x0a0a1a}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 조명 */}
      <ambientLight intensity={0.7} color="#ffffff" />
      <directionalLight position={[10, 15, 10]} intensity={1.2} color="#fff9e6" castShadow />
      <pointLight position={[5, 8, 5]} intensity={1} color="#ffccff" distance={40} />
      <pointLight position={[-8, 6, -8]} intensity={0.8} color="#ccffff" distance={40} />
    </>
  )
}

export function PrismRushGameContent() {
  const { isGameRunning, tick, jump, setJump } = usePrismRushStore()

  // 게임 루프
  useFrame(() => {
    if (isGameRunning) {
      tick()
    }
  })

  // 입력 처리
  useEffect(() => {
    if (!isGameRunning) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') usePrismRushStore.setState({ moveLeft: true })
      if (e.key === 'ArrowRight' || e.key === 'd') usePrismRushStore.setState({ moveRight: true })
      if (e.key === ' ') {
        e.preventDefault()
        usePrismRushStore.setState({ jump: true })
        playPanelBeep()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') usePrismRushStore.setState({ moveLeft: false })
      if (e.key === 'ArrowRight' || e.key === 'd') usePrismRushStore.setState({ moveRight: false })
      if (e.key === ' ') usePrismRushStore.setState({ jump: false })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isGameRunning])

  return (
    <>
      <color attach="background" args={['#0a0a1a']} />
      <Background />

      <Suspense fallback={null}>
        <Player />
        <Track />
        <ParticleExplosion />
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </>
  )
}

// THREE import (global)
import * as THREE from 'three'
