import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface Method {
  id: string
  name: string
  description: string
  color: string
  explanation: string
}

const METHODS: Method[] = [
  {
    id: 'water',
    name: 'Water',
    description: 'Pour water to cool the flame',
    color: '#4a9eff',
    explanation: 'Water absorbs heat and cools the candle below its burning temperature.',
  },
  {
    id: 'smother',
    name: 'Smother with Glass',
    description: 'Cover with a glass to block oxygen',
    color: '#b3b3ff',
    explanation: 'Fire needs oxygen. Covering the candle removes oxygen from the flame.',
  },
  {
    id: 'blow',
    name: 'Blow Out',
    description: 'Blow strongly to disperse the flame',
    color: '#a8d5ff',
    explanation: 'Strong air currents cool the flame and scatter the burning gases.',
  },
  {
    id: 'pinch',
    name: 'Pinch Wick',
    description: 'Extinguish by pinching the wick',
    color: '#ffcc99',
    explanation: 'Removing fuel source (wick) stops the chemical reaction.',
  },
]

export function CandleExtinguishingSimulator() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [isExtinguished, setIsExtinguished] = useState(false)
  const [time, setTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedMethod && !isExtinguished) {
        setTime((prev) => {
          if (prev >= 100) {
            setIsExtinguished(true)
            return 100
          }
          return prev + 5
        })
      }
    }, 100)

    return () => clearInterval(interval)
  }, [selectedMethod, isExtinguished])

  const currentMethod = METHODS.find((m) => m.id === selectedMethod)

  const reset = () => {
    setSelectedMethod(null)
    setIsExtinguished(false)
    setTime(0)
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#1a1a2e' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <CandleExtinguishingContent selectedMethod={selectedMethod} time={time} isExtinguished={isExtinguished} />
      </Canvas>

      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          border: '2px solid #ff9500',
          borderRadius: '12px',
          padding: '20px',
          color: '#fff',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '320px',
          backdropFilter: 'blur(10px)',
          zIndex: 100,
        }}
      >
        <h2 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Candle Extinguishing</h2>
        <p style={{ margin: '8px 0', fontSize: '12px', color: '#aaa', lineHeight: '1.6' }}>
          {isExtinguished
            ? selectedMethod
              ? `Method: ${currentMethod?.name} - ${currentMethod?.explanation}`
              : 'Select a method to extinguish the candle'
            : selectedMethod
              ? `Extinguishing... (${time}%)`
              : 'Click a button below to choose a method and test it'}
        </p>
      </div>

      {/* Method buttons */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          border: '2px solid #ff9500',
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '600px',
          fontFamily: 'Arial, sans-serif',
          zIndex: 100,
          backdropFilter: 'blur(10px)',
        }}
      >
        {METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => {
              setSelectedMethod(method.id)
              setTime(0)
              setIsExtinguished(false)
            }}
            disabled={selectedMethod !== null && selectedMethod !== method.id && !isExtinguished}
            style={{
              padding: '10px 16px',
              backgroundColor: selectedMethod === method.id ? method.color : '#333',
              border: `2px solid ${method.color}`,
              color: '#fff',
              borderRadius: '8px',
              cursor: selectedMethod !== null && selectedMethod !== method.id && !isExtinguished ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: selectedMethod !== null && selectedMethod !== method.id && !isExtinguished ? 0.5 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            {method.name}
          </button>
        ))}

        {isExtinguished && (
          <button
            onClick={reset}
            style={{
              padding: '10px 16px',
              backgroundColor: '#ff9500',
              border: '2px solid #ff9500',
              color: '#fff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              marginLeft: '12px',
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Progress bar */}
      {selectedMethod && !isExtinguished && (
        <div
          style={{
            position: 'absolute',
            bottom: '150px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '300px',
            height: '8px',
            backgroundColor: '#333',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid #ff9500',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${time}%`,
              backgroundColor: '#ff9500',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Extinguished message */}
      {isExtinguished && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '3px solid #ff9500',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            color: '#fff',
            fontFamily: 'Arial, sans-serif',
            zIndex: 101,
            backdropFilter: 'blur(10px)',
          }}
        >
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#ff9500' }}>🎉 Candle Extinguished!</h1>
          <p style={{ margin: '10px 0', fontSize: '16px', color: '#aaa' }}>{currentMethod?.name} method successful</p>
          <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666', maxWidth: '400px' }}>
            This demonstrates how removing heat, oxygen, or fuel source stops the combustion reaction.
          </p>
        </div>
      )}
    </div>
  )
}

function CandleExtinguishingContent({ selectedMethod, time, isExtinguished }: { selectedMethod: string | null; time: number; isExtinguished: boolean }) {
  const candleRef = useRef<THREE.Group>(null)
  const flameRef = useRef<THREE.Mesh>(null)
  const waterRef = useRef<THREE.Mesh>(null)
  const glassRef = useRef<THREE.Mesh>(null)

  useFrame((_state, deltaTime) => {
    // Animate flame
    if (flameRef.current && !isExtinguished) {
      flameRef.current.scale.y = 1 + Math.sin(Date.now() * 0.01) * 0.3
      flameRef.current.scale.x = 1 + Math.sin(Date.now() * 0.008) * 0.2
      flameRef.current.position.y = 1 + Math.sin(Date.now() * 0.01) * 0.2
      ;(flameRef.current.material as any).opacity = 1 - time / 100
    } else if (flameRef.current) {
      ;(flameRef.current.material as any).opacity = 0
    }

    // Water animation
    if (selectedMethod === 'water' && waterRef.current) {
      waterRef.current.position.y = 2 - time / 50
      waterRef.current.scale.y = Math.max(0, 1 - time / 100)
    }

    // Glass cover animation
    if (selectedMethod === 'smother' && glassRef.current) {
      glassRef.current.position.y = 2 - (time / 100) * 1.5
    }
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <pointLight position={[5, 5, 5]} intensity={1} color={0xffffff} />

      {/* Candle group */}
      <group ref={candleRef}>
        {/* Candle wax */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.5, 1.5, 32]} />
          <meshStandardMaterial color={0xffcc99} metalness={0.1} roughness={0.8} />
        </mesh>

        {/* Wick */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
          <meshStandardMaterial color={0x222222} metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Flame */}
        {!isExtinguished && (
          <mesh ref={flameRef} position={[0, 1.3, 0]}>
            <coneGeometry args={[0.3, 0.8, 32]} />
            <meshStandardMaterial color={0xff6b00} emissive={0xff9500} emissiveIntensity={0.8} transparent />
            <pointLight position={[0, 0, 0]} intensity={2} color={0xffaa00} distance={10} />
          </mesh>
        )}
      </group>

      {/* Water stream */}
      {selectedMethod === 'water' && (
        <mesh ref={waterRef} position={[0.8, 2, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.5, 32]} />
          <meshStandardMaterial color={0x4a9eff} transparent opacity={0.6} metalness={0.3} roughness={0.1} />
        </mesh>
      )}

      {/* Glass cover */}
      {selectedMethod === 'smother' && (
        <mesh ref={glassRef} position={[0, 2, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 1.5, 32]} />
          <meshStandardMaterial color={0xb3b3ff} transparent opacity={0.3} metalness={0.8} roughness={0.1} />
        </mesh>
      )}

      {/* Blow effect (particles) */}
      {selectedMethod === 'blow' && <BlowEffect progress={time / 100} />}

      {/* Base/Table */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[3, 3, 0.3, 32]} />
        <meshStandardMaterial color={0x4a4a4a} metalness={0.2} roughness={0.6} />
      </mesh>
    </>
  )
}

function BlowEffect({ progress }: { progress: number }) {
  const particlesRef = useRef<THREE.Points>(null)

  useEffect(() => {
    if (!particlesRef.current) return

    const count = 100
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 5 + 3

      positions[i * 3] = 0
      positions[i * 3 + 1] = 1.3
      positions[i * 3 + 2] = 0

      velocities[i * 3] = Math.cos(angle) * speed
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 2
      velocities[i * 3 + 2] = Math.sin(angle) * speed
    }

    const geometry = particlesRef.current.geometry as THREE.BufferGeometry
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    ;(geometry.userData as any).velocities = velocities
  }, [])

  useFrame(() => {
    if (!particlesRef.current) return

    const geometry = particlesRef.current.geometry as THREE.BufferGeometry
    const positions = geometry.attributes.position.array as Float32Array
    const velocities = (geometry.userData as any).velocities as Float32Array

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i] * 0.02
      positions[i + 1] += velocities[i + 1] * 0.02
      positions[i + 2] += velocities[i + 2] * 0.02
    }

    geometry.attributes.position.needsUpdate = true
  })

  const positions = new Float32Array(100 * 3)
  for (let i = 0; i < 100; i++) {
    positions[i * 3] = 0
    positions[i * 3 + 1] = 1.3
    positions[i * 3 + 2] = 0
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={100} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color={0x888888} transparent opacity={Math.max(0, 1 - progress)} />
    </points>
  )
}
