import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'

const NUM_PARTICLES = 180
const ROOM_WIDTH = 16
const ROOM_HEIGHT = 12
const ROOM_DEPTH = 10
const PARTICLE_RADIUS = 0.25

export function RoomConvectionSimulator() {
  const { t } = useTranslation()
  const [isRunning, setIsRunning] = useState(true)
  const [acOn, setAcOn] = useState(false)
  const [heaterOn, setHeaterOn] = useState(false)

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#0a0a1a' }}>
      <Canvas camera={{ position: [20, 12, 20], fov: 50 }} style={{ width: '100%', height: '100%' }}>
        <RoomConvectionContent isRunning={isRunning} acOn={acOn} heaterOn={heaterOn} />
      </Canvas>

      {/* Top-Left Info Panel */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #ff8c42',
          borderRadius: '12px',
          padding: '20px',
          color: '#fff',
          fontFamily: "'Segoe UI', sans-serif",
          maxWidth: '380px',
          fontSize: '13px',
          lineHeight: '1.6',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)',
          zIndex: 100,
        }}
      >
        <h2 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#ff8c42', fontWeight: '700' }}>
          🌬️ Room Convection
        </h2>
        <p style={{ margin: '8px 0', fontSize: '12px', color: '#aaa' }}>
          ❄️ Blue particles (cold) sink downward
        </p>
        <p style={{ margin: '8px 0', fontSize: '12px', color: '#aaa' }}>
          🔴 Red particles (hot) rise upward
        </p>
        <p style={{ margin: '0', fontSize: '12px', color: '#888', lineHeight: '1.6' }}>
          Watch how air circulates in the room when the AC and Heater are turned on!
        </p>
      </div>

      {/* Bottom Control Panel */}
      <div
        style={{
          position: 'absolute',
          left: '20px',
          bottom: '30px',
          width: '360px',
          backgroundColor: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #ff8c42',
          borderRadius: '12px',
          padding: '20px',
          fontFamily: "'Segoe UI', sans-serif",
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Run Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label
              style={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <input
                type="checkbox"
                checked={isRunning}
                onChange={(e) => setIsRunning(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  accentColor: '#4a9eff',
                }}
              />
              ⏵ Run Simulation
            </label>
          </div>

          {/* AC Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label
              style={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <input
                type="checkbox"
                checked={acOn}
                onChange={(e) => setAcOn(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  accentColor: '#4a9eff',
                }}
              />
              ❄️ 에어컨 (AC)
            </label>
            <span style={{ fontSize: '12px', color: acOn ? '#4a9eff' : '#888' }}>
              {acOn ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* Heater Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label
              style={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <input
                type="checkbox"
                checked={heaterOn}
                onChange={(e) => setHeaterOn(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  accentColor: '#ff6b35',
                }}
              />
              🔥 난로 (Heater)
            </label>
            <span style={{ fontSize: '12px', color: heaterOn ? '#ff6b35' : '#888' }}>
              {heaterOn ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => (window.location.href = '/chemistry')}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 100,
          padding: '0.75rem 1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
        }}
      >
        ← Back
      </button>
    </div>
  )
}

function RoomConvectionContent({
  isRunning,
  acOn,
  heaterOn,
}: {
  isRunning: boolean
  acOn: boolean
  heaterOn: boolean
}) {
  const particlesRef = useRef<any[]>([])
  const groupsRef = useRef<THREE.Group[]>([])
  const timeRef = useRef(0)

  // Initialize particles
  useEffect(() => {
    const particles: any[] = []
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * ROOM_WIDTH,
          (Math.random() - 0.5) * ROOM_HEIGHT,
          (Math.random() - 0.5) * ROOM_DEPTH
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ),
        temperature: 20 + Math.random() * 20,
        isAffectedByAC: false,
        isAffectedByHeater: false,
      })
    }
    particlesRef.current = particles
  }, [])

  useFrame((_state, deltaTime) => {
    if (!isRunning) return

    const particles = particlesRef.current
    const acPos = new THREE.Vector3(-ROOM_WIDTH / 2 + 0.5, ROOM_HEIGHT / 2 - 0.5, 0)
    const heaterPos = new THREE.Vector3(ROOM_WIDTH / 2 - 1, -ROOM_HEIGHT / 2 + 0.5, 0)
    const acRadius = 2
    const heaterRadius = 2.5

    timeRef.current += deltaTime

    particles.forEach((particle) => {
      // AC cooling effect
      if (acOn) {
        const distToAC = particle.position.distanceTo(acPos)
        if (distToAC < acRadius) {
          particle.temperature = Math.max(10, particle.temperature - deltaTime * 15)
          particle.isAffectedByAC = true
          // Push particles downward
          particle.velocity.y -= deltaTime * 0.8
        } else {
          particle.isAffectedByAC = false
        }
      }

      // Heater heating effect
      if (heaterOn) {
        const distToHeater = particle.position.distanceTo(heaterPos)
        if (distToHeater < heaterRadius) {
          particle.temperature = Math.min(80, particle.temperature + deltaTime * 20)
          particle.isAffectedByHeater = true
          // Push particles upward
          particle.velocity.y += deltaTime * 1.0
        } else {
          particle.isAffectedByHeater = false
        }
      }

      // Convection: hot particles rise, cold particles sink
      const tempInfluence = (particle.temperature - 30) / 50
      particle.velocity.y += tempInfluence * deltaTime * 0.3

      // Random motion (Brownian motion)
      particle.velocity.x += (Math.random() - 0.5) * deltaTime * 0.2
      particle.velocity.y += (Math.random() - 0.5) * deltaTime * 0.1
      particle.velocity.z += (Math.random() - 0.5) * deltaTime * 0.2

      // Damping
      particle.velocity.x *= 0.99
      particle.velocity.y *= 0.99
      particle.velocity.z *= 0.99

      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime))

      // Boundary checks with bounce
      const bounceDistance = {
        x: ROOM_WIDTH / 2 - PARTICLE_RADIUS,
        y: ROOM_HEIGHT / 2 - PARTICLE_RADIUS,
        z: ROOM_DEPTH / 2 - PARTICLE_RADIUS,
      }

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

      // Update group position
      const groupIdx = particlesRef.current.indexOf(particle)
      if (groupsRef.current[groupIdx]) {
        groupsRef.current[groupIdx].position.copy(particle.position)
      }
    })
  })

  const getParticleColor = (temperature: number) => {
    if (temperature < 15) return 0x4a9eff // Blue (cold)
    if (temperature > 50) return 0xff4444 // Red (hot)
    return 0x9966ff // Purple (room temp)
  }

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <pointLight position={[15, 15, 15]} intensity={1.2} color={0xffffff} />
      <pointLight position={[-12, -10, -8]} intensity={0.8} color={0x4a9eff} />

      {/* Orthographic Camera for 2.9D isometric view */}
      <OrthographicCamera makeDefault position={[20, 12, 20]} zoom={3} near={0.1} far={1000} />

      {/* Room Container (wireframe box) */}
      <mesh>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshPhysicalMaterial transparent opacity={0.06} color={0xff8c42} metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Room edges */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH)]} />
        <lineBasicMaterial attach="material" color={0xff8c42} linewidth={1.5} />
      </lineSegments>

      {/* Back Wall (warm peach/cream) */}
      <mesh position={[0, 0, -ROOM_DEPTH / 2]} scale={[ROOM_WIDTH, ROOM_HEIGHT, 0.1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhongMaterial color={0xffdb99} emissive={0xffcc77} emissiveIntensity={0.2} />
      </mesh>

      {/* Floor (darker tone) */}
      <mesh position={[0, -ROOM_HEIGHT / 2, 0]} scale={[ROOM_WIDTH, 0.1, ROOM_DEPTH]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhongMaterial color={0xdd9966} emissive={0xcc8855} emissiveIntensity={0.15} />
      </mesh>

      {/* Air Conditioner (top-left wall) */}
      {acOn && (
        <mesh position={[-ROOM_WIDTH / 2 + 0.3, ROOM_HEIGHT / 2 - 1, 0]}>
          <boxGeometry args={[1.2, 0.6, 0.3]} />
          <meshPhongMaterial color={0x4a9eff} emissive={0x2577ff} emissiveIntensity={1} />
        </mesh>
      )}
      {!acOn && (
        <mesh position={[-ROOM_WIDTH / 2 + 0.3, ROOM_HEIGHT / 2 - 1, 0]}>
          <boxGeometry args={[1.2, 0.6, 0.3]} />
          <meshPhongMaterial color={0x3a4a5a} />
        </mesh>
      )}

      {/* Heater (bottom-right floor) */}
      {heaterOn && (
        <mesh position={[ROOM_WIDTH / 2 - 1, -ROOM_HEIGHT / 2 + 0.5, 0]}>
          <boxGeometry args={[1, 0.8, 1]} />
          <meshPhongMaterial color={0xff6b35} emissive={0xff4422} emissiveIntensity={1.2} />
        </mesh>
      )}
      {!heaterOn && (
        <mesh position={[ROOM_WIDTH / 2 - 1, -ROOM_HEIGHT / 2 + 0.5, 0]}>
          <boxGeometry args={[1, 0.8, 1]} />
          <meshPhongMaterial color={0x6a3a2a} />
        </mesh>
      )}

      {/* Particles */}
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
              emissiveIntensity={0.4}
              shininess={100}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}
