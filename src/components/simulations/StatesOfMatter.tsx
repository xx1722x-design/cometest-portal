import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useHelper } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'

interface ParticleState {
  position: THREE.Vector3
  velocity: THREE.Vector3
  targetPosition: THREE.Vector3
  targetVelocity: THREE.Vector3
  vibrationPhase: number
  baseX: number
  baseZ: number
  baseY: number
}

const NUM_PARTICLES = 64
const CONTAINER_SIZE = 6
const PARTICLE_RADIUS = 0.15
const FORCE_DISTANCE_THRESHOLD = 1.2

interface PhysicsState {
  state: 'solid' | 'liquid' | 'gas'
  showForces: boolean
  isRunning: boolean
}

function StatesOfMatterScene({ physicsState }: { physicsState: PhysicsState }) {
  const particleRefs = useRef<THREE.Mesh[]>([])
  const particleStatesRef = useRef<ParticleState[]>([])
  const linesRef = useRef<THREE.LineSegments>(null)
  const containerRef = useRef<THREE.Mesh>(null)
  const frameCountRef = useRef(0)
  const prevStateRef = useRef<'solid' | 'liquid' | 'gas'>('solid')

  useEffect(() => {
    if (!particleStatesRef.current.length) {
      const gridSize = Math.ceil(Math.cbrt(NUM_PARTICLES))
      const spacing = CONTAINER_SIZE / (gridSize + 1)

      for (let i = 0; i < NUM_PARTICLES; i++) {
        const x = ((i % gridSize) - gridSize / 2) * spacing
        const y = (Math.floor((i / gridSize) % gridSize) - gridSize / 2) * spacing
        const z = (Math.floor(i / (gridSize * gridSize)) - gridSize / 2) * spacing

        particleStatesRef.current.push({
          position: new THREE.Vector3(x, -CONTAINER_SIZE / 2 + 0.5, z),
          velocity: new THREE.Vector3(0, 0, 0),
          targetPosition: new THREE.Vector3(x, -CONTAINER_SIZE / 2 + 0.5, z),
          targetVelocity: new THREE.Vector3(0, 0, 0),
          vibrationPhase: Math.random() * Math.PI * 2,
          baseX: x,
          baseZ: z,
          baseY: -CONTAINER_SIZE / 2 + 1,
        })
      }
    }

    if (physicsState.state !== prevStateRef.current) {
      prevStateRef.current = physicsState.state
      initializeStateTransition()
    }
  }, [physicsState.state])

  const initializeStateTransition = () => {
    const gridSize = Math.ceil(Math.cbrt(NUM_PARTICLES))
    const spacing = CONTAINER_SIZE / (gridSize + 1)

    particleStatesRef.current.forEach((particle, i) => {
      if (physicsState.state === 'solid') {
        const x = ((i % gridSize) - gridSize / 2) * spacing
        const z = (Math.floor((i / gridSize) % gridSize) - gridSize / 2) * spacing
        particle.targetPosition.set(x, -CONTAINER_SIZE / 2 + 0.5, z)
        particle.baseX = x
        particle.baseZ = z
        particle.targetVelocity.set(0, 0, 0)
      } else if (physicsState.state === 'liquid') {
        const randomX = (Math.random() - 0.5) * CONTAINER_SIZE * 0.8
        const randomZ = (Math.random() - 0.5) * CONTAINER_SIZE * 0.8
        particle.targetPosition.set(randomX, -CONTAINER_SIZE / 2 + 1.5, randomZ)
        particle.baseX = randomX
        particle.baseZ = randomZ
        particle.targetVelocity.set((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2)
      } else {
        const randomX = (Math.random() - 0.5) * CONTAINER_SIZE
        const randomY = (Math.random() - 0.5) * CONTAINER_SIZE
        const randomZ = (Math.random() - 0.5) * CONTAINER_SIZE
        particle.targetPosition.set(randomX, randomY, randomZ)
        particle.targetVelocity.set(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        )
      }
    })
  }

  useFrame(() => {
    if (!physicsState.isRunning || !particleRefs.current.length) return

    frameCountRef.current++
    const particles = particleStatesRef.current

    // Update particle physics
    particles.forEach((particle) => {
      const lerpFactor = 0.1
      const velocityLerpFactor = 0.15

      particle.position.lerp(particle.targetPosition, lerpFactor)
      particle.velocity.lerp(particle.targetVelocity, velocityLerpFactor)

      if (physicsState.state === 'solid') {
        particle.vibrationPhase += 0.08
        const vibration = Math.sin(particle.vibrationPhase) * 0.02
        particle.position.x = particle.targetPosition.x + vibration * 0.5
        particle.position.z = particle.targetPosition.z + vibration * 0.5
      } else if (physicsState.state === 'liquid') {
        const brownianX = (Math.random() - 0.5) * 0.15
        const brownianZ = (Math.random() - 0.5) * 0.15
        particle.position.x += brownianX
        particle.position.z += brownianZ

        const gravity = 0.98
        particle.velocity.y -= gravity * 0.016
        if (particle.position.y < -CONTAINER_SIZE / 2 + PARTICLE_RADIUS) {
          particle.position.y = -CONTAINER_SIZE / 2 + PARTICLE_RADIUS
          particle.velocity.y *= -0.3
        }
      } else if (physicsState.state === 'gas') {
        particle.position.add(particle.velocity.clone().multiplyScalar(0.016))

        const bounceDistance = CONTAINER_SIZE / 2 - PARTICLE_RADIUS

        // Bounce off walls
        if (Math.abs(particle.position.x) > bounceDistance) {
          particle.position.x = Math.sign(particle.position.x) * bounceDistance
          particle.velocity.x *= -0.9
        }
        if (Math.abs(particle.position.y) > bounceDistance) {
          particle.position.y = Math.sign(particle.position.y) * bounceDistance
          particle.velocity.y *= -0.9
        }
        if (Math.abs(particle.position.z) > bounceDistance) {
          particle.position.z = Math.sign(particle.position.z) * bounceDistance
          particle.velocity.z *= -0.9
        }
      }
    })

    // Update particle meshes
    particleRefs.current.forEach((mesh, i) => {
      if (particles[i]) {
        mesh.position.copy(particles[i].position)
      }
    })

    // Update force lines
    if (physicsState.showForces && linesRef.current) {
      const positions: number[] = []

      if (physicsState.state === 'solid') {
        const gridSize = Math.ceil(Math.cbrt(NUM_PARTICLES))
        particles.forEach((p1, i) => {
          const x = i % gridSize
          const y = Math.floor((i / gridSize) % gridSize)
          const z = Math.floor(i / (gridSize * gridSize))

          const neighbors = [
            (x + 1) + y * gridSize + z * gridSize * gridSize,
            x + (y + 1) * gridSize + z * gridSize * gridSize,
            x + y * gridSize + (z + 1) * gridSize * gridSize,
          ]

          neighbors.forEach((j) => {
            if (j < NUM_PARTICLES) {
              const p2 = particles[j]
              positions.push(p1.position.x, p1.position.y, p1.position.z)
              positions.push(p2.position.x, p2.position.y, p2.position.z)
            }
          })
        })
      } else if (physicsState.state === 'liquid') {
        particles.forEach((p1, i) => {
          particles.forEach((p2, j) => {
            if (i < j) {
              const dist = p1.position.distanceTo(p2.position)
              if (dist < FORCE_DISTANCE_THRESHOLD) {
                positions.push(p1.position.x, p1.position.y, p1.position.z)
                positions.push(p2.position.x, p2.position.y, p2.position.z)
              }
            }
          })
        })
      }

      const geometry = linesRef.current.geometry as THREE.BufferGeometry
      if (geometry.attributes.position) {
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
        geometry.attributes.position.needsUpdate = true
      }
    }
  })

  return (
    <>
      {/* Container - Transparent cube */}
      <mesh ref={containerRef}>
        <boxGeometry args={[CONTAINER_SIZE, CONTAINER_SIZE, CONTAINER_SIZE]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.1}
          color={0x3366ff}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Container edges */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(CONTAINER_SIZE, CONTAINER_SIZE, CONTAINER_SIZE)]} />
        <lineBasicMaterial attach="material" color={0x6699ff} linewidth={2} />
      </lineSegments>

      {/* Particles */}
      {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) particleRefs.current[i] = el
          }}
          position={[0, 0, 0]}
        >
          <sphereGeometry args={[PARTICLE_RADIUS, 16, 16]} />
          <meshPhongMaterial color={0x00ccff} emissive={0x0066ff} shininess={100} />
        </mesh>
      ))}

      {/* Force lines */}
      {physicsState.showForces && (
        <lineSegments ref={linesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={0}
              array={new Float32Array(0)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={0xff3333} linewidth={1} />
        </lineSegments>
      )}

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={0x0066ff} />

      {/* Camera controls */}
      <OrbitControls
        enableZoom
        enablePan
        enableRotate
        autoRotate
        autoRotateSpeed={2}
        minDistance={8}
        maxDistance={25}
      />
    </>
  )
}

export function StatesOfMatter() {
  const navigate = useNavigate()
  const [physicsState, setPhysicsState] = useState<PhysicsState>({
    state: 'solid',
    showForces: true,
    isRunning: true,
  })

  const handleStateChange = (newState: 'solid' | 'liquid' | 'gas') => {
    setPhysicsState((prev) => ({ ...prev, state: newState }))
  }

  const handleToggleForces = () => {
    setPhysicsState((prev) => ({ ...prev, showForces: !prev.showForces }))
  }

  const handleToggleRun = () => {
    setPhysicsState((prev) => ({ ...prev, isRunning: !prev.isRunning }))
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0a0a1a' }}>
      {/* Canvas */}
      <Canvas
        camera={{ position: [12, 10, 12], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        <StatesOfMatterScene physicsState={physicsState} />
      </Canvas>

      {/* Info Panel - Left side */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #3366ff',
          borderRadius: '12px',
          padding: '20px',
          color: '#fff',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          maxWidth: '380px',
          fontSize: '13px',
          lineHeight: '1.6',
          boxShadow: '0 8px 32px rgba(51, 102, 255, 0.2)',
          zIndex: 50,
          backdropFilter: 'blur(10px)',
        }}
      >
        <h2
          style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '700',
            color: '#66ccff',
            letterSpacing: '0.5px',
          }}
        >
          물질의 상태 변화
        </h2>
        <p style={{ margin: 0, textAlign: 'justify', color: '#ccc' }}>
          자연계의 모든 물질은 온도와 압력 조건에 따라 고체, 액체, 기체라는 세 가지 서로 다른
          상(Phase)을 띱니다. 고체 상태일 때는 입자들이 강하게 결합하여 고정된 형태와 일정한 부피를
          유지합니다. 반면 액체 상태에서는 입자 간의 결합이 다소 느슨해져 부피는 유지하되 용기의 형태에
          맞춰 자유롭게 흐르며 모양을 바꿀 수 있습니다. 기체 상태에 도달하면 입자들이 공간 제약 없이
          활발하게 운동하며, 형태는 물론 부피마저 외부 조건에 따라 유동적으로 팽창하거나 수축합니다.
          열에너지를 흡수하거나 방출함에 따라 물질의 구조가 재배열되는 이러한 현상을 '물질의 상태 변화'라고
          일컫습니다.
        </p>
      </div>

      {/* Control Panel - Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #3366ff',
          borderRadius: '12px',
          padding: '20px 30px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          zIndex: 50,
          flexWrap: 'wrap',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(51, 102, 255, 0.2)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* State Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {(['solid', 'liquid', 'gas'] as const).map((state) => (
            <button
              key={state}
              onClick={() => handleStateChange(state)}
              style={{
                padding: '10px 18px',
                background: physicsState.state === state ? '#00ccff' : '#333',
                color: physicsState.state === state ? '#000' : '#fff',
                border: `2px solid ${physicsState.state === state ? '#00ccff' : '#555'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow:
                  physicsState.state === state ? '0 0 15px rgba(0, 204, 255, 0.6)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (physicsState.state !== state) {
                  e.currentTarget.style.borderColor = '#00ccff'
                  e.currentTarget.style.color = '#00ccff'
                }
              }}
              onMouseLeave={(e) => {
                if (physicsState.state !== state) {
                  e.currentTarget.style.borderColor = '#555'
                  e.currentTarget.style.color = '#fff'
                }
              }}
            >
              {state === 'solid' && '고체 (Solid)'}
              {state === 'liquid' && '액체 (Liquid)'}
              {state === 'gas' && '기체 (Gas)'}
            </button>
          ))}
        </div>

        {/* Checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          <input
            type="checkbox"
            checked={physicsState.showForces}
            onChange={handleToggleForces}
            style={{
              cursor: 'pointer',
              width: '16px',
              height: '16px',
            }}
          />
          입자 사이의 인력 표시
        </label>

        {/* Run/Pause Button */}
        <button
          onClick={handleToggleRun}
          style={{
            padding: '10px 20px',
            background: physicsState.isRunning ? '#ff6644' : '#66cc44',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: physicsState.isRunning ? '0 0 15px rgba(255, 102, 68, 0.6)' : '0 0 15px rgba(102, 204, 68, 0.6)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          {physicsState.isRunning ? '⏸ Pause' : '▶ Run'}
        </button>
      </div>
    </div>
  )
}
