import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { OrbitControls, Preload } from '@react-three/drei'
import * as THREE from 'three'

interface PlanetData {
  name: string
  displaySize: number
  distance: number
  speed: number
  textureUrl: string
  rotationSpeed: number
  info: string
  details: string[]
  initialAngle: number
}

const PLANETS: PlanetData[] = [
  {
    name: 'Mercury',
    displaySize: 1.2,
    distance: 15,
    speed: 4.15,
    textureUrl: '/2k_mercury.jpg',
    rotationSpeed: 0.04,
    info: 'Closest to the Sun',
    details: ['Smallest planet', 'Hot surface', 'No atmosphere', 'Fast orbit'],
    initialAngle: Math.random() * Math.PI * 2,
  },
  {
    name: 'Venus',
    displaySize: 1.8,
    distance: 24,
    speed: 1.62,
    textureUrl: '/2k_venus_surface.jpg',
    rotationSpeed: 0.002,
    info: 'Hottest planet',
    details: ['Thick atmosphere', 'Dense clouds', 'Rotates backward', 'Brightest in sky'],
    initialAngle: Math.random() * Math.PI * 2,
  },
  {
    name: 'Earth',
    displaySize: 2.0,
    distance: 33,
    speed: 1.0,
    textureUrl: '/2k_earth_daymap.jpg',
    rotationSpeed: 0.02,
    info: 'Our home',
    details: ['Has life', 'One moon', 'Liquid water', 'Protective atmosphere'],
    initialAngle: Math.random() * Math.PI * 2,
  },
  {
    name: 'Mars',
    displaySize: 1.4,
    distance: 43,
    speed: 0.53,
    textureUrl: '/2k_mars.jpg',
    rotationSpeed: 0.018,
    info: 'The Red Planet',
    details: ['Iron oxide soil', 'Thin atmosphere', 'Two small moons', 'Largest volcano'],
    initialAngle: Math.random() * Math.PI * 2,
  },
  {
    name: 'Jupiter',
    displaySize: 6.0,
    distance: 65,
    speed: 0.1,
    textureUrl: '/2k_jupiter.jpg',
    rotationSpeed: 0.03,
    info: 'Largest planet',
    details: ['Gas giant', 'Great Red Spot', 'Strong magnetic field', '79 moons'],
    initialAngle: Math.random() * Math.PI * 2,
  },
  {
    name: 'Saturn',
    displaySize: 5.5,
    distance: 85,
    speed: 0.04,
    textureUrl: '/2k_saturn.jpg',
    rotationSpeed: 0.025,
    info: 'The ringed planet',
    details: ['Spectacular rings', 'Lowest density', 'Tilted rings', '82 moons'],
    initialAngle: Math.random() * Math.PI * 2,
  },
  {
    name: 'Uranus',
    displaySize: 4.0,
    distance: 105,
    speed: 0.01,
    textureUrl: '/2k_uranus.jpg',
    rotationSpeed: 0.015,
    info: 'Ice giant',
    details: ['Extreme tilt', 'Faint rings', 'Icy atmosphere', 'Rotates on side'],
    initialAngle: Math.random() * Math.PI * 2,
  },
  {
    name: 'Neptune',
    displaySize: 3.8,
    distance: 125,
    speed: 0.005,
    textureUrl: '/2k_neptune.jpg',
    rotationSpeed: 0.016,
    info: 'Windiest planet',
    details: ['Deepest blue', 'Supersonic winds', 'Faint rings', 'Coldest planet'],
    initialAngle: Math.random() * Math.PI * 2,
  },
]

export function SolarSystemSimulator() {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null)
  const [isZoomedIn, setIsZoomedIn] = useState(false)

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#000' }}>
      <Canvas camera={{ position: [0, 60, 160], fov: 50 }} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <SolarSystemContent setSelectedPlanet={setSelectedPlanet} setIsZoomedIn={setIsZoomedIn} isZoomedIn={isZoomedIn} selectedPlanet={selectedPlanet} />
          <Preload all />
        </Suspense>
      </Canvas>

      {selectedPlanet && isZoomedIn && (
        <div
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '2px solid #64B5F6',
            borderRadius: '12px',
            padding: '20px',
            width: '300px',
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
            <h4 style={{ margin: '10px 0 8px 0', fontSize: '12px', textTransform: 'uppercase', color: '#888' }}>Facts</h4>
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
              backgroundColor: '#64B5F633',
              border: '1px solid #64B5F6',
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

      {!isZoomedIn && (
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', color: '#fff', textAlign: 'center', fontFamily: 'Arial', fontSize: '14px' }}>
          <p style={{ margin: 0 }}>🖱️ Drag to rotate • Scroll to zoom • Click a planet to learn more</p>
        </div>
      )}
    </div>
  )
}

function SolarSystemContent({
  setSelectedPlanet,
  setIsZoomedIn,
  isZoomedIn,
  selectedPlanet,
}: {
  setSelectedPlanet: (planet: PlanetData | null) => void
  setIsZoomedIn: (val: boolean) => void
  isZoomedIn: boolean
  selectedPlanet: PlanetData | null
}) {
  const timeRef = useRef(0)
  const planetsRef = useRef<{ [key: string]: THREE.Group }>({})
  const { camera } = useThree()

  // Load all textures at once
  const textureUrls = [
    '/2k_sun.jpg',
    ...PLANETS.map(p => p.textureUrl),
    '/2k_saturn_ring_alpha.png',
    '/2k_moon.jpg',
  ]

  const textures = useLoader(THREE.TextureLoader, textureUrls)
  const [sunTexture, ...planetTextures] = textures
  const saturnRingTexture = textures[textures.length - 2]
  const moonTexture = textures[textures.length - 1]

  useFrame((_state, deltaTime) => {
    timeRef.current += deltaTime

    PLANETS.forEach((planet, idx) => {
      const group = planetsRef.current[planet.name]
      if (group) {
        const angle = ((timeRef.current * planet.speed + planet.initialAngle) % (Math.PI * 2))
        group.position.x = Math.cos(angle) * planet.distance
        group.position.z = Math.sin(angle) * planet.distance

        const mesh = group.children.find((child) => child instanceof THREE.Mesh) as THREE.Mesh
        if (mesh) {
          mesh.rotation.y += deltaTime * planet.rotationSpeed
        }
      }
    })

    const sunGroup = planetsRef.current['Sun']
    if (sunGroup) {
      const sunMesh = sunGroup.children.find((child) => child instanceof THREE.Mesh) as THREE.Mesh
      if (sunMesh) {
        sunMesh.rotation.y += deltaTime * 0.3
      }
    }

    if (selectedPlanet && isZoomedIn && planetsRef.current[selectedPlanet.name]) {
      const planetPos = planetsRef.current[selectedPlanet.name].position
      const targetPos = new THREE.Vector3(
        planetPos.x + selectedPlanet.displaySize * 8,
        selectedPlanet.displaySize * 5,
        planetPos.z + selectedPlanet.displaySize * 8
      )
      camera.position.lerp(targetPos, 0.05)
      camera.lookAt(planetPos)
    }
  })

  return (
    <>
      <StarField />

      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={2.5} color={0xfdb813} distance={600} />

      <group ref={(ref) => {
        if (ref) planetsRef.current['Sun'] = ref
      }} position={[0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[6, 64, 64]} />
          <meshStandardMaterial map={sunTexture} emissive={0xfdb813} emissiveIntensity={0.8} metalness={0} roughness={0.8} />
        </mesh>
        <pointLight intensity={2} color={0xfdb813} distance={600} />
      </group>

      {PLANETS.map((planet, idx) => (
        <group
          key={planet.name}
          ref={(ref) => {
            if (ref) planetsRef.current[planet.name] = ref
          }}
        >
          <mesh
            onClick={() => {
              setSelectedPlanet(planet)
              setIsZoomedIn(true)
            }}
          >
            <sphereGeometry args={[planet.displaySize, 64, 64]} />
            <meshStandardMaterial map={planetTextures[idx]} metalness={0.2} roughness={0.8} />
          </mesh>

          {planet.name === 'Earth' && (
            <group position={[0, 0, 0]}>
              <group>
                <group position={[2.5, 0, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.25, 32, 32]} />
                    <meshStandardMaterial map={moonTexture} metalness={0.1} roughness={0.9} />
                  </mesh>
                </group>
              </group>
            </group>
          )}

          {planet.name === 'Saturn' && (
            <mesh rotation={[Math.PI / 2.5, 0.2, 0]}>
              <ringGeometry args={[planet.displaySize * 1.5, planet.displaySize * 2.2, 64, 32]} />
              <meshStandardMaterial map={saturnRingTexture} side={THREE.DoubleSide} transparent opacity={0.8} metalness={0.3} roughness={0.6} />
            </mesh>
          )}
        </group>
      ))}

      <OrbitControls makeDefault minDistance={50} maxDistance={600} enablePan={true} enableZoom={true} enableRotate={true} />
    </>
  )
}

function StarField() {
  const ref = useRef<THREE.Points>(null)

  useEffect(() => {
    if (!ref.current) return

    const geometry = ref.current.geometry as THREE.BufferGeometry
    const count = geometry.attributes.position.count

    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      colors[i] = Math.random() * 0.7 + 0.3
      colors[i + 1] = Math.random() * 0.7 + 0.3
      colors[i + 2] = Math.random() * 0.7 + 0.3
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  }, [])

  const positions = new Float32Array(2000 * 3)
  for (let i = 0; i < 2000 * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 1000
    positions[i + 1] = (Math.random() - 0.5) * 1000
    positions[i + 2] = (Math.random() - 0.5) * 1000
  }

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={2000} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.8} sizeAttenuation vertexColors />
    </points>
  )
}
