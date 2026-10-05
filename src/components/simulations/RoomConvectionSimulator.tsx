import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'

const NUM_PARTICLES = 380
const ROOM_WIDTH = 20
const ROOM_HEIGHT = 8
const ROOM_DEPTH = 8
const PARTICLE_RADIUS = 0.14

interface Particle3D {
  id: number
  position: THREE.Vector3
  isHot: boolean
  phase: number // 0-1 circulation phase
}

export function RoomConvectionSimulator() {
  const { t } = useTranslation()
  const [isRunning, setIsRunning] = useState(true)
  const [acOn, setAcOn] = useState(false)
  const [heaterOn, setHeaterOn] = useState(false)

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#0a0a1a' }}>
      <Canvas camera={{ position: [35, 12, 20], fov: 40 }}>
        <RoomConvectionContent isRunning={isRunning} acOn={acOn} heaterOn={heaterOn} />
      </Canvas>

      <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(10, 10, 26, 0.95)', border: '2px solid #ff8c42', borderRadius: '12px', padding: '20px', color: '#fff', fontFamily: "'Segoe UI', sans-serif", maxWidth: '340px', fontSize: '13px', lineHeight: '1.6', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)', zIndex: 100 }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#ff8c42', fontWeight: '700' }}>🌬️ Room Convection</h2>
        <p style={{ margin: '8px 0 12px 0', fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>
          {(!acOn && !heaterOn) ? '💤 Calm' : '🌀 Clockwise'}
        </p>
        <p style={{ margin: '8px 0', fontSize: '12px', color: '#ef4444' }}>🔴 Red: Hot rises</p>
        <p style={{ margin: '8px 0', fontSize: '12px', color: '#3b82f6' }}>🔵 Blue: Cold sinks</p>
        <p style={{ margin: '0', fontSize: '11px', color: '#888' }}>Drag to rotate</p>
      </div>

      <div style={{ position: 'absolute', left: '20px', bottom: '30px', width: '340px', backgroundColor: 'rgba(10, 10, 26, 0.95)', border: '2px solid #ff8c42', borderRadius: '12px', padding: '20px', fontFamily: "'Segoe UI', sans-serif", zIndex: 100, backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={isRunning} onChange={(e) => setIsRunning(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#3b82f6' }} />
            ⏵ Run
          </label>
          <label style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={acOn} onChange={(e) => setAcOn(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
              ❄️ AC
            </span>
            <span style={{ fontSize: '12px', color: acOn ? '#3b82f6' : '#666' }}>{acOn ? 'ON' : 'OFF'}</span>
          </label>
          <label style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={heaterOn} onChange={(e) => setHeaterOn(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
              🔥 Heat
            </span>
            <span style={{ fontSize: '12px', color: heaterOn ? '#ef4444' : '#666' }}>{heaterOn ? 'ON' : 'OFF'}</span>
          </label>
        </div>
      </div>

      <button onClick={() => (window.location.href = '/chemistry')} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 100, padding: '0.75rem 1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
        ← Back
      </button>
    </div>
  )
}

function RoomConvectionContent({ isRunning, acOn, heaterOn }: { isRunning: boolean; acOn: boolean; heaterOn: boolean }) {
  const meshesRef = useRef<THREE.Mesh[]>([])
  const particlesRef = useRef<Particle3D[]>([])
  const [particles, setParticles] = useState<Particle3D[]>([])

  // Initialize dense particle cloud
  useEffect(() => {
    const newParticles: Particle3D[] = []
    for (let i = 0; i < NUM_PARTICLES; i++) {
      // Random initial positions throughout the room
      newParticles.push({
        id: i,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * (ROOM_WIDTH * 0.85),
          (Math.random() - 0.5) * (ROOM_HEIGHT * 0.85),
          (Math.random() - 0.5) * (ROOM_DEPTH * 0.85)
        ),
        isHot: Math.random() > 0.5,
        phase: Math.random(),
      })
    }
    particlesRef.current = newParticles
    setParticles([...newParticles])
  }, [])

  useFrame((_state, deltaTime) => {
    if (!isRunning) return

    const particles = particlesRef.current
    if (!particles.length) return

    const acPos = new THREE.Vector3(-ROOM_WIDTH / 2 + 2, ROOM_HEIGHT / 2 - 1, 0)
    const acRadius = 3
    const heaterPos = new THREE.Vector3(ROOM_WIDTH / 2 - 2, -ROOM_HEIGHT / 2 + 1, 0)
    const heaterRadius = 3.5

    const boundX = ROOM_WIDTH / 2 - PARTICLE_RADIUS
    const boundY = ROOM_HEIGHT / 2 - PARTICLE_RADIUS
    const boundZ = ROOM_DEPTH / 2 - PARTICLE_RADIUS

    // ========== RULE-BASED CIRCULATION ENGINE ==========
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]

      // RULE 1: Continuous Motion - Particles always move
      // RULE 2: Global Clockwise Circulation - Follow smooth path
      p.phase += deltaTime * 0.15 // Continuous progression through circulation cycle
      if (p.phase > 1) p.phase -= 1

      // Define clockwise circulation path through the room
      // Phase 0-0.25: Right side, moving UP (hot side)
      // Phase 0.25-0.5: Top, moving LEFT (AC side)
      // Phase 0.5-0.75: Left side, moving DOWN (AC side)
      // Phase 0.75-1.0: Bottom, moving RIGHT (heater side)

      const quarterPhase = p.phase * 4
      let targetX, targetY, targetZ

      if (quarterPhase < 1) {
        // RIGHT SIDE, MOVING UP
        targetX = (ROOM_WIDTH / 2 - 1.5)
        targetY = (quarterPhase * ROOM_HEIGHT) - ROOM_HEIGHT / 2
        targetZ = 0
      } else if (quarterPhase < 2) {
        // TOP, MOVING LEFT
        targetX = (ROOM_WIDTH / 2 - 1.5) - ((quarterPhase - 1) * ROOM_WIDTH)
        targetY = ROOM_HEIGHT / 2 - 1
        targetZ = 0
      } else if (quarterPhase < 3) {
        // LEFT SIDE, MOVING DOWN
        targetX = -(ROOM_WIDTH / 2 - 1.5)
        targetY = (ROOM_HEIGHT / 2 - 1) - ((quarterPhase - 2) * ROOM_HEIGHT)
        targetZ = 0
      } else {
        // BOTTOM, MOVING RIGHT
        targetX = -(ROOM_WIDTH / 2 - 1.5) + ((quarterPhase - 3) * ROOM_WIDTH)
        targetY = -ROOM_HEIGHT / 2 + 1
        targetZ = 0
      }

      // Smoothly move toward target position
      const moveSpeed = 0.35
      p.position.x += (targetX - p.position.x) * moveSpeed * deltaTime
      p.position.y += (targetY - p.position.y) * moveSpeed * deltaTime
      p.position.z += (targetZ - p.position.z) * moveSpeed * deltaTime

      // ========== RULE 3 & 4: STATE TRANSITIONS ==========
      // Heater: Blue -> Red when nearby
      if (heaterOn && !p.isHot && p.position.distanceTo(heaterPos) < heaterRadius) {
        p.isHot = true
      }

      // AC: Red -> Blue when nearby
      if (acOn && p.isHot && p.position.distanceTo(acPos) < acRadius) {
        p.isHot = false
      }

      // ========== RULE 5: PERSONAL SPACE & REPULSION ==========
      // Check nearby particles for overlap prevention
      for (let j = i + 1; j < Math.min(i + 40, particles.length); j++) {
        const other = particles[j]
        const dx = other.position.x - p.position.x
        const dy = other.position.y - p.position.y
        const dz = other.position.z - p.position.z
        const distSq = dx * dx + dy * dy + dz * dz
        const minDistSq = (PARTICLE_RADIUS * 2 + 0.1) ** 2

        if (distSq < minDistSq && distSq > 0.001) {
          const dist = Math.sqrt(distSq)
          const strength = (minDistSq - distSq) * 0.05
          const nx = (dx / dist) * strength
          const ny = (dy / dist) * strength
          const nz = (dz / dist) * strength

          p.position.x -= nx
          p.position.y -= ny
          p.position.z -= nz

          other.position.x += nx
          other.position.y += ny
          other.position.z += nz
        }
      }

      // ========== BOUNDARY ENFORCEMENT ==========
      if (Math.abs(p.position.x) > boundX) p.position.x = Math.sign(p.position.x) * boundX
      if (Math.abs(p.position.y) > boundY) p.position.y = Math.sign(p.position.y) * boundY
      if (Math.abs(p.position.z) > boundZ) p.position.z = Math.sign(p.position.z) * boundZ
    }

    // Update mesh positions
    for (let i = 0; i < particles.length; i++) {
      if (meshesRef.current[i]) {
        meshesRef.current[i].position.copy(particles[i].position)
      }
    }

    // Sync state
    setParticles([...particles])
  })

  return (
    <>
      <ambientLight intensity={0.85} />
      <pointLight position={[25, 10, 15]} intensity={1.1} color={0xffffff} />
      <pointLight position={[-20, -8, -12]} intensity={0.8} color={0xff8c42} />

      {/* Room Container */}
      <mesh>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshPhysicalMaterial transparent opacity={0.03} color={0xff8c42} metalness={0.1} roughness={0.8} />
      </mesh>

      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH)]} />
        <lineBasicMaterial attach="material" color={0xff8c42} linewidth={2} />
      </lineSegments>

      {/* AC Unit */}
      <group position={[-ROOM_WIDTH / 2 + 2, ROOM_HEIGHT / 2 - 1, 0]}>
        <mesh>
          <boxGeometry args={[2.5, 1, 1.5]} />
          <meshPhongMaterial color={acOn ? 0x3b82f6 : 0x1e3a5f} emissive={acOn ? 0x1e40af : 0x0f172a} emissiveIntensity={acOn ? 1.2 : 0.2} />
        </mesh>
        {[-0.6, 0, 0.6].map((x) => (
          <mesh key={`ac-${x}`} position={[x, 0, 0.85]}>
            <boxGeometry args={[0.4, 0.3, 0.3]} />
            <meshPhongMaterial color={acOn ? 0x60a5fa : 0x1e293b} emissive={acOn ? 0x3b82f6 : 0x0f172a} emissiveIntensity={acOn ? 0.9 : 0.1} />
          </mesh>
        ))}
      </group>

      {/* Heater Unit */}
      <group position={[ROOM_WIDTH / 2 - 2, -ROOM_HEIGHT / 2 + 0.7, 0]}>
        <mesh>
          <boxGeometry args={[2, 0.8, 2]} />
          <meshPhongMaterial color={heaterOn ? 0xef4444 : 0x5f2c2c} emissive={heaterOn ? 0xdc2626 : 0x1f2937} emissiveIntensity={heaterOn ? 1.3 : 0.2} />
        </mesh>
        {[-0.5, 0, 0.5].map((x) => (
          <mesh key={`heat-${x}`} position={[x, 0.5, 0]}>
            <boxGeometry args={[0.3, 0.7, 1.8]} />
            <meshPhongMaterial color={heaterOn ? 0xf87171 : 0x7f1d1d} emissive={heaterOn ? 0xef4444 : 0x1f2937} emissiveIntensity={heaterOn ? 0.95 : 0.1} />
          </mesh>
        ))}
      </group>

      {/* Rich Volumetric Particle Cloud */}
      {particles.map((particle, idx) => (
        <mesh
          key={particle.id}
          ref={(el) => {
            if (el) meshesRef.current[idx] = el
          }}
          position={[particle.position.x, particle.position.y, particle.position.z]}
        >
          <sphereGeometry args={[PARTICLE_RADIUS, 5, 5]} />
          <meshPhongMaterial
            color={particle.isHot ? 0xef4444 : 0x3b82f6}
            emissive={particle.isHot ? 0xdc2626 : 0x1e40af}
            emissiveIntensity={0.8}
            shininess={90}
          />
        </mesh>
      ))}

      <OrbitControls enableZoom enablePan enableRotate autoRotate={false} minDistance={30} maxDistance={70} />
    </>
  )
}
