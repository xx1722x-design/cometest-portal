import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSpaceRacerStore } from './spaceRacerState'
import { SpaceRacerShip } from './SpaceRacerShip'

const SHIP_MODELS = [
  { color: 0xff6b6b, name: 'Red Speed' },
  { color: 0x4ecdc4, name: 'Cyan Dream' },
  { color: 0xffe66d, name: 'Gold Rush' },
  { color: 0x95e1d3, name: 'Mint Fresh' },
  { color: 0xf38181, name: 'Pink Force' },
  { color: 0xaa96da, name: 'Purple Star' },
  { color: 0xfcbad3, name: 'Coral Nova' },
  { color: 0xa8dadc, name: 'Sky Blue' },
  { color: 0xf1faee, name: 'Pearl White' },
  { color: 0x1d3557, name: 'Navy Dark' },
]

export function SpaceRacerGameContent() {
  const {
    playerPos,
    playerRotation,
    obstacles,
    selectedShip,
    gameState,
    updateGame,
    endGame,
    isAlive,
  } = useSpaceRacerStore()

  const { camera } = useThree()
  const playerRef = useRef<THREE.Group>(null)
  const trackRef = useRef<THREE.Group>(null)
  const cameraOffsetRef = useRef(new THREE.Vector3(0, 3, 5))

  // Game loop
  useFrame((_state, deltaTime) => {
    if (gameState === 'playing' && isAlive) {
      updateGame(Math.min(deltaTime, 0.016))
    }

    // Update player position
    if (playerRef.current) {
      playerRef.current.position.set(playerPos[0], playerPos[1], playerPos[2])
      playerRef.current.rotation.z = playerRotation
    }

    // Follow camera
    if (playerRef.current && camera) {
      const targetCameraPos = new THREE.Vector3(
        playerPos[0] * 0.5,
        playerPos[1] + 3,
        playerPos[2] - 8
      )
      camera.position.lerp(targetCameraPos, 0.1)
      camera.lookAt(playerPos[0], playerPos[1] + 1, playerPos[2] + 10)
    }

    // End game if player is out
    if (!isAlive && gameState === 'playing') {
      endGame()
    }
  })

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return

      const { movePlayer, jump } = useSpaceRacerStore.getState()

      switch (e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          movePlayer(-1)
          e.preventDefault()
          break
        case 'arrowright':
        case 'd':
          movePlayer(1)
          e.preventDefault()
          break
        case ' ':
          jump()
          e.preventDefault()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState])

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color={0xff6b6b} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color={0x4ecdc4} />

      {/* Background Particles */}
      <ParticleBackground />

      {/* Track */}
      <Track playerZ={playerPos[2]} />

      {/* Player Ship */}
      <group ref={playerRef}>
        <SpaceRacerShip />
      </group>

      {/* Obstacles */}
      {obstacles.map((obs) => (
        <Obstacle key={obs.id} obstacle={obs} playerZ={playerPos[2]} />
      ))}

      {/* Ambient environment */}
      <fog attach="fog" args={[0x0a0a1a, 20, 200]} />
    </>
  )
}

function ParticleBackground() {
  const particlesRef = useRef<THREE.Points>(null)

  useEffect(() => {
    if (!particlesRef.current) return

    const geometry = particlesRef.current.geometry as THREE.BufferGeometry
    const colors: number[] = []

    geometry.attributes.color?.array.forEach(() => {
      const hue = Math.random()
      const color = new THREE.Color().setHSL(hue, 0.7, 0.5)
      colors.push(color.r, color.g, color.b)
    })

    if (colors.length > 0) {
      geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
    }
  }, [])

  useFrame((_state, deltaTime) => {
    if (!particlesRef.current) return
    particlesRef.current.rotation.x += deltaTime * 0.02
    particlesRef.current.rotation.y += deltaTime * 0.03
  })

  const particleCount = 200
  const positions = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 200
    positions[i + 1] = (Math.random() - 0.5) * 200
    positions[i + 2] = (Math.random() - 0.5) * 200
  }

  const colors = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    const hue = Math.random()
    const color = new THREE.Color().setHSL(hue, 0.7, 0.5)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.6}
      />
    </points>
  )
}

function Ship({ color }: { color: number }) {
  const shipRef = useRef<THREE.Group>(null)

  useFrame((_state, deltaTime) => {
    if (shipRef.current) {
      shipRef.current.rotation.y += deltaTime * 0.5
    }
  })

  return (
    <group ref={shipRef}>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.4, 0.8, 8]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Wings */}
      <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Glow effect */}
      <pointLight position={[0, 0, 0.5]} intensity={2} color={color} distance={5} />
    </group>
  )
}

function Track({ playerZ }: { playerZ: number }) {
  const trackRef = useRef<THREE.Group>(null)

  // Create extensive track segments - render 3000m ahead for infinite feel
  const segments = 150  // 150 segments * 20 units = 3000 units ahead
  const segmentLength = 20
  const baseTrackWidth = 8.0  // Match physics trackWidth

  const getTrackCurve = (z: number, score: number) => {
    // X-axis curve: gets more pronounced with difficulty
    const curveAmplitude = 1.2 + Math.min(2, score / 200)
    const curveFrequency = 0.004 + score / 50000
    return Math.sin(z * curveFrequency) * curveAmplitude
  }

  const getTrackHeight = (z: number, score: number) => {
    // Y-axis slopes: roller coaster-like hills and valleys
    const heightAmplitude = 0.5 + Math.min(1, score / 300)
    const heightFrequency = 0.003
    return Math.sin(z * heightFrequency) * heightAmplitude
  }

  return (
    <group ref={trackRef}>
      {Array.from({ length: segments }).map((_, i) => {
        const z = playerZ - 100 + i * segmentLength
        const trackX = getTrackCurve(z, playerZ)
        const trackY = getTrackHeight(z, playerZ)
        const trackWidth = baseTrackWidth - Math.min(2, playerZ / 500)

        const hue = (playerZ * 0.001 + i * 0.05) % 1
        const color = new THREE.Color().setHSL(hue, 0.8, 0.5)

        return (
          <mesh key={i} position={[trackX, trackY, z]}>
            <boxGeometry args={[trackWidth, 0.5, segmentLength]} />
            <meshStandardMaterial
              color={color}
              metalness={0.6}
              roughness={0.4}
              emissive={color}
              emissiveIntensity={0.3}
            />
          </mesh>
        )
      })}

      {/* Track edges */}
      {Array.from({ length: segments }).map((_, i) => {
        const z = playerZ - 100 + i * segmentLength
        const trackX = getTrackCurve(z, playerZ)
        const trackY = getTrackHeight(z, playerZ)
        const trackWidth = baseTrackWidth - Math.min(2, playerZ / 500)

        return (
          <group key={`edges-${i}`}>
            <mesh position={[trackX - trackWidth / 2 - 0.3, trackY + 0.3, z]}>
              <boxGeometry args={[0.3, 0.8, segmentLength]} />
              <meshStandardMaterial color={0xffffff} emissive={0x4ecdc4} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[trackX + trackWidth / 2 + 0.3, trackY + 0.3, z]}>
              <boxGeometry args={[0.3, 0.8, segmentLength]} />
              <meshStandardMaterial color={0xffffff} emissive={0xff6b6b} emissiveIntensity={0.5} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Obstacle({
  obstacle,
  playerZ,
}: {
  obstacle: { id: number; x: number; z: number; type: 'block' | 'gap' }
  playerZ: number
}) {
  if (Math.abs(obstacle.z - playerZ) > 100) return null

  if (obstacle.type === 'gap') {
    return null // Gaps are represented by missing track segments
  }

  return (
    <mesh position={[obstacle.x, 1, obstacle.z]}>
      <boxGeometry args={[1.2, 0.8, 1.2]} />
      <meshStandardMaterial
        color={0xff6b6b}
        metalness={0.7}
        roughness={0.2}
        emissive={0xff6b6b}
        emissiveIntensity={0.4}
      />
    </mesh>
  )
}
