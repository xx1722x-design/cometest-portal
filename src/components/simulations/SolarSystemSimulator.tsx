import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface Planet {
  name: string
  size: number
  distance: number
  speed: number
  color: number
  info: string
  details: string[]
}

const PLANETS: Planet[] = [
  {
    name: 'Mercury',
    size: 0.38,
    distance: 8,
    speed: 4.15,
    color: 0x8c7853,
    info: 'Closest to the Sun',
    details: ['Smallest planet', 'Hot surface', 'No atmosphere', 'Fast orbit'],
  },
  {
    name: 'Venus',
    size: 0.95,
    distance: 12,
    speed: 1.62,
    color: 0xffc649,
    info: 'Hottest planet',
    details: ['Thick atmosphere', 'Dense clouds', 'Rotates backward', 'Brightest in sky'],
  },
  {
    name: 'Earth',
    size: 1.0,
    distance: 16,
    speed: 1.0,
    color: 0x4a90e2,
    info: 'Our home',
    details: ['Has life', 'One moon', 'Liquid water', 'Protective atmosphere'],
  },
  {
    name: 'Mars',
    size: 0.53,
    distance: 20,
    speed: 0.53,
    color: 0xe27b58,
    info: 'The Red Planet',
    details: ['Iron oxide soil', 'Thin atmosphere', 'Two small moons', 'Largest volcano'],
  },
  {
    name: 'Jupiter',
    size: 11.2,
    distance: 28,
    speed: 0.1,
    color: 0xdaa84f,
    info: 'Largest planet',
    details: ['Gas giant', 'Great Red Spot', 'Strong magnetic field', '79 moons'],
  },
  {
    name: 'Saturn',
    size: 9.45,
    distance: 36,
    speed: 0.04,
    color: 0xf4d9a8,
    info: 'The ringed planet',
    details: ['Spectacular rings', 'Lowest density', 'Tilted rings', '82 moons'],
  },
  {
    name: 'Uranus',
    size: 4.01,
    distance: 44,
    speed: 0.01,
    color: 0x4fd6e8,
    info: 'Ice giant',
    details: ['Extreme tilt', 'Faint rings', 'Icy atmosphere', 'Rotates on side'],
  },
  {
    name: 'Neptune',
    size: 3.88,
    distance: 52,
    speed: 0.005,
    color: 0x4166f5,
    info: 'Windiest planet',
    details: ['Deepest blue', 'Supersonic winds', 'Faint rings', 'Coldest planet'],
  },
]

export function SolarSystemSimulator() {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [isZoomedIn, setIsZoomedIn] = useState(false)

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#000' }}>
      <Canvas camera={{ position: [0, 60, 0], fov: 50 }}>
        <SolarSystemContent selectedPlanet={selectedPlanet} isZoomedIn={isZoomedIn} setIsZoomedIn={setIsZoomedIn} setSelectedPlanet={setSelectedPlanet} />
      </Canvas>

      {/* Planet Info Card */}
      {selectedPlanet && isZoomedIn && (
        <div
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            border: `2px solid ${`#${selectedPlanet.color.toString(16).padStart(6, '0')}`}`,
            borderRadius: '12px',
            padding: '20px',
            width: '280px',
            color: '#fff',
            fontFamily: 'Arial, sans-serif',
            zIndex: 100,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '24px' }}>{selectedPlanet.name}</h2>
            <button
              onClick={() => {
                setSelectedPlanet(null)
                setIsZoomedIn(false)
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '28px',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ×
            </button>
          </div>

          <p style={{ margin: '10px 0', fontSize: '14px', color: '#aaa' }}>{selectedPlanet.info}</p>

          <div style={{ marginTop: '15px' }}>
            <h4 style={{ margin: '10px 0 8px 0', fontSize: '12px', textTransform: 'uppercase', color: '#888' }}>
              Facts
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
              {selectedPlanet.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => {
              setSelectedPlanet(null)
              setIsZoomedIn(false)
            }}
            style={{
              width: '100%',
              marginTop: '15px',
              padding: '8px',
              backgroundColor: `#${selectedPlanet.color.toString(16).padStart(6, '0')}33`,
              border: `1px solid #${selectedPlanet.color.toString(16).padStart(6, '0')}`,
              color: '#fff',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            Back to Solar System
          </button>
        </div>
      )}

      {/* Info at macro view */}
      {!isZoomedIn && (
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', color: '#fff', textAlign: 'center', fontFamily: 'Arial', fontSize: '14px' }}>
          <p style={{ margin: 0 }}>Click on a planet to zoom in and learn more</p>
        </div>
      )}
    </div>
  )
}

function SolarSystemContent({
  selectedPlanet,
  isZoomedIn,
  setIsZoomedIn,
  setSelectedPlanet,
}: {
  selectedPlanet: Planet | null
  isZoomedIn: boolean
  setIsZoomedIn: (val: boolean) => void
  setSelectedPlanet: (planet: Planet | null) => void
}) {
  const { camera } = useThree()
  const sunRef = useRef<THREE.Mesh>(null)
  const planetsRef = useRef<{ [key: string]: THREE.Group }>({})
  const timeRef = useRef(0)

  useFrame((_state, deltaTime) => {
    timeRef.current += deltaTime

    // Animate planets
    PLANETS.forEach((planet) => {
      if (planetsRef.current[planet.name]) {
        const angle = (timeRef.current * planet.speed) % (Math.PI * 2)
        const x = Math.cos(angle) * planet.distance
        const z = Math.sin(angle) * planet.distance
        planetsRef.current[planet.name].position.set(x, 0, z)
      }
    })

    // Animate sun rotation
    if (sunRef.current) {
      sunRef.current.rotation.y += deltaTime * 0.5
    }

    // Smooth camera zoom
    if (selectedPlanet && isZoomedIn && planetsRef.current[selectedPlanet.name]) {
      const planetPos = planetsRef.current[selectedPlanet.name].position
      const targetCameraPos = new THREE.Vector3(
        planetPos.x + selectedPlanet.size * 6,
        selectedPlanet.size * 4,
        planetPos.z + selectedPlanet.size * 6
      )
      camera.position.lerp(targetCameraPos, 0.05)
      camera.lookAt(planetPos.x, 0, planetPos.z)
    } else if (!isZoomedIn) {
      const targetPos = new THREE.Vector3(0, 60, 0)
      camera.position.lerp(targetPos, 0.03)
      camera.lookAt(0, 0, 0)
    }
  })

  return (
    <>
      {/* Stars background */}
      <StarField />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 20, 0]} intensity={2} color={0xfdb813} distance={200} />

      {/* Sun */}
      <mesh ref={sunRef} position={[0, 0, 0]} onClick={() => null}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color={0xfdb813} metalness={0.3} roughness={0.4} emissive={0xfdb813} emissiveIntensity={0.8} />
        <pointLight position={[0, 0, 0]} intensity={3} color={0xfdb813} distance={300} />
      </mesh>

      {/* Orbit lines */}
      {PLANETS.map((planet) => (
        <mesh key={`orbit-${planet.name}`} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={64}
              array={new Float32Array(
                Array.from({ length: 64 }).flatMap((_, i) => [
                  Math.cos((i / 64) * Math.PI * 2) * planet.distance,
                  0,
                  Math.sin((i / 64) * Math.PI * 2) * planet.distance,
                ])
              )}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={0x444444} linewidth={1} />
        </mesh>
      ))}

      {/* Planets */}
      {PLANETS.map((planet) => (
        <group key={planet.name} ref={(ref) => {
          if (ref) planetsRef.current[planet.name] = ref
        }}>
          <mesh
            onClick={() => {
              setSelectedPlanet(planet)
              setIsZoomedIn(true)
            }}
          >
            <sphereGeometry args={[Math.max(planet.size, 0.5), 32, 32]} />
            <meshStandardMaterial
              color={planet.color}
              metalness={0.7}
              roughness={0.2}
              emissive={planet.color}
              emissiveIntensity={0.3}
            />
            <pointLight position={[0, 0, 0]} intensity={0.5} color={planet.color} distance={10} />
          </mesh>

          {/* Saturn rings */}
          {planet.name === 'Saturn' && (
            <mesh rotation={[Math.PI / 6, 0, 0]}>
              <torusGeometry args={[planet.size * 1.5, planet.size * 0.4, 16, 64]} />
              <meshStandardMaterial color={0xf4d9a8} metalness={0.5} roughness={0.3} transparent opacity={0.7} />
            </mesh>
          )}
        </group>
      ))}
    </>
  )
}

function StarField() {
  const ref = useRef<THREE.Points>(null)

  useEffect(() => {
    if (!ref.current) return

    const starsGeometry = ref.current.geometry as THREE.BufferGeometry
    const count = starsGeometry.attributes.position.count

    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      colors[i] = Math.random() * 0.5 + 0.5 // R
      colors[i + 1] = Math.random() * 0.5 + 0.5 // G
      colors[i + 2] = Math.random() // B
    }

    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  }, [])

  const positions = new Float32Array(1000 * 3)
  for (let i = 0; i < 1000 * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 400
    positions[i + 1] = (Math.random() - 0.5) * 400
    positions[i + 2] = (Math.random() - 0.5) * 400
  }

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={1000} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.5} sizeAttenuation vertexColors />
    </points>
  )
}
