import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'

const NUM_PARTICLES = 3500 // 10x density
const ROOM_WIDTH = 20
const ROOM_HEIGHT = 8
const ROOM_DEPTH = 8
const PARTICLE_RADIUS = 0.12

interface Particle3D {
  position: THREE.Vector3
  velocity: THREE.Vector3
  isHot: boolean // true = red/hot, false = blue/cold
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

      {/* Info Panel */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(10, 10, 26, 0.95)', border: '2px solid #ff8c42', borderRadius: '12px', padding: '20px', color: '#fff', fontFamily: "'Segoe UI', sans-serif", maxWidth: '340px', fontSize: '13px', lineHeight: '1.6', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)', zIndex: 100 }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#ff8c42', fontWeight: '700' }}>🌬️ Room Convection</h2>
        <p style={{ margin: '8px 0 12px 0', fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>
          {(!acOn && !heaterOn) ? '💤 Calm' : '🌀 Clockwise Circulation'}
        </p>
        <p style={{ margin: '8px 0', fontSize: '12px', color: '#ff6b6b' }}>
          🔴 Red: Hot air rises
        </p>
        <p style={{ margin: '8px 0', fontSize: '12px', color: '#4a9eff' }}>
          🔵 Blue: Cold air sinks
        </p>
        <p style={{ margin: '0', fontSize: '11px', color: '#888' }}>
          Drag mouse to rotate view
        </p>
      </div>

      {/* Control Panel */}
      <div style={{ position: 'absolute', left: '20px', bottom: '30px', width: '340px', backgroundColor: 'rgba(10, 10, 26, 0.95)', border: '2px solid #ff8c42', borderRadius: '12px', padding: '20px', fontFamily: "'Segoe UI', sans-serif", zIndex: 100, backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={isRunning} onChange={(e) => setIsRunning(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#4a9eff' }} />
            ⏵ Run Simulation
          </label>
          <label style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={acOn} onChange={(e) => setAcOn(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#4a9eff' }} />
              ❄️ 에어컨 (AC)
            </span>
            <span style={{ fontSize: '12px', color: acOn ? '#4a9eff' : '#888' }}>{acOn ? 'ON' : 'OFF'}</span>
          </label>
          <label style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={heaterOn} onChange={(e) => setHeaterOn(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#ff6b35' }} />
              🔥 난로 (Heater)
            </span>
            <span style={{ fontSize: '12px', color: heaterOn ? '#ff6b35' : '#888' }}>{heaterOn ? 'ON' : 'OFF'}</span>
          </label>
        </div>
      </div>

      {/* Back Button */}
      <button onClick={() => (window.location.href = '/chemistry')} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 100, padding: '0.75rem 1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', transition: 'all 0.3s ease' }}>
        ← Back
      </button>
    </div>
  )
}

function RoomConvectionContent({ isRunning, acOn, heaterOn }: { isRunning: boolean; acOn: boolean; heaterOn: boolean }) {
  const meshesRef = useRef<THREE.Mesh[]>([])
  const particlesRef = useRef<Particle3D[]>([])
  const [particles, setParticles] = useState<Particle3D[]>([])

  // Initialize massive particle density - CRITICAL FIX
  useEffect(() => {
    const newParticles: Particle3D[] = []
    for (let i = 0; i < NUM_PARTICLES; i++) {
      newParticles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * (ROOM_WIDTH * 0.85),
          (Math.random() - 0.5) * (ROOM_HEIGHT * 0.85),
          (Math.random() - 0.5) * (ROOM_DEPTH * 0.85)
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        isHot: Math.random() > 0.5,
      })
    }
    particlesRef.current = newParticles
    setParticles([...newParticles])
  }, [])

  useFrame((_state, deltaTime) => {
    if (!isRunning) return

    const particles = particlesRef.current

    // AC: top-left ceiling
    const acPos = new THREE.Vector3(-ROOM_WIDTH / 2 + 2, ROOM_HEIGHT / 2 - 1, 0)
    const acRadius = 2.5

    // Heater: bottom-right floor
    const heaterPos = new THREE.Vector3(ROOM_WIDTH / 2 - 2, -ROOM_HEIGHT / 2 + 1, 0)
    const heaterRadius = 3

    const bounceDistance = {
      x: ROOM_WIDTH / 2 - PARTICLE_RADIUS,
      y: ROOM_HEIGHT / 2 - PARTICLE_RADIUS,
      z: ROOM_DEPTH / 2 - PARTICLE_RADIUS,
    }

    particles.forEach((particle, idx) => {
      // ========== STATE TRANSITIONS ==========
      // Hot particle reaches AC: turn blue and push down
      if (acOn && particle.isHot) {
        const distToAC = particle.position.distanceTo(acPos)
        if (distToAC < acRadius) {
          particle.isHot = false // Turn BLUE (cold)
          particle.velocity.y -= 1.2 // Strong downward push
        }
      }

      // Cold particle reaches Heater: turn red and push up
      if (heaterOn && !particle.isHot) {
        const distToHeater = particle.position.distanceTo(heaterPos)
        if (distToHeater < heaterRadius) {
          particle.isHot = true // Turn RED (hot)
          particle.velocity.y += 1.3 // Strong upward push
        }
      }

      // ========== BUOYANCY PHYSICS ==========
      if (particle.isHot) {
        // Hot particles: natural upward buoyancy
        particle.velocity.y += 0.7
      } else {
        // Cold particles: natural downward gravity
        particle.velocity.y -= 0.6
      }

      // ========== CLOCKWISE CIRCULATION ==========
      // Red particles sweep right across ceiling, then left across floor
      if (particle.position.y > ROOM_HEIGHT / 3) {
        // Upper region: sweep rightward (toward heater)
        particle.velocity.x += 0.4
      } else if (particle.position.y < -ROOM_HEIGHT / 3) {
        // Lower region: sweep leftward (toward AC)
        particle.velocity.x -= 0.4
      }

      // Brownian motion
      particle.velocity.x += (Math.random() - 0.5) * 0.1
      particle.velocity.y += (Math.random() - 0.5) * 0.08
      particle.velocity.z += (Math.random() - 0.5) * 0.1

      // Damping
      particle.velocity.multiplyScalar(0.94)

      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime))

      // ========== PARTICLE-PARTICLE COLLISION ==========
      for (let j = idx + 1; j < Math.min(idx + 40, particles.length); j++) {
        const other = particles[j]
        const dx = other.position.x - particle.position.x
        const dy = other.position.y - particle.position.y
        const dz = other.position.z - particle.position.z
        const distSq = dx * dx + dy * dy + dz * dz
        const minDistSq = (PARTICLE_RADIUS * 2 + 0.08) ** 2

        if (distSq < minDistSq && distSq > 0.001) {
          const dist = Math.sqrt(distSq)
          const nx = dx / dist
          const ny = dy / dist
          const nz = dz / dist
          const pushForce = (minDistSq - distSq) * 0.15

          particle.velocity.x -= nx * pushForce
          particle.velocity.y -= ny * pushForce
          particle.velocity.z -= nz * pushForce

          other.velocity.x += nx * pushForce
          other.velocity.y += ny * pushForce
          other.velocity.z += nz * pushForce
        }
      }

      // ========== STRICT BOUNDARY COLLISION ==========
      if (Math.abs(particle.position.x) > bounceDistance.x) {
        particle.position.x = Math.sign(particle.position.x) * bounceDistance.x
        particle.velocity.x *= -0.8
      }
      if (Math.abs(particle.position.y) > bounceDistance.y) {
        particle.position.y = Math.sign(particle.position.y) * bounceDistance.y
        particle.velocity.y *= -0.8
      }
      if (Math.abs(particle.position.z) > bounceDistance.z) {
        particle.position.z = Math.sign(particle.position.z) * bounceDistance.z
        particle.velocity.z *= -0.8
      }

      // Update mesh position
      if (meshesRef.current[idx]) {
        meshesRef.current[idx].position.copy(particle.position)
      }
    })

    // Update React state for re-render (batched update for performance)
    setParticles([...particlesRef.current])
  })

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[25, 10, 15]} intensity={1.2} color={0xffffff} />
      <pointLight position={[-20, -8, -12]} intensity={0.7} color={0xff8c42} />

      {/* Wide rectangular room */}
      <mesh>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshPhysicalMaterial transparent opacity={0.04} color={0xff8c42} metalness={0.1} roughness={0.8} />
      </mesh>

      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH)]} />
        <lineBasicMaterial attach="material" color={0xff8c42} linewidth={2} />
      </lineSegments>

      {/* Large AC Unit */}
      <group position={[-ROOM_WIDTH / 2 + 2, ROOM_HEIGHT / 2 - 1, 0]}>
        <mesh>
          <boxGeometry args={[2.5, 1, 1.5]} />
          <meshPhongMaterial color={acOn ? 0x4a9eff : 0x2a4a6a} emissive={acOn ? 0x2577ff : 0x1a2a3a} emissiveIntensity={acOn ? 1.3 : 0.3} shininess={90} />
        </mesh>
        {[-0.6, 0, 0.6].map((x) => (
          <mesh key={`ac-${x}`} position={[x, 0, 0.85]}>
            <boxGeometry args={[0.4, 0.3, 0.3]} />
            <meshPhongMaterial color={acOn ? 0x6cc0ff : 0x3a4a6a} emissive={acOn ? 0x4a9eff : 0x2a3a4a} emissiveIntensity={0.9} shininess={70} />
          </mesh>
        ))}
      </group>

      {/* Large Heater Unit */}
      <group position={[ROOM_WIDTH / 2 - 2, -ROOM_HEIGHT / 2 + 0.7, 0]}>
        <mesh>
          <boxGeometry args={[2, 0.8, 2]} />
          <meshPhongMaterial color={heaterOn ? 0xff6b35 : 0x6a3a2a} emissive={heaterOn ? 0xff4422 : 0x3a1a0a} emissiveIntensity={heaterOn ? 1.4 : 0.3} shininess={80} />
        </mesh>
        {[-0.5, 0, 0.5].map((x) => (
          <mesh key={`heater-${x}`} position={[x, 0.5, 0]}>
            <boxGeometry args={[0.3, 0.7, 1.8]} />
            <meshPhongMaterial color={heaterOn ? 0xff8855 : 0x7a4a3a} emissive={heaterOn ? 0xff5533 : 0x4a2a1a} emissiveIntensity={0.95} shininess={60} />
          </mesh>
        ))}
      </group>

      {/* Ultra-high-density particle system - FIXED RENDERING */}
      {particles.map((particle, idx) => (
        <mesh
          key={idx}
          ref={(el) => {
            if (el) meshesRef.current[idx] = el
          }}
          position={[particle.position.x, particle.position.y, particle.position.z]}
        >
          <sphereGeometry args={[PARTICLE_RADIUS, 4, 4]} />
          <meshPhongMaterial
            color={particle.isHot ? 0xff4444 : 0x4a9eff}
            emissive={particle.isHot ? 0xff2222 : 0x2577ff}
            emissiveIntensity={0.75}
            shininess={80}
          />
        </mesh>
      ))}

      <OrbitControls enableZoom enablePan enableRotate autoRotate={false} minDistance={30} maxDistance={60} />
    </>
  )
}
