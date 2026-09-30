import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface H2OMolecule {
  id: number
  position: THREE.Vector3
  velocity: THREE.Vector3
  rotation: THREE.Euler
  state: 'solid' | 'liquid' | 'gas'
}

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
    <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#000' }}>
      <Canvas camera={{ position: [0, 0, 25], fov: 50 }}>
        <StatesOfWaterContent temperature={temperature} />
      </Canvas>

      {/* Temperature Info */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          border: '2px solid #4a9eff',
          borderRadius: '12px',
          padding: '20px',
          color: '#fff',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '300px',
          backdropFilter: 'blur(10px)',
          zIndex: 100,
        }}
      >
        <h2 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Water States</h2>
        <p style={{ margin: '8px 0', fontSize: '24px', color: '#4a9eff', fontWeight: 'bold' }}>{getStateLabel(temperature)}</p>
        <p style={{ margin: '8px 0', fontSize: '16px', color: '#aaa' }}>Temperature: {temperature}°C</p>
        <p style={{ margin: '8px 0', fontSize: '12px', color: '#888', lineHeight: '1.6' }}>
          Watch how H₂O molecules change their behavior with temperature. Below 0°C they form a rigid ice lattice. Between 0-100°C they flow as liquid. Above 100°C they bounce rapidly as steam.
        </p>
      </div>

      {/* Temperature Slider */}
      <div
        style={{
          position: 'absolute',
          left: '20px',
          bottom: '30px',
          width: '300px',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          border: '2px solid #4a9eff',
          borderRadius: '12px',
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
          zIndex: 100,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ color: '#fff', fontWeight: 'bold' }}>🌡️ Temperature</label>
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
          }
          input[type='range']::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #4a9eff;
            cursor: pointer;
            border: none;
          }
        `}</style>
        <div style={{ marginTop: '10px', fontSize: '11px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
          <span>❄️ -20°C</span>
          <span>💧 0°C</span>
          <span>☁️ 100°C</span>
          <span>🔥 120°C</span>
        </div>
      </div>
    </div>
  )
}

function StatesOfWaterContent({ temperature }: { temperature: number }) {
  const moleculesRef = useRef<H2OMolecule[]>([])
  const containerRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  const getState = (temp: number): 'solid' | 'liquid' | 'gas' => {
    if (temp < 0) return 'solid'
    if (temp > 100) return 'gas'
    return 'liquid'
  }

  // Initialize molecules
  useEffect(() => {
    const state = getState(temperature)
    const newMolecules: H2OMolecule[] = []

    const createMolecules = () => {
      for (let i = 0; i < 80; i++) {
        if (state === 'solid') {
          // Lattice formation
          const gridSize = 5
          const spacing = 2
          const x = (i % gridSize) * spacing - gridSize * spacing / 2
          const y = 3 + ((Math.floor(i / gridSize) % gridSize) * spacing) - gridSize * spacing / 2
          const z = ((Math.floor(i / (gridSize * gridSize)) % gridSize) * spacing) - gridSize * spacing / 2

          newMolecules.push({
            id: i,
            position: new THREE.Vector3(x, y, z),
            velocity: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(Math.random() * 0.3, Math.random() * 0.3, Math.random() * 0.3),
            state: 'solid',
          })
        } else if (state === 'liquid') {
          newMolecules.push({
            id: i,
            position: new THREE.Vector3((Math.random() - 0.5) * 8, Math.random() * 4 - 3, (Math.random() - 0.5) * 8),
            velocity: new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2),
            rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
            state: 'liquid',
          })
        } else {
          // Gas - dispersed throughout container
          newMolecules.push({
            id: i,
            position: new THREE.Vector3((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9),
            velocity: new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6),
            rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
            state: 'gas',
          })
        }
      }
    }

    createMolecules()
    moleculesRef.current = newMolecules
  }, [temperature])

  useFrame((_state, deltaTime) => {
    const state = getState(temperature)
    const molecules = moleculesRef.current

    molecules.forEach((mol) => {
      if (state === 'solid') {
        // Slight vibration in place
        mol.position.x += (Math.random() - 0.5) * 0.1 * deltaTime
        mol.position.y += (Math.random() - 0.5) * 0.1 * deltaTime
        mol.position.z += (Math.random() - 0.5) * 0.1 * deltaTime
        mol.rotation.x += (Math.random() - 0.5) * 0.3 * deltaTime
        mol.rotation.y += (Math.random() - 0.5) * 0.3 * deltaTime
      } else if (state === 'liquid') {
        // Sliding movement with friction
        mol.velocity.x *= 0.95
        mol.velocity.z *= 0.95
        mol.velocity.y = Math.max(-2, mol.velocity.y - 9.8 * deltaTime)

        mol.position.x += mol.velocity.x * deltaTime
        mol.position.z += mol.velocity.z * deltaTime
        mol.position.y += mol.velocity.y * deltaTime

        // Keep in container
        if (mol.position.y < -3.5) {
          mol.position.y = -3.5
          mol.velocity.y *= -0.5
          mol.velocity.x *= 0.8
          mol.velocity.z *= 0.8
        }

        if (Math.abs(mol.position.x) > 4.5) mol.position.x = Math.sign(mol.position.x) * 4.5
        if (Math.abs(mol.position.z) > 4.5) mol.position.z = Math.sign(mol.position.z) * 4.5

        mol.rotation.x += mol.velocity.x * 0.1 * deltaTime
        mol.rotation.y += mol.velocity.z * 0.1 * deltaTime
      } else {
        // Gas - rapid bouncing
        mol.velocity.x += (Math.random() - 0.5) * 15 * deltaTime
        mol.velocity.y += (Math.random() - 0.5) * 15 * deltaTime
        mol.velocity.z += (Math.random() - 0.5) * 15 * deltaTime

        mol.position.x += mol.velocity.x * deltaTime
        mol.position.y += mol.velocity.y * deltaTime
        mol.position.z += mol.velocity.z * deltaTime

        // Wall collisions
        const bounds = 4.5
        if (Math.abs(mol.position.x) > bounds) mol.velocity.x *= -1
        if (Math.abs(mol.position.y) > bounds) mol.velocity.y *= -1
        if (Math.abs(mol.position.z) > bounds) mol.velocity.z *= -1

        mol.rotation.x += mol.velocity.x * 0.5 * deltaTime
        mol.rotation.y += mol.velocity.y * 0.5 * deltaTime
        mol.rotation.z += mol.velocity.z * 0.5 * deltaTime
      }
    })
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color={0xffffff} />

      {/* Glass container */}
      <mesh ref={containerRef} position={[0, 0, 0]}>
        <boxGeometry args={[9, 9, 9]} />
        <meshStandardMaterial color={0xccddff} metalness={0.8} roughness={0.1} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Container edges */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={24}
            array={new Float32Array([
              -4.5, -4.5, -4.5, 4.5, -4.5, -4.5,
              4.5, -4.5, -4.5, 4.5, 4.5, -4.5,
              4.5, 4.5, -4.5, -4.5, 4.5, -4.5,
              -4.5, 4.5, -4.5, -4.5, -4.5, -4.5,
              -4.5, -4.5, 4.5, 4.5, -4.5, 4.5,
              4.5, -4.5, 4.5, 4.5, 4.5, 4.5,
              4.5, 4.5, 4.5, -4.5, 4.5, 4.5,
              -4.5, 4.5, 4.5, -4.5, -4.5, 4.5,
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0x4a9eff} linewidth={2} />
      </lineSegments>

      {/* H2O Molecules */}
      {moleculesRef.current.map((mol) => (
        <group key={mol.id} position={[mol.position.x, mol.position.y, mol.position.z]} rotation={[mol.rotation.x, mol.rotation.y, mol.rotation.z]}>
          {/* Oxygen atom (red) */}
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color={0xff3333} metalness={0.6} roughness={0.4} emissive={0xff3333} emissiveIntensity={0.3} />
          </mesh>

          {/* Hydrogen atoms (white/blue) */}
          <mesh position={[-0.3, 0.3, 0]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color={0xeeeeee} metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0.3, 0.3, 0]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color={0xeeeeee} metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </>
  )
}
