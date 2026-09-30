import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const NUM_MOLECULES = 1000
const CONTAINER_SIZE = 16
const MOLECULE_RADIUS = 0.3

export function StatesOfWaterSimulator() {
  const [temperature, setTemperature] = useState(20)

  const getState = (temp: number): 'solid' | 'liquid' | 'gas' => (temp < 0 ? 'solid' : temp > 100 ? 'gas' : 'liquid')
  const getStateLabel = (temp: number): string => {
    const state = getState(temp)
    return state === 'solid' ? '❄️ ICE (Solid)' : state === 'gas' ? '☁️ STEAM (Gas)' : '💧 WATER (Liquid)'
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#0a0a1a' }}>
      <Canvas camera={{ position: [22, 18, 22], fov: 45 }}>
        <StatesOfWaterContent temperature={temperature} />
      </Canvas>

      <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(10, 10, 26, 0.95)', border: '2px solid #4a9eff', borderRadius: '12px', padding: '20px', color: '#fff', fontFamily: "'Segoe UI', sans-serif", maxWidth: '380px', fontSize: '13px', lineHeight: '1.6', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(74, 158, 255, 0.2)', zIndex: 100 }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#66ccff', fontWeight: '700' }}>Water States</h2>
        <p style={{ margin: '8px 0 12px 0', fontSize: '18px', color: '#4a9eff', fontWeight: 'bold' }}>{getStateLabel(temperature)}</p>
        <p style={{ margin: '8px 0', fontSize: '14px', color: '#aaa' }}>Temperature: {temperature}°C</p>
        <p style={{ margin: '0', fontSize: '12px', color: '#888', lineHeight: '1.6' }}>
          Watch H₂O molecules: rigid ice lattice below 0°C, flowing liquid between 0-100°C, rapidly bouncing steam above 100°C.
        </p>
      </div>

      <div style={{ position: 'absolute', left: '20px', bottom: '30px', width: '300px', backgroundColor: 'rgba(10, 10, 26, 0.95)', border: '2px solid #4a9eff', borderRadius: '12px', padding: '20px', fontFamily: "'Segoe UI', sans-serif", zIndex: 100, backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(74, 158, 255, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>🌡️ Temperature</label>
          <span style={{ color: '#4a9eff', fontSize: '18px', fontWeight: 'bold' }}>{temperature}°C</span>
        </div>
        <input type="range" min="-20" max="120" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} style={{ width: '100%', height: '6px', borderRadius: '3px', background: '#333', outline: 'none', WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer' }} />
        <style>{`input[type='range']::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #4a9eff; cursor: pointer; box-shadow: 0 0 8px rgba(74, 158, 255, 0.6); }`}</style>
        <div style={{ marginTop: '12px', fontSize: '11px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
          <span>❄️ -20°C</span> <span>💧 0°C</span> <span>☁️ 100°C</span> <span>🔥 120°C</span>
        </div>
      </div>

      <button onClick={() => (window.location.href = '/chemistry')} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 100, padding: '0.75rem 1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)' }}>
        ← Back
      </button>
    </div>
  )
}

function StatesOfWaterContent({ temperature }: { temperature: number }) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  const meshesRef = useRef<THREE.Group[]>([])
  const moleculesRef = useRef<any[]>([])
  const timeRef = useRef(0)

  const getState = (temp: number) => (temp < 0 ? 'solid' : temp > 100 ? 'gas' : 'liquid')
  const speedMultiplier = (temperature + 30) / 60

  useEffect(() => {
    const state = getState(temperature)
    const molecules: any[] = []
    const particlesPerLayer = Math.floor(NUM_MOLECULES / 3)
    const gridSize = Math.ceil(Math.sqrt(particlesPerLayer))
    const spacing = CONTAINER_SIZE * 0.95 / gridSize

    if (state === 'solid') {
      let idx = 0
      for (let layer = 0; layer < 3; layer++) {
        const layerY = -CONTAINER_SIZE / 2 + 1.2 + layer * spacing * 0.6
        for (let i = 0; i < particlesPerLayer && idx < NUM_MOLECULES; i++) {
          const gx = i % gridSize
          const gz = Math.floor(i / gridSize)
          molecules.push({
            position: new THREE.Vector3((gx - gridSize / 2) * spacing, layerY, (gz - gridSize / 2) * spacing),
            velocity: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(Math.random() * 0.3, Math.random() * 0.3, Math.random() * 0.3),
            baseX: (gx - gridSize / 2) * spacing,
            baseZ: (gz - gridSize / 2) * spacing,
            baseY: layerY,
            vibrationPhase: Math.random() * Math.PI * 2,
          })
          idx++
        }
      }
    } else if (state === 'liquid') {
      for (let i = 0; i < NUM_MOLECULES; i++) {
        molecules.push({
          position: new THREE.Vector3((Math.random() - 0.5) * CONTAINER_SIZE * 0.9, -CONTAINER_SIZE / 2 + 2.5, (Math.random() - 0.5) * CONTAINER_SIZE * 0.9),
          velocity: new THREE.Vector3((Math.random() - 0.5) * 1.5, 0, (Math.random() - 0.5) * 1.5),
          rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
          baseX: (Math.random() - 0.5) * CONTAINER_SIZE * 0.9,
          baseZ: (Math.random() - 0.5) * CONTAINER_SIZE * 0.9,
          baseY: -CONTAINER_SIZE / 2 + 2.5,
          vibrationPhase: Math.random() * Math.PI * 2,
        })
      }
    } else {
      for (let i = 0; i < NUM_MOLECULES; i++) {
        molecules.push({
          position: new THREE.Vector3((Math.random() - 0.5) * CONTAINER_SIZE * 0.95, (Math.random() - 0.5) * CONTAINER_SIZE * 0.95, (Math.random() - 0.5) * CONTAINER_SIZE * 0.95),
          velocity: new THREE.Vector3((Math.random() - 0.5) * 20 * speedMultiplier, (Math.random() - 0.5) * 20 * speedMultiplier, (Math.random() - 0.5) * 20 * speedMultiplier),
          rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
          baseX: 0,
          baseZ: 0,
          baseY: 0,
          vibrationPhase: 0,
        })
      }
    }
    moleculesRef.current = molecules
  }, [temperature])

  useFrame((_state, deltaTime) => {
    timeRef.current += deltaTime
    const state = getState(temperature)
    const molecules = moleculesRef.current
    const bounceDistance = CONTAINER_SIZE / 2 - MOLECULE_RADIUS
    const matrix = new THREE.Matrix4()

    molecules.forEach((mol, idx) => {
      if (state === 'solid') {
        mol.vibrationPhase += 0.12 * speedMultiplier
        const thermalAmp = 0.05 * speedMultiplier
        mol.position.x = mol.baseX + Math.sin(mol.vibrationPhase) * thermalAmp * 0.6
        mol.position.y = mol.baseY + Math.cos(mol.vibrationPhase * 0.7) * thermalAmp * 0.3
        mol.position.z = mol.baseZ + Math.sin(mol.vibrationPhase * 0.9) * thermalAmp * 0.6
        mol.rotation.x += (Math.random() - 0.5) * 0.4 * deltaTime * speedMultiplier
        mol.rotation.y += (Math.random() - 0.5) * 0.4 * deltaTime * speedMultiplier
      } else if (state === 'liquid') {
        const rippleAmp = 0.25 * speedMultiplier
        const rippleFreq = 1.5 * speedMultiplier
        mol.position.y = mol.baseY + Math.sin(timeRef.current * rippleFreq + mol.baseX * 0.2) * rippleAmp
        mol.velocity.x *= 0.92
        mol.velocity.z *= 0.92
        mol.velocity.y = Math.max(-2.5, mol.velocity.y - 9.8 * deltaTime * speedMultiplier)
        mol.position.x += mol.velocity.x * deltaTime * speedMultiplier
        mol.position.z += mol.velocity.z * deltaTime * speedMultiplier
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
        mol.rotation.x += mol.velocity.x * 0.1 * deltaTime * speedMultiplier
        mol.rotation.y += mol.velocity.z * 0.1 * deltaTime * speedMultiplier
      } else {
        mol.velocity.x += (Math.random() - 0.5) * 20 * deltaTime * speedMultiplier
        mol.velocity.y += (Math.random() - 0.5) * 20 * deltaTime * speedMultiplier
        mol.velocity.z += (Math.random() - 0.5) * 20 * deltaTime * speedMultiplier
        const maxSpeed = 15 * speedMultiplier
        const speed = Math.sqrt(mol.velocity.x ** 2 + mol.velocity.y ** 2 + mol.velocity.z ** 2)
        if (speed > maxSpeed) {
          const scale = maxSpeed / speed
          mol.velocity.x *= scale
          mol.velocity.y *= scale
          mol.velocity.z *= scale
        }
        mol.position.x += mol.velocity.x * deltaTime * speedMultiplier * 2
        mol.position.y += mol.velocity.y * deltaTime * speedMultiplier * 2
        mol.position.z += mol.velocity.z * deltaTime * speedMultiplier * 2
        if (Math.abs(mol.position.x) > bounceDistance) {
          mol.position.x = Math.sign(mol.position.x) * bounceDistance
          mol.velocity.x *= -0.9
        }
        if (Math.abs(mol.position.y) > bounceDistance) {
          mol.position.y = Math.sign(mol.position.y) * bounceDistance
          mol.velocity.y *= -0.9
        }
        if (Math.abs(mol.position.z) > bounceDistance) {
          mol.position.z = Math.sign(mol.position.z) * bounceDistance
          mol.velocity.z *= -0.9
        }
        mol.rotation.x += mol.velocity.x * 0.5 * deltaTime * speedMultiplier
        mol.rotation.y += mol.velocity.y * 0.5 * deltaTime * speedMultiplier
        mol.rotation.z += mol.velocity.z * 0.5 * deltaTime * speedMultiplier
      }

      if (instancedMeshRef.current) {
        matrix.setPosition(mol.position.x, mol.position.y, mol.position.z)
        instancedMeshRef.current.setMatrixAt(idx, matrix)
      }
    })

    if (instancedMeshRef.current) instancedMeshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[12, 12, 12]} intensity={1.2} color={0xffffff} />
      <pointLight position={[-8, -8, -8]} intensity={0.6} color={0x4a9eff} />

      <mesh>
        <boxGeometry args={[CONTAINER_SIZE, CONTAINER_SIZE, CONTAINER_SIZE]} />
        <meshPhysicalMaterial transparent opacity={0.08} color={0x4a9eff} metalness={0.2} roughness={0.6} />
      </mesh>

      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(CONTAINER_SIZE, CONTAINER_SIZE, CONTAINER_SIZE)]} />
        <lineBasicMaterial attach="material" color={0x4a9eff} linewidth={1} />
      </lineSegments>

      <instancedMesh ref={instancedMeshRef} args={[new THREE.SphereGeometry(MOLECULE_RADIUS, 10, 10), new THREE.MeshPhongMaterial({ color: 0xff4444, emissive: 0xff3333, shininess: 100 }), NUM_MOLECULES]} />

      <OrbitControls enableZoom enablePan enableRotate autoRotate autoRotateSpeed={1.5} minDistance={20} maxDistance={50} />
    </>
  )
}
