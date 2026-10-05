import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'

const NUM_PARTICLES = 400
const ROOM_WIDTH = 20
const ROOM_HEIGHT = 8
const ROOM_DEPTH = 8
const PARTICLE_RADIUS = 0.15

interface Particle3D {
  position: THREE.Vector3
  velocity: THREE.Vector3
  temperature: number
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
          {(!acOn && !heaterOn) ? '💤 Calm' : '🌪️ Circulating'}
        </p>
        <p style={{ margin: '8px 0', fontSize: '12px', color: '#aaa' }}>
          ❄️ AC: Cold air flows to Heater
        </p>
        <p style={{ margin: '8px 0', fontSize: '12px', color: '#aaa' }}>
          🔥 Heater: Hot air flows to AC
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
  const groupsRef = useRef<THREE.Group[]>([])
  const particlesRef = useRef<Particle3D[]>([])

  // Initialize high-density particles
  useEffect(() => {
    const particles: Particle3D[] = []
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * (ROOM_WIDTH * 0.9),
          (Math.random() - 0.5) * (ROOM_HEIGHT * 0.9),
          (Math.random() - 0.5) * (ROOM_DEPTH * 0.9)
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        temperature: 30 + Math.random() * 20,
      })
    }
    particlesRef.current = particles
  }, [])

  useFrame((_state, deltaTime) => {
    if (!isRunning) return

    const particles = particlesRef.current
    const convectionActive = acOn || heaterOn

    // AC: top-left ceiling
    const acPos = new THREE.Vector3(-ROOM_WIDTH / 2 + 2, ROOM_HEIGHT / 2 - 1, 0)
    const acRadius = 3

    // Heater: bottom-right floor
    const heaterPos = new THREE.Vector3(ROOM_WIDTH / 2 - 2, -ROOM_HEIGHT / 2 + 1, 0)
    const heaterRadius = 3.5

    const bounceDistance = {
      x: ROOM_WIDTH / 2 - PARTICLE_RADIUS,
      y: ROOM_HEIGHT / 2 - PARTICLE_RADIUS,
      z: ROOM_DEPTH / 2 - PARTICLE_RADIUS,
    }

    particles.forEach((particle, idx) => {
      if (!convectionActive) {
        particle.velocity.multiplyScalar(0.88)
        particle.velocity.x += (Math.random() - 0.5) * 0.06
        particle.velocity.y += (Math.random() - 0.5) * 0.06
        particle.velocity.z += (Math.random() - 0.5) * 0.06
      } else {
        // AC cooling: turn blue, push toward heater
        if (acOn) {
          const distToAC = particle.position.distanceTo(acPos)
          if (distToAC < acRadius) {
            particle.temperature = Math.max(10, particle.temperature - 0.6)
            // Push down and toward heater direction
            particle.velocity.y -= 0.8
            const toHeater = heaterPos.clone().sub(particle.position).normalize()
            particle.velocity.x += toHeater.x * 0.5
            particle.velocity.z += toHeater.z * 0.3
          }
        }

        // Heater heating: turn red, push toward AC
        if (heaterOn) {
          const distToHeater = particle.position.distanceTo(heaterPos)
          if (distToHeater < heaterRadius) {
            particle.temperature = Math.min(80, particle.temperature + 0.7)
            // Push up and toward AC direction
            particle.velocity.y += 0.9
            const toAC = acPos.clone().sub(particle.position).normalize()
            particle.velocity.x += toAC.x * 0.5
            particle.velocity.z += toAC.z * 0.3
          }
        }

        // Natural buoyancy
        const buoyancy = (particle.temperature - 35) / 50
        particle.velocity.y += buoyancy * 0.3

        // Brownian motion
        particle.velocity.x += (Math.random() - 0.5) * 0.15
        particle.velocity.y += (Math.random() - 0.5) * 0.1
        particle.velocity.z += (Math.random() - 0.5) * 0.15

        particle.velocity.multiplyScalar(0.92)
      }

      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime))

      // Particle-particle collision (high density repulsion)
      for (let j = idx + 1; j < particles.length; j++) {
        const other = particles[j]
        const dist = particle.position.distanceTo(other.position)
        const minDist = PARTICLE_RADIUS * 2 + 0.1
        if (dist < minDist && dist > 0.01) {
          const direction = other.position.clone().sub(particle.position).normalize()
          const pushForce = (minDist - dist) * 0.3
          particle.velocity.sub(direction.multiplyScalar(pushForce))
          other.velocity.add(direction.clone().multiplyScalar(pushForce))
        }
      }

      // Strict boundary collision
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

      // Update group
      if (groupsRef.current[idx]) {
        groupsRef.current[idx].position.copy(particle.position)
      }
    })
  })

  const getParticleColor = (temperature: number) => {
    if (temperature < 20) return 0x4a9eff
    if (temperature < 35) return 0x9966ff
    if (temperature < 50) return 0xffcc66
    return 0xff4444
  }

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[25, 10, 15]} intensity={1.2} color={0xffffff} />
      <pointLight position={[-20, -8, -12]} intensity={0.7} color={0xff8c42} />

      {/* Wide rectangular room */}
      <mesh>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshPhysicalMaterial transparent opacity={0.05} color={0xff8c42} metalness={0.1} roughness={0.8} />
      </mesh>

      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH)]} />
        <lineBasicMaterial attach="material" color={0xff8c42} linewidth={2} />
      </lineSegments>

      {/* Large AC Unit (Ceiling, Top-Left) */}
      <group position={[-ROOM_WIDTH / 2 + 2, ROOM_HEIGHT / 2 - 1, 0]}>
        <mesh>
          <boxGeometry args={[2.5, 1, 1.5]} />
          <meshPhongMaterial color={acOn ? 0x4a9eff : 0x2a4a6a} emissive={acOn ? 0x2577ff : 0x1a2a3a} emissiveIntensity={acOn ? 1.3 : 0.3} shininess={90} />
        </mesh>
        {/* AC Vents */}
        {[-0.6, 0, 0.6].map((x) => (
          <mesh key={`ac-${x}`} position={[x, 0, 0.85]}>
            <boxGeometry args={[0.4, 0.3, 0.3]} />
            <meshPhongMaterial color={acOn ? 0x6cc0ff : 0x3a4a6a} emissive={acOn ? 0x4a9eff : 0x2a3a4a} emissiveIntensity={0.9} shininess={70} />
          </mesh>
        ))}
      </group>

      {/* Large Heater Unit (Floor, Bottom-Right) */}
      <group position={[ROOM_WIDTH / 2 - 2, -ROOM_HEIGHT / 2 + 0.7, 0]}>
        <mesh>
          <boxGeometry args={[2, 0.8, 2]} />
          <meshPhongMaterial color={heaterOn ? 0xff6b35 : 0x6a3a2a} emissive={heaterOn ? 0xff4422 : 0x3a1a0a} emissiveIntensity={heaterOn ? 1.4 : 0.3} shininess={80} />
        </mesh>
        {/* Heater Grille */}
        {[-0.5, 0, 0.5].map((x) => (
          <mesh key={`heater-${x}`} position={[x, 0.5, 0]}>
            <boxGeometry args={[0.3, 0.7, 1.8]} />
            <meshPhongMaterial color={heaterOn ? 0xff8855 : 0x7a4a3a} emissive={heaterOn ? 0xff5533 : 0x4a2a1a} emissiveIntensity={0.95} shininess={60} />
          </mesh>
        ))}
      </group>

      {/* High-density particles */}
      {particlesRef.current.map((particle, idx) => (
        <group
          key={idx}
          ref={(el) => {
            if (el) groupsRef.current[idx] = el
          }}
          position={[particle.position.x, particle.position.y, particle.position.z]}
        >
          <mesh>
            <sphereGeometry args={[PARTICLE_RADIUS, 6, 6]} />
            <meshPhongMaterial
              color={getParticleColor(particle.temperature)}
              emissive={getParticleColor(particle.temperature)}
              emissiveIntensity={0.6}
              shininess={100}
            />
          </mesh>
        </group>
      ))}

      <OrbitControls enableZoom enablePan enableRotate autoRotate={false} minDistance={30} maxDistance={60} />
    </>
  )
}
