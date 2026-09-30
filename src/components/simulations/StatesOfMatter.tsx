import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'

interface ParticleState {
  position: THREE.Vector3
  velocity: THREE.Vector3
  targetPosition: THREE.Vector3
  baseX: number
  baseZ: number
  baseY: number
  vibrationPhase: number
}

const NUM_PARTICLES = 1000
const CONTAINER_SIZE = 16
const PARTICLE_RADIUS = 0.09
const PARTICLES_PER_LAYER = Math.ceil(NUM_PARTICLES / 3)
const GRID_SIZE = Math.ceil(Math.sqrt(PARTICLES_PER_LAYER))
const SPACING = CONTAINER_SIZE * 0.95 / GRID_SIZE

interface PhysicsState {
  state: 'solid' | 'liquid' | 'gas'
  showForces: boolean
  isRunning: boolean
  temperature: number
}

function StatesOfMatterScene({ physicsState }: { physicsState: PhysicsState }) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  const particleStatesRef = useRef<ParticleState[]>([])
  const linesRef = useRef<THREE.LineSegments>(null)
  const timeRef = useRef(0)
  const prevStateRef = useRef<'solid' | 'liquid' | 'gas'>('solid')

  const speedMultiplier = (physicsState.temperature + 30) / 60

  useEffect(() => {
    if (!particleStatesRef.current.length) {
      let particleIndex = 0

      for (let layer = 0; layer < 3; layer++) {
        const layerY = -CONTAINER_SIZE / 2 + 0.8 + layer * SPACING * 0.6
        for (let i = 0; i < PARTICLES_PER_LAYER && particleIndex < NUM_PARTICLES; i++) {
          const gridX = i % GRID_SIZE
          const gridZ = Math.floor(i / GRID_SIZE)
          const x = (gridX - GRID_SIZE / 2) * SPACING
          const z = (gridZ - GRID_SIZE / 2) * SPACING

          particleStatesRef.current.push({
            position: new THREE.Vector3(x, layerY, z),
            velocity: new THREE.Vector3(0, 0, 0),
            targetPosition: new THREE.Vector3(x, layerY, z),
            baseX: x,
            baseZ: z,
            baseY: layerY,
            vibrationPhase: Math.random() * Math.PI * 2,
          })
          particleIndex++
        }
      }

      while (particleIndex < NUM_PARTICLES) {
        const randomX = (Math.random() - 0.5) * CONTAINER_SIZE * 0.9
        const randomZ = (Math.random() - 0.5) * CONTAINER_SIZE * 0.9
        particleStatesRef.current.push({
          position: new THREE.Vector3(randomX, -CONTAINER_SIZE / 2 + 1.5, randomZ),
          velocity: new THREE.Vector3(0, 0, 0),
          targetPosition: new THREE.Vector3(randomX, -CONTAINER_SIZE / 2 + 1.5, randomZ),
          baseX: randomX,
          baseZ: randomZ,
          baseY: -CONTAINER_SIZE / 2 + 1.5,
          vibrationPhase: Math.random() * Math.PI * 2,
        })
        particleIndex++
      }
    }

    if (physicsState.state !== prevStateRef.current) {
      prevStateRef.current = physicsState.state
      initializeStateTransition()
    }
  }, [physicsState.state])

  const initializeStateTransition = () => {
    let particleIndex = 0

    particleStatesRef.current.forEach((particle, i) => {
      if (physicsState.state === 'solid') {
        const layer = Math.floor(i / PARTICLES_PER_LAYER)
        const layerIndex = i % PARTICLES_PER_LAYER
        const gridX = layerIndex % GRID_SIZE
        const gridZ = Math.floor(layerIndex / GRID_SIZE)
        const x = (gridX - GRID_SIZE / 2) * SPACING
        const z = (gridZ - GRID_SIZE / 2) * SPACING
        const y = -CONTAINER_SIZE / 2 + 0.8 + layer * SPACING * 0.6

        particle.targetPosition.set(x, y, z)
        particle.baseX = x
        particle.baseZ = z
        particle.baseY = y
        particle.velocity.set(0, 0, 0)
      } else if (physicsState.state === 'liquid') {
        const randomX = (Math.random() - 0.5) * CONTAINER_SIZE * 0.95
        const randomZ = (Math.random() - 0.5) * CONTAINER_SIZE * 0.95
        particle.targetPosition.set(randomX, -CONTAINER_SIZE / 2 + 2, randomZ)
        particle.baseX = randomX
        particle.baseZ = randomZ
        particle.velocity.set((Math.random() - 0.5) * 1.5, 0, (Math.random() - 0.5) * 1.5)
      } else {
        const randomX = (Math.random() - 0.5) * CONTAINER_SIZE * 0.95
        const randomY = (Math.random() - 0.5) * CONTAINER_SIZE * 0.95
        const randomZ = (Math.random() - 0.5) * CONTAINER_SIZE * 0.95
        particle.targetPosition.set(randomX, randomY, randomZ)
        particle.velocity.set(
          (Math.random() - 0.5) * 20 * speedMultiplier,
          (Math.random() - 0.5) * 20 * speedMultiplier,
          (Math.random() - 0.5) * 20 * speedMultiplier
        )
      }
    })
  }

  useFrame(() => {
    if (!physicsState.isRunning || !instancedMeshRef.current) return

    timeRef.current += 0.016
    const particles = particleStatesRef.current
    const bounceDistance = CONTAINER_SIZE / 2 - PARTICLE_RADIUS
    const matrix = new THREE.Matrix4()

    particles.forEach((particle, idx) => {
      const lerpFactor = 0.1
      const velocityLerpFactor = 0.15

      particle.position.lerp(particle.targetPosition, lerpFactor)

      if (physicsState.state === 'solid') {
        const thermalAmplitude = 0.04 * speedMultiplier
        particle.vibrationPhase += 0.12 * speedMultiplier
        const vibX = Math.sin(particle.vibrationPhase) * thermalAmplitude * 0.6
        const vibY = Math.cos(particle.vibrationPhase * 0.7) * thermalAmplitude * 0.3
        const vibZ = Math.sin(particle.vibrationPhase * 0.9) * thermalAmplitude * 0.6

        particle.position.x = particle.targetPosition.x + vibX
        particle.position.y = particle.targetPosition.y + vibY
        particle.position.z = particle.targetPosition.z + vibZ
      } else if (physicsState.state === 'liquid') {
        const rippleAmplitude = 0.2 * speedMultiplier
        const rippleFrequency = 2 * speedMultiplier
        const waveHeight = Math.sin(timeRef.current * rippleFrequency + particle.baseX * 0.3) * rippleAmplitude
        particle.position.y = particle.targetPosition.y + waveHeight

        const brownianScale = 0.15 * speedMultiplier
        const brownianX = (Math.random() - 0.5) * brownianScale
        const brownianZ = (Math.random() - 0.5) * brownianScale
        particle.position.x += brownianX
        particle.position.z += brownianZ

        const gravity = 0.95
        particle.velocity.y -= (1 - gravity) * 0.016 * speedMultiplier
        if (particle.position.y < -CONTAINER_SIZE / 2 + PARTICLE_RADIUS) {
          particle.position.y = -CONTAINER_SIZE / 2 + PARTICLE_RADIUS
          particle.velocity.y *= -0.2
        }
      } else if (physicsState.state === 'gas') {
        const gasSpeedMultiplier = 15 * speedMultiplier
        particle.position.add(particle.velocity.clone().multiplyScalar(0.016 * speedMultiplier * 2))

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

        particle.velocity.x += (Math.random() - 0.5) * 8 * speedMultiplier
        particle.velocity.y += (Math.random() - 0.5) * 8 * speedMultiplier
        particle.velocity.z += (Math.random() - 0.5) * 8 * speedMultiplier

        const maxSpeed = 15 * speedMultiplier
        const speed = particle.velocity.length()
        if (speed > maxSpeed) {
          particle.velocity.multiplyScalar(maxSpeed / speed)
        }
      }

      matrix.setPosition(particle.position.x, particle.position.y, particle.position.z)
      instancedMeshRef.current!.setMatrixAt(idx, matrix)
    })

    instancedMeshRef.current.instanceMatrix.needsUpdate = true

    if (physicsState.showForces && linesRef.current) {
      const positions: number[] = []

      if (physicsState.state === 'solid' && Math.random() < 0.3) {
        const particlesPerLayer = PARTICLES_PER_LAYER
        particles.forEach((p1, i) => {
          const layer = Math.floor(i / particlesPerLayer)
          const layerIndex = i % particlesPerLayer
          const x = layerIndex % GRID_SIZE
          const y = Math.floor(layerIndex / GRID_SIZE)

          const neighbors = [
            layer * particlesPerLayer + ((x + 1) % GRID_SIZE) + y * GRID_SIZE,
            layer * particlesPerLayer + x + ((y + 1) % GRID_SIZE) * GRID_SIZE,
            ((layer + 1) % 3) * particlesPerLayer + x + y * GRID_SIZE,
          ]

          neighbors.forEach((j) => {
            if (j < NUM_PARTICLES && j !== i) {
              const p2 = particles[j]
              positions.push(p1.position.x, p1.position.y, p1.position.z)
              positions.push(p2.position.x, p2.position.y, p2.position.z)
            }
          })
        })
      } else if (physicsState.state === 'liquid' && Math.random() < 0.1) {
        for (let i = 0; i < particles.length; i += 5) {
          for (let j = i + 1; j < Math.min(i + 10, particles.length); j++) {
            const p1 = particles[i]
            const p2 = particles[j]
            const dist = p1.position.distanceTo(p2.position)
            if (dist < 0.8) {
              positions.push(p1.position.x, p1.position.y, p1.position.z)
              positions.push(p2.position.x, p2.position.y, p2.position.z)
            }
          }
        }
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
      <mesh>
        <boxGeometry args={[CONTAINER_SIZE, CONTAINER_SIZE, CONTAINER_SIZE]} />
        <meshPhysicalMaterial transparent opacity={0.06} color={0x3366ff} metalness={0.15} roughness={0.7} />
      </mesh>

      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(CONTAINER_SIZE, CONTAINER_SIZE, CONTAINER_SIZE)]} />
        <lineBasicMaterial attach="material" color={0x6699ff} linewidth={1} />
      </lineSegments>

      <instancedMesh ref={instancedMeshRef} args={[new THREE.SphereGeometry(PARTICLE_RADIUS, 8, 8), new THREE.MeshPhongMaterial({ color: 0x00ddff, emissive: 0x0055ff, shininess: 80 }), NUM_PARTICLES]} />

      {physicsState.showForces && (
        <lineSegments ref={linesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={0} array={new Float32Array(0)} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color={0xff4444} linewidth={1} transparent opacity={0.6} />
        </lineSegments>
      )}

      <ambientLight intensity={0.7} />
      <pointLight position={[12, 12, 12]} intensity={1.2} />
      <pointLight position={[-12, -8, -12]} intensity={0.6} color={0x0088ff} />

      <OrbitControls enableZoom enablePan enableRotate autoRotate autoRotateSpeed={1.5} minDistance={20} maxDistance={50} />
    </>
  )
}

export function StatesOfMatter() {
  const navigate = useNavigate()
  const [state, setState] = useState<'solid' | 'liquid' | 'gas'>('solid')
  const [showForces, setShowForces] = useState(true)
  const [isRunning, setIsRunning] = useState(true)
  const [temperature, setTemperature] = useState(20)

  const physicsState: PhysicsState = {
    state,
    showForces,
    isRunning,
    temperature,
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0a0a1a' }}>
      <Canvas camera={{ position: [22, 18, 22], fov: 45 }} style={{ width: '100%', height: '100%' }} gl={{ antialias: true, alpha: true }}>
        <StatesOfMatterScene physicsState={physicsState} />
      </Canvas>

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
        <h2 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700', color: '#66ccff' }}>물질의 상태 변화</h2>
        <p style={{ margin: 0, textAlign: 'justify', color: '#ccc', fontSize: '12px' }}>
          자연계의 모든 물질은 온도와 압력 조건에 따라 고체, 액체, 기체라는 세 가지 서로 다른 상(Phase)을 띱니다. 고체 상태일 때는 입자들이 강하게 결합하여 고정된 형태와 일정한
          부피를 유지합니다. 반면 액체 상태에서는 입자 간의 결합이 다소 느슨해져 부피는 유지하되 용기의 형태에 맞춰 자유롭게 흐르며 모양을 바꿀 수 있습니다. 기체 상태에 도달하면
          입자들이 공간 제약 없이 활발하게 운동하며, 형태는 물론 부피마저 외부 조건에 따라 유동적으로 팽창하거나 수축합니다.
        </p>
      </div>

      <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(10, 10, 26, 0.95)', border: '2px solid #3366ff', borderRadius: '12px', padding: '20px 30px', display: 'flex', gap: '20px', alignItems: 'center', zIndex: 50, flexWrap: 'wrap', justifyContent: 'center', boxShadow: '0 8px 32px rgba(51, 102, 255, 0.2)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(['solid', 'liquid', 'gas'] as const).map((s) => (
            <button key={s} onClick={() => setState(s)} style={{ padding: '10px 18px', background: state === s ? '#00ccff' : '#333', color: state === s ? '#000' : '#fff', border: `2px solid ${state === s ? '#00ccff' : '#555'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.3s ease', boxShadow: state === s ? '0 0 15px rgba(0, 204, 255, 0.6)' : 'none' }} onMouseEnter={(e) => { if (state !== s) { e.currentTarget.style.borderColor = '#00ccff'; e.currentTarget.style.color = '#00ccff' } }} onMouseLeave={(e) => { if (state !== s) { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#fff' } }}>
              {s === 'solid' && '고체'} {s === 'liquid' && '액체'} {s === 'gas' && '기체'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
            🌡️ {temperature}°C
            <input type="range" min="-20" max="120" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} style={{ width: '120px', cursor: 'pointer' }} />
          </label>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
          <input type="checkbox" checked={showForces} onChange={() => setShowForces(!showForces)} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
          인력 표시
        </label>

        <button onClick={() => setIsRunning(!isRunning)} style={{ padding: '10px 20px', background: isRunning ? '#ff6644' : '#66cc44', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.3s ease', boxShadow: isRunning ? '0 0 15px rgba(255, 102, 68, 0.6)' : '0 0 15px rgba(102, 204, 68, 0.6)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}>
          {isRunning ? '⏸ Pause' : '▶ Run'}
        </button>
      </div>

      <button onClick={() => navigate('/chemistry')} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 100, padding: '0.75rem 1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)' }}>
        ← Back
      </button>
    </div>
  )
}
