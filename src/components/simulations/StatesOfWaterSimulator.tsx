import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

interface H2OMolecule {
  id: number
  position: THREE.Vector3
  velocity: THREE.Vector3
  targetPosition: THREE.Vector3
  rotation: THREE.Euler
  state: 'solid' | 'liquid' | 'gas'
  baseX: number
  baseZ: number
  vibrationPhase: number
}

const NUM_MOLECULES = 180
const CONTAINER_SIZE = 16
const MOLECULE_RADIUS = 0.4

export function StatesOfWaterSimulator() {
  const [temperature, setTemperature] = useState(20)

  const getState = (temp: number): 'solid' | 'liquid' | 'gas' => {
    if (temp < 0) return 'solid'
    if (temp > 100) return 'gas'
    return 'liquid'
  }

  const getStateLabel = (temp: number): string => {
    const state = getState(temp)
    if (state === 'solid') return '❄️ ICE (Solid)'
    if (state === 'gas') return '☁️ STEAM (Gas)'
    return '💧 WATER (Liquid)'
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#0a0a1a' }}>
      <Canvas camera={{ position: [22, 18, 22], fov: 45 }}>
        <StatesOfWaterContent temperature={temperature} />
      </Canvas>

      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #4a9eff',
          borderRadius: '12px',
          padding: '20px',
          color: '#fff',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          maxWidth: '380px',
          fontSize: '13px',
          lineHeight: '1.6',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(74, 158, 255, 0.2)',
          zIndex: 100,
        }}
      >
        <h2 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#66ccff', fontWeight: '700' }}>States of Water</h2>
        <p style={{ margin: '8px 0 12px 0', fontSize: '18px', color: '#4a9eff', fontWeight: 'bold' }}>
          {getStateLabel(temperature)}
        </p>
        <p style={{ margin: '8px 0', fontSize: '14px', color: '#aaa' }}>Temperature: {temperature}°C</p>
        <p style={{ margin: '0', fontSize: '12px', color: '#888', lineHeight: '1.6' }}>
          Watch H₂O molecules change behavior with temperature. Below 0°C: rigid ice lattice. 0-100°C: flowing liquid. Above 100°C: rapidly bouncing steam.
        </p>
      </div>

      <div
        style={{
          position: 'absolute',
          left: '20px',
          bottom: '30px',
          width: '300px',
          backgroundColor: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #4a9eff',
          borderRadius: '12px',
          padding: '20px',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(74, 158, 255, 0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>🌡️ Temperature</label>
          <span style={{ color: '#4a9eff', fontSize: '18px', fontWeight: 'bold' }}>{temperature}°C</span>
        </div>
        <input
          type="range"
          min="-20"
          max="120"
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: '#333',
            outline: 'none',
            WebkitAppearance: 'none',
            appearance: 'none',
            cursor: 'pointer',
          }}
        />
        <style>{`
          input[type='range']::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #4a9eff;
            cursor: pointer;
            box-shadow: 0 0 8px rgba(74, 158, 255, 0.6);
          }
          input[type='range']::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #4a9eff;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 8px rgba(74, 158, 255, 0.6);
          }
        `}</style>
        <div style={{ marginTop: '12px', fontSize: '11px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
          <span>❄️ -20°C</span>
          <span>💧 0°C</span>
          <span>☁️ 100°C</span>
          <span>🔥 120°C</span>
        </div>
      </div>

      <button
        onClick={() => window.location.href = '/chemistry'}
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
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'
        }}
      >
        ← Back to Chemistry
      </button>
    </div>
  )
}

function StatesOfWaterContent({ temperature }: { temperature: number }) {
  const moleculesRef = useRef<H2OMolecule[]>([])
  const meshesRef = useRef<THREE.Group[]>([])
  const containerRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  const getState = (temp: number): 'solid' | 'liquid' | 'gas' => {
    if (temp < 0) return 'solid'
    if (temp > 100) return 'gas'
    return 'liquid'
  }

  useEffect(() => {
    const state = getState(temperature)
    const newMolecules: H2OMolecule[] = []

    const particlesPerLayer = Math.floor(NUM_MOLECULES / 3)
    const gridSize = Math.ceil(Math.sqrt(particlesPerLayer))
    const spacing = CONTAINER_SIZE * 0.7 / gridSize

    if (state === 'solid') {
      let moleculeIndex = 0
      for (let layer = 0; layer < 3; layer++) {
        const layerY = -CONTAINER_SIZE / 2 + 1 + layer * 0.6
        for (let i = 0; i < particlesPerLayer && moleculeIndex < NUM_MOLECULES; i++) {
          const gridX = i % gridSize
          const gridZ = Math.floor(i / gridSize)
          const x = (gridX - gridSize / 2) * spacing
          const z = (gridZ - gridSize / 2) * spacing

          newMolecules.push({
            id: moleculeIndex,
            position: new THREE.Vector3(x, layerY, z),
            velocity: new THREE.Vector3(0, 0, 0),
            targetPosition: new THREE.Vector3(x, layerY, z),
            rotation: new THREE.Euler(Math.random() * 0.3, Math.random() * 0.3, Math.random() * 0.3),
            state: 'solid',
            baseX: x,
            baseZ: z,
            vibrationPhase: Math.random() * Math.PI * 2,
          })
          moleculeIndex++
        }
      }
    } else if (state === 'liquid') {
      for (let i = 0; i < NUM_MOLECULES; i++) {
        newMolecules.push({
          id: i,
          position: new THREE.Vector3(
            (Math.random() - 0.5) * CONTAINER_SIZE * 0.9,
            -CONTAINER_SIZE / 2 + 3,
            (Math.random() - 0.5) * CONTAINER_SIZE * 0.9
          ),
          velocity: new THREE.Vector3((Math.random() - 0.5) * 1.5, 0, (Math.random() - 0.5) * 1.5),
          targetPosition: new THREE.Vector3(
            (Math.random() - 0.5) * CONTAINER_SIZE * 0.9,
            -CONTAINER_SIZE / 2 + 3,
            (Math.random() - 0.5) * CONTAINER_SIZE * 0.9
          ),
          rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
          state: 'liquid',
          baseX: (Math.random() - 0.5) * CONTAINER_SIZE * 0.9,
          baseZ: (Math.random() - 0.5) * CONTAINER_SIZE * 0.9,
          vibrationPhase: Math.random() * Math.PI * 2,
        })
      }
    } else {
      for (let i = 0; i < NUM_MOLECULES; i++) {
        newMolecules.push({
          id: i,
          position: new THREE.Vector3(
            (Math.random() - 0.5) * CONTAINER_SIZE * 0.95,
            (Math.random() - 0.5) * CONTAINER_SIZE * 0.95,
            (Math.random() - 0.5) * CONTAINER_SIZE * 0.95
          ),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 9,
            (Math.random() - 0.5) * 9,
            (Math.random() - 0.5) * 9
          ),
          targetPosition: new THREE.Vector3(
            (Math.random() - 0.5) * CONTAINER_SIZE * 0.95,
            (Math.random() - 0.5) * CONTAINER_SIZE * 0.95,
            (Math.random() - 0.5) * CONTAINER_SIZE * 0.95
          ),
          rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
          state: 'gas',
          baseX: 0,
          baseZ: 0,
          vibrationPhase: 0,
        })
      }
    }

    moleculesRef.current = newMolecules
  }, [temperature])

  useFrame((_state, deltaTime) => {
    timeRef.current += deltaTime
    const state = getState(temperature)
    const molecules = moleculesRef.current
    const bounceDistance = CONTAINER_SIZE / 2 - MOLECULE_RADIUS

    molecules.forEach((mol, idx) => {
      const lerpFactor = 0.08
      const velocityLerpFactor = 0.12

      if (state === 'solid') {
        mol.vibrationPhase += 0.12
        const thermalAmplitude = 0.035
        const vibX = Math.sin(mol.vibrationPhase) * thermalAmplitude * 0.5
        const vibY = Math.cos(mol.vibrationPhase * 0.7) * thermalAmplitude * 0.3
        const vibZ = Math.sin(mol.vibrationPhase * 0.9) * thermalAmplitude * 0.5

        mol.position.x = mol.targetPosition.x + vibX
        mol.position.y = mol.targetPosition.y + vibY
        mol.position.z = mol.targetPosition.z + vibZ

        mol.rotation.x += (Math.random() - 0.5) * 0.4 * deltaTime
        mol.rotation.y += (Math.random() - 0.5) * 0.4 * deltaTime
      } else if (state === 'liquid') {
        const rippleAmplitude = 0.2
        const rippleFrequency = 1.5
        const waveHeight = Math.sin(timeRef.current * rippleFrequency + mol.baseX * 0.2) * rippleAmplitude
        mol.position.y = mol.targetPosition.y + waveHeight

        mol.velocity.x *= 0.92
        mol.velocity.z *= 0.92
        mol.velocity.y = Math.max(-2.5, mol.velocity.y - 9.8 * deltaTime)

        mol.position.x += mol.velocity.x * deltaTime
        mol.position.z += mol.velocity.z * deltaTime
        mol.position.y = Math.max(-CONTAINER_SIZE / 2 + 1.2, mol.position.y + mol.velocity.y * deltaTime)

        if (mol.position.y <= -CONTAINER_SIZE / 2 + 1.2) {
          mol.velocity.y *= -0.3
          mol.velocity.x *= 0.7
          mol.velocity.z *= 0.7
        }

        if (Math.abs(mol.position.x) > CONTAINER_SIZE / 2 - 1) {
          mol.position.x = Math.sign(mol.position.x) * (CONTAINER_SIZE / 2 - 1)
          mol.velocity.x *= -0.7
        }
        if (Math.abs(mol.position.z) > CONTAINER_SIZE / 2 - 1) {
          mol.position.z = Math.sign(mol.position.z) * (CONTAINER_SIZE / 2 - 1)
          mol.velocity.z *= -0.7
        }

        mol.rotation.x += mol.velocity.x * 0.1 * deltaTime
        mol.rotation.y += mol.velocity.z * 0.1 * deltaTime
      } else {
        mol.velocity.x += (Math.random() - 0.5) * 18 * deltaTime
        mol.velocity.y += (Math.random() - 0.5) * 18 * deltaTime
        mol.velocity.z += (Math.random() - 0.5) * 18 * deltaTime

        mol.position.x += mol.velocity.x * deltaTime
        mol.position.y += mol.velocity.y * deltaTime
        mol.position.z += mol.velocity.z * deltaTime

        if (Math.abs(mol.position.x) > bounceDistance) {
          mol.position.x = Math.sign(mol.position.x) * bounceDistance
          mol.velocity.x *= -0.8
        }
        if (Math.abs(mol.position.y) > bounceDistance) {
          mol.position.y = Math.sign(mol.position.y) * bounceDistance
          mol.velocity.y *= -0.8
        }
        if (Math.abs(mol.position.z) > bounceDistance) {
          mol.position.z = Math.sign(mol.position.z) * bounceDistance
          mol.velocity.z *= -0.8
        }

        mol.rotation.x += mol.velocity.x * 0.5 * deltaTime
        mol.rotation.y += mol.velocity.y * 0.5 * deltaTime
        mol.rotation.z += mol.velocity.z * 0.5 * deltaTime
      }

      if (meshesRef.current[idx]) {
        meshesRef.current[idx].position.copy(mol.position)
        meshesRef.current[idx].rotation.set(mol.rotation.x, mol.rotation.y, mol.rotation.z)
      }
    })
  })

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[12, 12, 12]} intensity={1.2} color={0xffffff} />
      <pointLight position={[-8, -8, -8]} intensity={0.6} color={0x4a9eff} />

      <mesh ref={containerRef}>
        <boxGeometry args={[CONTAINER_SIZE, CONTAINER_SIZE, CONTAINER_SIZE]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.08}
          color={0x4a9eff}
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>

      <lineSegments>
        <edgesGeometry
          attach="geometry"
          args={[new THREE.BoxGeometry(CONTAINER_SIZE, CONTAINER_SIZE, CONTAINER_SIZE)]}
        />
        <lineBasicMaterial attach="material" color={0x4a9eff} linewidth={1} />
      </lineSegments>

      {moleculesRef.current.map((mol, idx) => (
        <group
          key={mol.id}
          ref={(el) => {
            if (el) meshesRef.current[idx] = el
          }}
          position={[mol.position.x, mol.position.y, mol.position.z]}
          rotation={[mol.rotation.x, mol.rotation.y, mol.rotation.z]}
        >
          <mesh>
            <sphereGeometry args={[MOLECULE_RADIUS * 0.7, 14, 14]} />
            <meshPhongMaterial color={0xff4444} emissive={0xff3333} shininess={100} />
          </mesh>

          <mesh position={[-MOLECULE_RADIUS * 0.5, MOLECULE_RADIUS * 0.4, 0]}>
            <sphereGeometry args={[MOLECULE_RADIUS * 0.35, 10, 10]} />
            <meshPhongMaterial color={0xdddddd} shininess={60} />
          </mesh>
          <mesh position={[MOLECULE_RADIUS * 0.5, MOLECULE_RADIUS * 0.4, 0]}>
            <sphereGeometry args={[MOLECULE_RADIUS * 0.35, 10, 10]} />
            <meshPhongMaterial color={0xdddddd} shininess={60} />
          </mesh>
        </group>
      ))}

      <OrbitControls enableZoom enablePan enableRotate autoRotate autoRotateSpeed={1.5} minDistance={20} maxDistance={50} />
    </>
  )
}
