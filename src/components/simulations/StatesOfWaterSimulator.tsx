import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'

const NUM_MOLECULES = 1200
const CONTAINER_SIZE = 20
const MOLECULE_RADIUS = 0.28

export function StatesOfWaterSimulator() {
  const { t } = useTranslation()
  const [temperature, setTemperature] = useState(20)
  const isInfinity = temperature >= 120

  const getState = (temp: number): 'solid' | 'liquid' | 'gas' | 'plasma' => {
    if (isInfinity) return 'plasma'
    if (temp < 0) return 'solid'
    if (temp > 100) return 'gas'
    return 'liquid'
  }

  const getStateLabel = (temp: number): string => {
    if (isInfinity) return '⚡ PLASMA'
    if (temp < 0) return '❄️ ICE (Solid)'
    if (temp > 100) return '☁️ STEAM (Gas)'
    return '💧 WATER (Liquid)'
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#0a0a1a' }}>
      <Canvas camera={{ position: [32, 26, 32], fov: 40 }}>
        <StatesOfWaterContent temperature={temperature} isInfinity={isInfinity} />
      </Canvas>

      <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(10, 10, 26, 0.95)', border: '2px solid #4a9eff', borderRadius: '12px', padding: '20px', color: '#fff', fontFamily: "'Segoe UI', sans-serif", maxWidth: '380px', fontSize: '13px', lineHeight: '1.6', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(74, 158, 255, 0.2)', zIndex: 100 }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#66ccff', fontWeight: '700' }}>{t('states_of_water_title')}</h2>
        <p style={{ margin: '8px 0 12px 0', fontSize: '18px', color: '#4a9eff', fontWeight: 'bold' }}>{getStateLabel(temperature)}</p>
        <p style={{ margin: '8px 0', fontSize: '14px', color: '#aaa' }}>{t('temperature_label')}: {isInfinity ? '∞' : `${temperature}°C`}</p>
        <p style={{ margin: '0', fontSize: '12px', color: '#888', lineHeight: '1.6' }}>
          {t('states_of_water_content')}
        </p>
      </div>

      <div style={{ position: 'absolute', left: '20px', bottom: '30px', width: '320px', backgroundColor: 'rgba(10, 10, 26, 0.95)', border: '2px solid #4a9eff', borderRadius: '12px', padding: '20px', fontFamily: "'Segoe UI', sans-serif", zIndex: 100, backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(74, 158, 255, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>🌡️ {isInfinity ? '∞' : `${temperature}°C`}</label>
        </div>
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <input type="range" min="-20" max="120" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} style={{ width: '100%', height: '6px', borderRadius: '3px', background: '#333', outline: 'none', WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer' }} />
          <style>{`input[type='range']::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #4a9eff; cursor: pointer; box-shadow: 0 0 8px rgba(74, 158, 255, 0.6); }`}</style>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '2px', fontSize: '11px', color: '#888', textAlign: 'center' }}>
          <span>❄️ -20°C</span> <span>💧 0°C</span> <span>☁️ 100°C</span> <span>⚡ ∞</span>
        </div>
      </div>

      <button onClick={() => (window.location.href = '/chemistry')} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 100, padding: '0.75rem 1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', transition: 'all 0.3s ease' }}>
        {t('back_button')}
      </button>
    </div>
  )
}

function StatesOfWaterContent({ temperature, isInfinity }: { temperature: number; isInfinity: boolean }) {
  const groupsRef = useRef<THREE.Group[]>([])
  const linesRef = useRef<THREE.LineSegments>(null)
  const moleculesRef = useRef<any[]>([])
  const timeRef = useRef(0)
  const [renderCount, setRenderCount] = useState(0)

  const getState = (temp: number) => (isInfinity ? 'plasma' : temp < 0 ? 'solid' : temp > 100 ? 'gas' : 'liquid')
  const speedMultiplier = (temperature + 30) / 60
  const evaporationRatio = Math.max(0, Math.min(1, (temperature - 0) / 100))

  const initializeMolecules = (temp: number, inf: boolean) => {
    const state = inf ? 'plasma' : temp < 0 ? 'solid' : temp > 100 ? 'gas' : 'liquid'
    const speedMult = (temp + 30) / 60
    const evapRatio = Math.max(0, Math.min(1, (temp - 0) / 100))
    const molecules: any[] = []
    const particlesPerLayer = Math.floor(NUM_MOLECULES / 3)
    const gridSize = Math.ceil(Math.sqrt(particlesPerLayer))
    const usableWidth = CONTAINER_SIZE - 2 * MOLECULE_RADIUS
    const spacing = gridSize > 1 ? usableWidth / (gridSize - 1) : usableWidth
    const startOffset = -CONTAINER_SIZE / 2 + MOLECULE_RADIUS

    if (state === 'solid' || evapRatio < 1) {
      let idx = 0
      const solidCount = Math.floor(NUM_MOLECULES * (1 - evapRatio))
      for (let layer = 0; layer < 3 && idx < solidCount; layer++) {
        const layerY = -CONTAINER_SIZE / 2 + 1.5 + layer * spacing * 0.6
        for (let i = 0; i < particlesPerLayer && idx < solidCount; i++) {
          const gx = i % gridSize
          const gz = Math.floor(i / gridSize)
          molecules.push({
            position: new THREE.Vector3(startOffset + gx * spacing, layerY, startOffset + gz * spacing),
            velocity: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(Math.random() * 0.3, Math.random() * 0.3, Math.random() * 0.3),
            baseX: (gx - gridSize / 2) * spacing,
            baseZ: (gz - gridSize / 2) * spacing,
            baseY: layerY,
            vibrationPhase: Math.random() * Math.PI * 2,
            state: 'liquid',
          })
          idx++
        }
      }
    }

    const gasCount = NUM_MOLECULES - molecules.length
    for (let i = 0; i < gasCount; i++) {
      const vel = state === 'plasma' ? 25 : 15
      molecules.push({
        position: new THREE.Vector3((Math.random() - 0.5) * CONTAINER_SIZE * 0.95, (Math.random() - 0.5) * CONTAINER_SIZE * 0.95, (Math.random() - 0.5) * CONTAINER_SIZE * 0.95),
        velocity: new THREE.Vector3((Math.random() - 0.5) * vel * speedMult, (Math.random() - 0.5) * vel * speedMult, (Math.random() - 0.5) * vel * speedMult),
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        baseX: 0,
        baseZ: 0,
        baseY: 0,
        vibrationPhase: Math.random() * Math.PI * 2,
        state: state === 'plasma' ? 'plasma' : 'gas',
      })
    }
    moleculesRef.current = molecules
  }

  useEffect(() => {
    initializeMolecules(temperature, isInfinity)
    setRenderCount((c) => c + 1)
  }, [temperature, isInfinity])

  useEffect(() => {
    initializeMolecules(temperature, isInfinity)
    setRenderCount((c) => c + 1)
  }, [])

  useFrame((_state, deltaTime) => {
    const molecules = moleculesRef.current
    if (!molecules.length) return

    const bounceDistance = CONTAINER_SIZE / 2 - MOLECULE_RADIUS

    timeRef.current += deltaTime
    const state = getState(temperature)

    molecules.forEach((mol) => {
      if (mol.state === 'liquid') {
        mol.vibrationPhase += 0.12 * speedMultiplier
        const thermalAmp = 0.05 * speedMultiplier
        mol.position.x = mol.baseX + Math.sin(mol.vibrationPhase) * thermalAmp * 0.6
        mol.position.y = mol.baseY + Math.cos(mol.vibrationPhase * 0.7) * thermalAmp * 0.3
        mol.position.z = mol.baseZ + Math.sin(mol.vibrationPhase * 0.9) * thermalAmp * 0.6
      } else {
        const gasSpeed = state === 'plasma' ? 30 : 20
        mol.velocity.x += (Math.random() - 0.5) * gasSpeed * deltaTime * speedMultiplier
        mol.velocity.y += (Math.random() - 0.5) * gasSpeed * deltaTime * speedMultiplier
        mol.velocity.z += (Math.random() - 0.5) * gasSpeed * deltaTime * speedMultiplier
        const maxSpeed = (state === 'plasma' ? 25 : 15) * speedMultiplier
        const speed = Math.sqrt(mol.velocity.x ** 2 + mol.velocity.y ** 2 + mol.velocity.z ** 2)
        if (speed > maxSpeed) {
          const scale = maxSpeed / speed
          mol.velocity.x *= scale
          mol.velocity.y *= scale
          mol.velocity.z *= scale
        }
        mol.position.x += mol.velocity.x * deltaTime * speedMultiplier * (state === 'plasma' ? 2.5 : 1.5)
        mol.position.y += mol.velocity.y * deltaTime * speedMultiplier * (state === 'plasma' ? 2.5 : 1.5)
        mol.position.z += mol.velocity.z * deltaTime * speedMultiplier * (state === 'plasma' ? 2.5 : 1.5)

        if (Math.abs(mol.position.x) > bounceDistance) {
          mol.position.x = Math.sign(mol.position.x) * bounceDistance
          mol.velocity.x *= -0.85
        }
        if (Math.abs(mol.position.y) > bounceDistance) {
          mol.position.y = Math.sign(mol.position.y) * bounceDistance
          mol.velocity.y *= -0.85
        }
        if (Math.abs(mol.position.z) > bounceDistance) {
          mol.position.z = Math.sign(mol.position.z) * bounceDistance
          mol.velocity.z *= -0.85
        }
      }
    })

    molecules.forEach((mol, idx) => {
      if (groupsRef.current[idx]) {
        groupsRef.current[idx].position.copy(mol.position)
        groupsRef.current[idx].rotation.set(mol.rotation.x, mol.rotation.y, mol.rotation.z)
      }
    })

    if (linesRef.current) {
      const positions: number[] = []
      if (evaporationRatio < 0.5) {
        const liquidParticles = molecules.filter((m) => m.state === 'liquid')
        for (let i = 0; i < liquidParticles.length; i++) {
          for (let j = i + 1; j < Math.min(i + 10, liquidParticles.length); j++) {
            const dist = liquidParticles[i].position.distanceTo(liquidParticles[j].position)
            if (dist < 1.5) {
              positions.push(liquidParticles[i].position.x, liquidParticles[i].position.y, liquidParticles[i].position.z)
              positions.push(liquidParticles[j].position.x, liquidParticles[j].position.y, liquidParticles[j].position.z)
            }
          }
        }
      }
      const geometry = linesRef.current.geometry as THREE.BufferGeometry
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
      geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[15, 15, 15]} intensity={1.2} color={0xffffff} />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color={0x4a9eff} />
      {getState(temperature) === 'plasma' && <pointLight position={[0, 0, 0]} intensity={2} color={0xff00ff} />}

      <mesh>
        <boxGeometry args={[CONTAINER_SIZE, CONTAINER_SIZE, CONTAINER_SIZE]} />
        <meshPhysicalMaterial transparent opacity={0.08} color={0x4a9eff} metalness={0.2} roughness={0.6} />
      </mesh>

      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(CONTAINER_SIZE, CONTAINER_SIZE, CONTAINER_SIZE)]} />
        <lineBasicMaterial attach="material" color={0x4a9eff} linewidth={1} />
      </lineSegments>

      {moleculesRef.current.map((mol, idx) => (
        <group key={idx} ref={(el) => { if (el) groupsRef.current[idx] = el }} position={[mol.position.x, mol.position.y, mol.position.z]} rotation={[mol.rotation.x, mol.rotation.y, mol.rotation.z]}>
          {mol.state === 'plasma' ? (
            <>
              <mesh scale={1.2}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshPhongMaterial color={0xff00ff} emissive={0xff00ff} emissiveIntensity={2} shininess={100} />
              </mesh>
            </>
          ) : (
            <>
              <mesh>
                <sphereGeometry args={[MOLECULE_RADIUS * 1.4, 12, 12]} />
                <meshPhongMaterial color={0xff4444} emissive={getState(temperature) === 'plasma' ? 0xff0088 : 0xff3333} shininess={100} emissiveIntensity={getState(temperature) === 'plasma' ? 1.5 : 0.3} />
              </mesh>
              <mesh position={[-MOLECULE_RADIUS * 0.8, MOLECULE_RADIUS * 0.6, 0]}>
                <sphereGeometry args={[MOLECULE_RADIUS * 0.7, 10, 10]} />
                <meshPhongMaterial color={0xeeeeee} shininess={60} />
              </mesh>
              <mesh position={[MOLECULE_RADIUS * 0.8, MOLECULE_RADIUS * 0.6, 0]}>
                <sphereGeometry args={[MOLECULE_RADIUS * 0.7, 10, 10]} />
                <meshPhongMaterial color={0xeeeeee} shininess={60} />
              </mesh>
            </>
          )}
        </group>
      ))}

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={0} array={new Float32Array(0)} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color={0xff4444} linewidth={1} transparent opacity={0.7} />
      </lineSegments>

      <OrbitControls enableZoom enablePan enableRotate autoRotate autoRotateSpeed={1.2} minDistance={25} maxDistance={60} />
    </>
  )
}
