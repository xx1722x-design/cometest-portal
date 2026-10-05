import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, TorusKnot, Points, PointMaterial, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing'
import * as THREE from 'three'

// Neon Torus Knot - Premium Centerpiece
function GlowingTorusKnot() {
  const torusRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (torusRef.current) {
      torusRef.current.rotation.x = state.clock.elapsedTime * 0.3
      torusRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <TorusKnot
      ref={torusRef}
      args={[3, 1, 256, 32]}
      castShadow
      receiveShadow
      position={[0, 0, 0]}
    >
      <meshStandardMaterial
        color="#00ff88"
        emissive="#00ff88"
        emissiveIntensity={0.8}
        metalness={0.8}
        roughness={0.2}
      />
    </TorusKnot>
  )
}

// Animated Particle Cloud
function ParticleCloud() {
  const pointsRef = useRef<THREE.Points>(null)
  const particlesRef = useRef<Float32Array | null>(null)

  useFrame((state) => {
    if (pointsRef.current && particlesRef.current) {
      const positions = particlesRef.current
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.01
        positions[i + 1] += Math.cos(state.clock.elapsedTime * 0.3 + i) * 0.01
        positions[i + 2] += Math.sin(state.clock.elapsedTime * 0.4 + i) * 0.01
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  // Generate particle positions on a sphere
  const generateParticles = () => {
    const positions = new Float32Array(5000 * 3)
    for (let i = 0; i < 5000; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const radius = 8 + Math.random() * 4

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.cos(phi)
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }
    particlesRef.current = positions
    return positions
  }

  return (
    <Points positions={generateParticles()}>
      <PointMaterial
        transparent
        color="#00ffff"
        size={0.15}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  )
}

// Rotating Wireframe Ring
function WireframeRing() {
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.elapsedTime * 0.2
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.15
    }
  })

  return (
    <mesh ref={ringRef} position={[0, 0, 0]}>
      <torusGeometry args={[6, 0.3, 64, 100]} />
      <meshStandardMaterial
        color="#ff00ff"
        emissive="#ff00ff"
        emissiveIntensity={0.6}
        wireframe={false}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  )
}

// Main Canvas Scene
function NeonWaveScene() {
  return (
    <Canvas
      shadows
      style={{ width: '100%', height: '100vh', background: '#0b0f19' }}
      camera={{ position: [0, 0, 15], fov: 50 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
    >
      {/* Lighting Setup */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ff88" />
      <pointLight position={[-10, -10, 10]} intensity={1.2} color="#ff00ff" />
      <pointLight position={[0, 5, -15]} intensity={1} color="#00ffff" />

      {/* Environment */}
      <Environment preset="night" />

      {/* 3D Objects */}
      <GlowingTorusKnot />
      <WireframeRing />
      <ParticleCloud />

      {/* Controls */}
      <OrbitControls
        enableZoom
        enablePan
        autoRotate
        autoRotateSpeed={2}
        dampingFactor={0.05}
      />

      {/* Post-Processing Effects */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={2} />
        <DepthOfField focusDistance={10} focalLength={0.02} bokehScale={8} />
      </EffectComposer>

      {/* Fog for depth */}
      <fog attach="fog" args={['#0b0f19', 10, 50]} />
    </Canvas>
  )
}

export function AdvancedClothPhysicsSimulator() {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0b0f19',
      }}
    >
      <Suspense
        fallback={
          <div
            style={{
              width: '100%',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0b0f19',
              color: '#00ff88',
              fontSize: '18px',
              fontFamily: "'Segoe UI', sans-serif",
            }}
          >
            Loading Neon Wave Simulation...
          </div>
        }
      >
        <NeonWaveScene />
      </Suspense>

      {/* Premium Info Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(11, 15, 25, 0.95)',
          border: '2px solid #00ff88',
          borderRadius: '12px',
          padding: '16px 24px',
          backdropFilter: 'blur(10px)',
          color: '#fff',
          fontFamily: "'Segoe UI', sans-serif",
          fontSize: '14px',
          zIndex: 100,
          boxShadow: '0 8px 32px rgba(0, 255, 136, 0.3)',
        }}
      >
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            color: '#00ff88',
            fontWeight: '700',
          }}
        >
          ✨ Neon Wave Sculpture
        </h3>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#888' }}>
          Torus Knot • Particle Cloud • Bloom & Depth of Field
        </p>
        <p style={{ margin: '0', fontSize: '12px', color: '#aaa' }}>
          Orbit to rotate • Scroll to zoom • Auto-rotating
        </p>
      </div>
    </div>
  )
}
