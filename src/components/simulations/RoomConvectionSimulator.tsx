import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'

const NUM_PARTICLES = 250
const CONTAINER_SIZE = 20
const PARTICLE_RADIUS = 0.25

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
      <Canvas camera={{ position: [32, 26, 32], fov: 40 }}>
        <RoomConvectionContent isRunning={isRunning} acOn={acOn} heaterOn={heaterOn} />
      </Canvas>

      {/* Top-Left Info Panel */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(10, 10, 26, 0.95)', border: '2px solid #ff8c42', borderRadius: '12px', padding: '20px', color: '#fff', fontFamily: "'Segoe UI', sans-serif", maxWidth: '320px', fontSize: '13px', lineHeight: '1.6', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)', zIndex: 100 }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#ff8c42', fontWeight: '700' }}>🌬️ Room Convection</h2>
        <p style={{ margin: '8px 0 12px 0', fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>
          {(!acOn && !heaterOn) ? '💤 Calm (Both OFF)' : '🌪️ Circulating'}
        </p>
        <p style={{ margin: '8px 0', fontSize: '12px', color: '#aaa' }}>
          ❄️ AC ON: Cold air sinks
        </p>
        <p style={{ margin: '8px 0', fontSize: '12px', color: '#aaa' }}>
          🔥 Heater ON: Hot air rises
        </p>
        <p style={{ margin: '0', fontSize: '12px', color: '#888', lineHeight: '1.6' }}>
          Full 3D convection inside the wireframe cube
        </p>
      </div>

      {/* Bottom-Left Control Panel */}
      <div style={{ position: 'absolute', left: '20px', bottom: '30px', width: '320px', backgroundColor: 'rgba(10, 10, 26, 0.95)', border: '2px solid #ff8c42', borderRadius: '12px', padding: '20px', fontFamily: "'Segoe UI', sans-serif", zIndex: 100, backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)' }}>
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
  const timeRef = useRef(0)

  // Initialize 3D particles
  useEffect(() => {
    const particles: Particle3D[] = []
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * CONTAINER_SIZE * 0.9,
          (Math.random() - 0.5) * CONTAINER_SIZE * 0.9,
          (Math.random() - 0.5) * CONTAINER_SIZE * 0.9
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

    // AC position: top-left (negative x, positive y)
    const acPos = new THREE.Vector3(-CONTAINER_SIZE / 2 + 2, CONTAINER_SIZE / 2 - 2, 0)
    const acRadius = 3.5

    // Heater position: bottom-right (positive x, negative y)
    const heaterPos = new THREE.Vector3(CONTAINER_SIZE / 2 - 2, -CONTAINER_SIZE / 2 + 2, 0)
    const heaterRadius = 4

    const centerPos = new THREE.Vector3(0, 0, 0)
    const bounceDistance = CONTAINER_SIZE / 2 - PARTICLE_RADIUS

    particles.forEach((particle) => {
      if (!convectionActive) {
        // No convection: just damping and minimal thermal motion
        particle.velocity.multiplyScalar(0.90)
        particle.velocity.x += (Math.random() - 0.5) * 0.05
        particle.velocity.y += (Math.random() - 0.5) * 0.05
        particle.velocity.z += (Math.random() - 0.5) * 0.05
      } else {
        // AC cooling and downward push
        if (acOn) {
          const distToAC = particle.position.distanceTo(acPos)
          if (distToAC < acRadius) {
            particle.temperature = Math.max(15, particle.temperature - 0.4)
            const forceStrength = (1 - distToAC / acRadius) * 1.5
            particle.velocity.y -= forceStrength * 0.6 // Downward
          }
        }

        // Heater heating and upward push
        if (heaterOn) {
          const distToHeater = particle.position.distanceTo(heaterPos)
          if (distToHeater < heaterRadius) {
            particle.temperature = Math.min(75, particle.temperature + 0.5)
            const forceStrength = (1 - distToHeater / heaterRadius) * 1.8
            particle.velocity.y += forceStrength * 0.8 // Upward
          }
        }

        // Natural buoyancy
        const buoyancy = (particle.temperature - 35) / 40
        particle.velocity.y -= buoyancy * 0.4

        // Gentle 3D circulation loop
        const toCenter = centerPos.clone().sub(particle.position)
        const perpX = -toCenter.z
        const perpZ = toCenter.x
        const perpLen = Math.hypot(perpX, perpZ)
        if (perpLen > 0.1) {
          const circulationStrength = 0.15
          particle.velocity.x += (perpX / perpLen) * circulationStrength
          particle.velocity.z += (perpZ / perpLen) * circulationStrength
        }

        // Brownian motion
        particle.velocity.x += (Math.random() - 0.5) * 0.2
        particle.velocity.y += (Math.random() - 0.5) * 0.15
        particle.velocity.z += (Math.random() - 0.5) * 0.2

        // Damping
        particle.velocity.multiplyScalar(0.96)
      }

      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime))

      // STRICT 3D boundary clamping
      if (Math.abs(particle.position.x) > bounceDistance) {
        particle.position.x = Math.sign(particle.position.x) * bounceDistance
        particle.velocity.x *= -0.75
      }
      if (Math.abs(particle.position.y) > bounceDistance) {
        particle.position.y = Math.sign(particle.position.y) * bounceDistance
        particle.velocity.y *= -0.75
      }
      if (Math.abs(particle.position.z) > bounceDistance) {
        particle.position.z = Math.sign(particle.position.z) * bounceDistance
        particle.velocity.z *= -0.75
      }

      // Update group position
      const groupIdx = particlesRef.current.indexOf(particle)
      if (groupsRef.current[groupIdx]) {
        groupsRef.current[groupIdx].position.copy(particle.position)
      }
    })
  })

  const getParticleColor = (temperature: number) => {
    if (temperature < 20) return 0x4a9eff // Blue
    if (temperature < 35) return 0x9966ff // Purple
    if (temperature < 50) return 0xffcc66 // Yellow
    return 0xff4444 // Red
  }

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[20, 20, 20]} intensity={1.2} color={0xffffff} />
      <pointLight position={[-15, -15, -15]} intensity={0.6} color={0xff8c42} />

      {/* 3D Wireframe Box */}
      <mesh>
        <boxGeometry args={[CONTAINER_SIZE, CONTAINER_SIZE, CONTAINER_SIZE]} />
        <meshPhysicalMaterial transparent opacity={0.06} color={0xff8c42} metalness={0.2} roughness={0.6} />
      </mesh>

      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(CONTAINER_SIZE, CONTAINER_SIZE, CONTAINER_SIZE)]} />
        <lineBasicMaterial attach="material" color={0xff8c42} linewidth={2} />
      </lineSegments>

      {/* AC Indicator */}
      {acOn && (
        <mesh position={[-CONTAINER_SIZE / 2 + 1, CONTAINER_SIZE / 2 - 1, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshPhongMaterial color={0x4a9eff} emissive={0x2577ff} emissiveIntensity={1.5} shininess={100} />
        </mesh>
      )}

      {/* Heater Indicator */}
      {heaterOn && (
        <mesh position={[CONTAINER_SIZE / 2 - 1, -CONTAINER_SIZE / 2 + 1, 0]}>
          <sphereGeometry args={[0.9, 16, 16]} />
          <meshPhongMaterial color={0xff6b35} emissive={0xff4422} emissiveIntensity={1.5} shininess={100} />
        </mesh>
      )}

      {/* 3D Particles */}
      {particlesRef.current.map((particle, idx) => (
        <group
          key={idx}
          ref={(el) => {
            if (el) groupsRef.current[idx] = el
          }}
          position={[particle.position.x, particle.position.y, particle.position.z]}
        >
          <mesh>
            <sphereGeometry args={[PARTICLE_RADIUS, 8, 8]} />
            <meshPhongMaterial
              color={getParticleColor(particle.temperature)}
              emissive={getParticleColor(particle.temperature)}
              emissiveIntensity={0.5}
              shininess={100}
            />
          </mesh>
        </group>
      ))}

      <OrbitControls enableZoom enablePan enableRotate autoRotate autoRotateSpeed={1} minDistance={25} maxDistance={50} />
    </>
  )
}
