import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function MoonPhaseSimulator() {
  const [day, setDay] = useState(1)
  const moonPhases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent']
  const phaseIndex = Math.floor(((day - 1) / 30) * moonPhases.length) % moonPhases.length

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#000' }}>
      <Canvas camera={{ position: [0, 0, 30], fov: 50 }}>
        <MoonPhaseContent day={day} />
      </Canvas>

      {/* Moon Phase Info */}
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
        <h2 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Day {day} of 30</h2>
        <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a9eff', fontWeight: 'bold' }}>{moonPhases[phaseIndex]}</p>
        <p style={{ margin: '8px 0', fontSize: '12px', color: '#aaa', lineHeight: '1.6' }}>The Moon orbits Earth every 29.5 days. As it orbits, we see different amounts of its illuminated side, creating the lunar phases.</p>
      </div>

      {/* Moon minimap view */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '150px',
          height: '150px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          border: '2px solid #4a9eff',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif',
          zIndex: 100,
          overflow: 'hidden',
        }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ width: '100%', height: '100%' }}>
          <MoonMinimap day={day} />
        </Canvas>
      </div>

      {/* Day slider */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
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
          <label style={{ color: '#fff', fontWeight: 'bold' }}>Lunar Day</label>
          <span style={{ color: '#4a9eff', fontSize: '18px', fontWeight: 'bold' }}>{day}</span>
        </div>
        <input
          type="range"
          min="1"
          max="30"
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
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
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#aaa', textAlign: 'center' }}>
          Drag to change the day and observe the moon phase
        </div>
      </div>
    </div>
  )
}

function MoonPhaseContent({ day }: { day: number }) {
  const earthRef = useRef<THREE.Mesh>(null)
  const moonRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  useFrame((_state, deltaTime) => {
    // Rotate Earth
    if (earthRef.current) {
      earthRef.current.rotation.y += deltaTime * 0.2
    }

    // Position moon based on day (0-30)
    const angle = ((day - 1) / 30) * Math.PI * 2
    const moonDistance = 8
    const moonX = Math.cos(angle) * moonDistance
    const moonZ = Math.sin(angle) * moonDistance

    if (moonRef.current) {
      moonRef.current.position.set(moonX, 0, moonZ)
      // Face the same direction as it orbits (synchronous rotation)
      moonRef.current.lookAt(0, 0, 0)
    }
  })

  return (
    <>
      {/* Stars */}
      <StarField />

      {/* Lighting - Sun far away creating directional light */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[20, 10, 20]} intensity={2} color={0xffffff} castShadow />

      {/* Earth */}
      <mesh ref={earthRef} castShadow>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial color={0x4a90e2} metalness={0.1} roughness={0.8} map={generateEarthTexture()} />
        <pointLight position={[0, 0, 0]} intensity={0.3} color={0x4a90e2} />
      </mesh>

      {/* Moon with craters */}
      <mesh ref={moonRef} castShadow>
        <sphereGeometry args={[0.6, 64, 64]} />
        <meshStandardMaterial color={0xcccccc} metalness={0.4} roughness={0.6} map={generateMoonTexture()} />
      </mesh>

      {/* Orbit line */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={64}
            array={new Float32Array(
              Array.from({ length: 64 }).flatMap((_, i) => [
                Math.cos((i / 64) * Math.PI * 2) * 8,
                0,
                Math.sin((i / 64) * Math.PI * 2) * 8,
              ])
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0x444444} linewidth={1} />
      </mesh>
    </>
  )
}

function MoonMinimap({ day }: { day: number }) {
  const canvasRef = useRef<THREE.CanvasTexture | null>(null)

  const getMoonPhaseImage = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')!

    // Angle for the phase
    const angle = ((day - 1) / 30) * Math.PI * 2

    // Draw dark background
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, 128, 128)

    // Draw full moon circle
    ctx.fillStyle = '#cccccc'
    ctx.beginPath()
    ctx.arc(64, 64, 50, 0, Math.PI * 2)
    ctx.fill()

    // Draw shadow (the part not illuminated)
    ctx.fillStyle = '#000'
    const shadowWidth = Math.cos(angle) * 50
    if (shadowWidth > 0) {
      // Waning phase - shadow on left
      ctx.fillRect(64 - 50, 14, shadowWidth, 100)
    } else {
      // Waxing phase - shadow on right
      ctx.fillRect(64, 14, Math.abs(shadowWidth), 100)
    }

    // Add craters for realism
    ctx.fillStyle = '#888'
    const craters = [
      { x: 64, y: 40, r: 4 },
      { x: 50, y: 60, r: 3 },
      { x: 75, y: 70, r: 2 },
      { x: 60, y: 85, r: 3 },
    ]
    craters.forEach((crater) => {
      ctx.beginPath()
      ctx.arc(crater.x, crater.y, crater.r, 0, Math.PI * 2)
      ctx.fill()
    })

    return canvas
  }

  const texture = new THREE.CanvasTexture(getMoonPhaseImage())

  return (
    <>
      <ambientLight intensity={1} />
      <mesh>
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial map={texture} />
      </mesh>
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

  const positions = new Float32Array(1000 * 3)
  for (let i = 0; i < 1000 * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 200
    positions[i + 1] = (Math.random() - 0.5) * 200
    positions[i + 2] = (Math.random() - 0.5) * 200
  }

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={1000} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.3} sizeAttenuation vertexColors />
    </points>
  )
}

function generateEarthTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  // Ocean
  ctx.fillStyle = '#1a5a8a'
  ctx.fillRect(0, 0, 256, 256)

  // Continents (simplified)
  ctx.fillStyle = '#2d5a2d'
  ctx.fillRect(30, 40, 80, 50)
  ctx.fillRect(150, 60, 60, 40)
  ctx.fillRect(100, 140, 70, 50)
  ctx.fillRect(20, 160, 50, 60)

  return new THREE.CanvasTexture(canvas)
}

function generateMoonTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  // Base color
  ctx.fillStyle = '#999999'
  ctx.fillRect(0, 0, 256, 256)

  // Craters
  ctx.fillStyle = '#666666'
  const craters = [
    { x: 50, y: 50, r: 20 },
    { x: 150, y: 80, r: 25 },
    { x: 100, y: 150, r: 15 },
    { x: 180, y: 180, r: 18 },
    { x: 70, y: 200, r: 12 },
  ]

  craters.forEach((crater) => {
    ctx.beginPath()
    ctx.arc(crater.x, crater.y, crater.r, 0, Math.PI * 2)
    ctx.fill()

    // Crater edges
    ctx.strokeStyle = '#555555'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(crater.x, crater.y, crater.r, 0, Math.PI * 2)
    ctx.stroke()
  })

  return new THREE.CanvasTexture(canvas)
}
