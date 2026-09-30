import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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

const NUM_PARTICLES = 1200
const CONTAINER_SIZE = 20
const PARTICLE_RADIUS = 0.09
const PARTICLES_PER_LAYER = Math.ceil(NUM_PARTICLES / 3)
const GRID_SIZE = Math.ceil(Math.sqrt(PARTICLES_PER_LAYER))
const USABLE_WIDTH = CONTAINER_SIZE - 2 * PARTICLE_RADIUS
const SPACING = GRID_SIZE > 1 ? USABLE_WIDTH / (GRID_SIZE - 1) : USABLE_WIDTH
const START_OFFSET = -CONTAINER_SIZE / 2 + PARTICLE_RADIUS

function StatesOfMatterScene({ state, showForces, isRunning, temperature }: any) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  const particleStatesRef = useRef<ParticleState[]>([])
  const linesRef = useRef<THREE.LineSegments>(null)
  const timeRef = useRef(0)
  const prevStateRef = useRef<'solid' | 'liquid' | 'gas'>('solid')
  const speedMultiplier = (temperature + 30) / 60

  useEffect(() => {
    if (!particleStatesRef.current.length) {
      let idx = 0
      for (let layer = 0; layer < 3; layer++) {
        const layerY = -CONTAINER_SIZE / 2 + 1.2 + layer * SPACING * 0.6
        for (let i = 0; i < PARTICLES_PER_LAYER && idx < NUM_PARTICLES; i++) {
          const gx = i % GRID_SIZE
          const gz = Math.floor(i / GRID_SIZE)
          const x = START_OFFSET + gx * SPACING
          const z = START_OFFSET + gz * SPACING
          particleStatesRef.current.push({
            position: new THREE.Vector3(x, layerY, z),
            velocity: new THREE.Vector3(0, 0, 0),
            targetPosition: new THREE.Vector3(x, layerY, z),
            baseX: x,
            baseZ: z,
            baseY: layerY,
            vibrationPhase: Math.random() * Math.PI * 2,
          })
          idx++
        }
      }

      if (instancedMeshRef.current) {
        const matrix = new THREE.Matrix4()
        particleStatesRef.current.forEach((p, idx) => {
          matrix.setPosition(p.position.x, p.position.y, p.position.z)
          instancedMeshRef.current!.setMatrixAt(idx, matrix)
        })
        instancedMeshRef.current.instanceMatrix.needsUpdate = true
      }
    }

    if (state !== prevStateRef.current) {
      prevStateRef.current = state
      particleStatesRef.current.forEach((p, i) => {
        if (state === 'solid') {
          const layer = Math.floor(i / PARTICLES_PER_LAYER)
          const lIdx = i % PARTICLES_PER_LAYER
          const gx = lIdx % GRID_SIZE
          const gz = Math.floor(lIdx / GRID_SIZE)
          p.targetPosition.set(START_OFFSET + gx * SPACING, -CONTAINER_SIZE / 2 + 1.2 + layer * SPACING * 0.6, START_OFFSET + gz * SPACING)
          p.velocity.set(0, 0, 0)
        } else if (state === 'liquid') {
          p.targetPosition.set((Math.random() - 0.5) * CONTAINER_SIZE * 0.95, -CONTAINER_SIZE / 2 + 2.2, (Math.random() - 0.5) * CONTAINER_SIZE * 0.95)
          p.velocity.set((Math.random() - 0.5) * 1.5, 0, (Math.random() - 0.5) * 1.5)
        } else {
          p.targetPosition.set((Math.random() - 0.5) * CONTAINER_SIZE * 0.95, (Math.random() - 0.5) * CONTAINER_SIZE * 0.95, (Math.random() - 0.5) * CONTAINER_SIZE * 0.95)
          p.velocity.set((Math.random() - 0.5) * 20 * speedMultiplier, (Math.random() - 0.5) * 20 * speedMultiplier, (Math.random() - 0.5) * 20 * speedMultiplier)
        }
      })
    }
  }, [state, instancedMeshRef])

  useFrame(() => {
    if (!instancedMeshRef.current) return

    const particles = particleStatesRef.current
    if (!particles.length) return

    const bounceDistance = CONTAINER_SIZE / 2 - PARTICLE_RADIUS
    const matrix = new THREE.Matrix4()

    if (isRunning) {
      timeRef.current += 0.016

      particles.forEach((p) => {
        p.position.lerp(p.targetPosition, 0.1)

        if (state === 'solid') {
          p.vibrationPhase += 0.12 * speedMultiplier
          const amp = 0.04 * speedMultiplier
          p.position.x = p.targetPosition.x + Math.sin(p.vibrationPhase) * amp * 0.6
          p.position.y = p.targetPosition.y + Math.cos(p.vibrationPhase * 0.7) * amp * 0.3
          p.position.z = p.targetPosition.z + Math.sin(p.vibrationPhase * 0.9) * amp * 0.6
        } else if (state === 'liquid') {
          const ripple = 0.2 * speedMultiplier
          p.position.y = p.targetPosition.y + Math.sin(timeRef.current * 2 * speedMultiplier + p.baseX * 0.3) * ripple
          p.position.x += (Math.random() - 0.5) * 0.15 * speedMultiplier
          p.position.z += (Math.random() - 0.5) * 0.15 * speedMultiplier
          p.velocity.y -= 0.016 * speedMultiplier
          if (p.position.y < -CONTAINER_SIZE / 2 + PARTICLE_RADIUS) {
            p.position.y = -CONTAINER_SIZE / 2 + PARTICLE_RADIUS
            p.velocity.y *= -0.2
          }
        } else {
          p.position.add(p.velocity.clone().multiplyScalar(0.016 * speedMultiplier * 2))
          if (Math.abs(p.position.x) > bounceDistance) {
            p.position.x = Math.sign(p.position.x) * bounceDistance
            p.velocity.x *= -0.9
          }
          if (Math.abs(p.position.y) > bounceDistance) {
            p.position.y = Math.sign(p.position.y) * bounceDistance
            p.velocity.y *= -0.9
          }
          if (Math.abs(p.position.z) > bounceDistance) {
            p.position.z = Math.sign(p.position.z) * bounceDistance
            p.velocity.z *= -0.9
          }
          p.velocity.x += (Math.random() - 0.5) * 8 * speedMultiplier
          p.velocity.y += (Math.random() - 0.5) * 8 * speedMultiplier
          p.velocity.z += (Math.random() - 0.5) * 8 * speedMultiplier
          const maxSpeed = 15 * speedMultiplier
          const speed = p.velocity.length()
          if (speed > maxSpeed) p.velocity.multiplyScalar(maxSpeed / speed)
        }
      })
    }

    particles.forEach((p, idx) => {
      matrix.setPosition(p.position.x, p.position.y, p.position.z)
      instancedMeshRef.current!.setMatrixAt(idx, matrix)
    })
    instancedMeshRef.current.instanceMatrix.needsUpdate = true

    if (linesRef.current) {
      const positions: number[] = []
      if (showForces && (state === 'solid' || state === 'liquid')) {
        const threshold = state === 'solid' ? SPACING * 1.15 : SPACING * 1.4
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < Math.min(i + 18, particles.length); j++) {
            const dist = particles[i].position.distanceTo(particles[j].position)
            if (dist < threshold) {
              positions.push(particles[i].position.x, particles[i].position.y, particles[i].position.z)
              positions.push(particles[j].position.x, particles[j].position.y, particles[j].position.z)
            }
          }
        }
      }
      const geometry = linesRef.current.geometry as THREE.BufferGeometry
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
      geometry.attributes.position.needsUpdate = true
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
      {showForces && (
        <lineSegments ref={linesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={0} array={new Float32Array(0)} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color={0xff4444} linewidth={1} transparent opacity={0.6} />
        </lineSegments>
      )}
      <ambientLight intensity={0.7} />
      <pointLight position={[15, 15, 15]} intensity={1.2} />
      <pointLight position={[-12, -8, -12]} intensity={0.6} color={0x0088ff} />
      <OrbitControls enableZoom enablePan enableRotate autoRotate autoRotateSpeed={1.5} minDistance={25} maxDistance={60} />
    </>
  )
}

export function StatesOfMatter() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [state, setState] = useState<'solid' | 'liquid' | 'gas'>('solid')
  const [showForces, setShowForces] = useState(true)
  const [isRunning, setIsRunning] = useState(true)
  const [temperature, setTemperature] = useState(20)

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0a0a1a' }}>
      <Canvas camera={{ position: [32, 26, 32], fov: 40 }} style={{ width: '100%', height: '100%' }} gl={{ antialias: true, alpha: true }}>
        <StatesOfMatterScene state={state} showForces={showForces} isRunning={isRunning} temperature={temperature} />
      </Canvas>

      <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(10, 10, 26, 0.95)', border: '2px solid #3366ff', borderRadius: '12px', padding: '20px', color: '#fff', fontFamily: "'Segoe UI', sans-serif", maxWidth: '380px', fontSize: '12px', lineHeight: '1.6', boxShadow: '0 8px 32px rgba(51, 102, 255, 0.2)', zIndex: 50, backdropFilter: 'blur(10px)' }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700', color: '#66ccff' }}>{t('states_of_matter_title')}</h2>
        <p style={{ margin: 0, fontSize: '11px' }}>{t('states_of_matter_content')}</p>
      </div>

      <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(10, 10, 26, 0.95)', border: '2px solid #3366ff', borderRadius: '12px', padding: '20px 30px', display: 'flex', gap: '20px', alignItems: 'center', zIndex: 50, flexWrap: 'wrap', justifyContent: 'center', boxShadow: '0 8px 32px rgba(51, 102, 255, 0.2)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(['solid', 'liquid', 'gas'] as const).map((s) => (
            <button key={s} onClick={() => setState(s)} style={{ padding: '10px 18px', background: state === s ? '#00ccff' : '#333', color: state === s ? '#000' : '#fff', border: `2px solid ${state === s ? '#00ccff' : '#555'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: state === s ? '0 0 15px rgba(0, 204, 255, 0.6)' : 'none', transition: 'all 0.3s ease' }}>
              {s === 'solid' && t('solid_state')} {s === 'liquid' && t('liquid_state')} {s === 'gas' && t('gas_state')}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '160px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>
            🌡️ {temperature}°C
            <input type="range" min="-20" max="120" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '2px', fontSize: '10px', color: '#888', textAlign: 'center', paddingTop: '4px' }}>
            <span>-20°C</span> <span>0°C</span> <span>100°C</span> <span>⚡ ∞</span>
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>
          <input type="checkbox" checked={showForces} onChange={() => setShowForces(!showForces)} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
          {t('show_forces_short')}
        </label>
        <button onClick={() => setIsRunning(!isRunning)} style={{ padding: '10px 20px', background: isRunning ? '#ff6644' : '#66cc44', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: isRunning ? '0 0 15px rgba(255, 102, 68, 0.6)' : '0 0 15px rgba(102, 204, 68, 0.6)' }}>
          {isRunning ? t('pause_button') : t('play_button')}
        </button>
      </div>

      <button onClick={() => navigate('/chemistry')} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 100, padding: '0.75rem 1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', transition: 'all 0.3s ease' }}>
        {t('back_button')}
      </button>
    </div>
  )
}
