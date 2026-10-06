import React, { Suspense, useRef, useEffect, useState, ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Points, PointMaterial, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// Error Boundary
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('Fluid Particle Error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%', height: '100vh', backgroundColor: '#0b0f19',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#ff4444', fontFamily: "'Courier New', monospace", fontSize: '14px',
        }}>
          <div><h2>⚠️ RENDER ERROR</h2><p>{this.state.error?.message}</p></div>
        </div>
      )
    }
    return this.props.children
  }
}

// Particle fluid simulation
function ParticleFluid() {
  const particlesRef = useRef<Float32Array | null>(null)
  const velocitiesRef = useRef<Float32Array | null>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const { camera, mouse } = useThree()

  useEffect(() => {
    const particleCount = 5000
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    // Initialize particles in a sphere
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const radius = 4 + Math.random() * 2

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.cos(phi)
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

      velocities[i * 3] = (Math.random() - 0.5) * 0.2
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.2
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2
    }

    particlesRef.current = positions
    velocitiesRef.current = velocities
  }, [])

  useFrame(() => {
    if (!particlesRef.current || !velocitiesRef.current || !pointsRef.current) return

    const positions = particlesRef.current
    const velocities = velocitiesRef.current

    // Mouse-based attraction (simple mouse position)
    const mouseWorldPos = new THREE.Vector3(
      (mouse.x * 10),
      mouse.y * 10,
      5
    )

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]

      const dx = mouseWorldPos.x - x
      const dy = mouseWorldPos.y - y
      const dz = mouseWorldPos.z - z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      // Attraction to mouse
      if (dist < 8) {
        const force = (8 - dist) * 0.01
        velocities[i] += (dx / (dist + 0.1)) * force
        velocities[i + 1] += (dy / (dist + 0.1)) * force
        velocities[i + 2] += (dz / (dist + 0.1)) * force
      }

      // Damping & gravity
      velocities[i] *= 0.98
      velocities[i + 1] *= 0.98
      velocities[i + 2] *= 0.98
      velocities[i + 1] -= 0.01

      // Update position
      positions[i] += velocities[i]
      positions[i + 1] += velocities[i + 1]
      positions[i + 2] += velocities[i + 2]

      // Boundary wrapping
      if (positions[i] > 10) positions[i] = -10
      if (positions[i] < -10) positions[i] = 10
      if (positions[i + 1] > 10) positions[i + 1] = -10
      if (positions[i + 1] < -10) positions[i + 1] = 10
      if (positions[i + 2] > 10) positions[i + 2] = -10
      if (positions[i + 2] < -10) positions[i + 2] = 10
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <Points ref={pointsRef} positions={particlesRef.current || new Float32Array()}>
      <PointMaterial
        transparent
        color="#00ffff"
        size={0.08}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  )
}

// Main scene
function FluidScene() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 12], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[-10, -10, 10]} intensity={1.2} color="#ff00ff" />

      <ParticleFluid />

      <OrbitControls autoRotate autoRotateSpeed={1} enableZoom enablePan />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={2} />
        <DepthOfField focusDistance={10} focalLength={0.02} bokehScale={8} />
        <Vignette darkness={0.3} />
      </EffectComposer>

      <fog attach="fog" args={['#0b0f19', 5, 30]} />
      <color attach="background" args={['#0b0f19']} />
    </Canvas>
  )
}

export function FluidParticleSystem() {
  return (
    <ErrorBoundary>
      <div style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0b0f19',
      }}>
        <Suspense fallback={
          <div style={{
            width: '100%', height: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#0b0f19', color: '#00ff88', fontSize: '18px',
          }}>
            Initializing fluid simulation...
          </div>
        }>
          <FluidScene />
        </Suspense>

        {/* Info Panel */}
        <div style={{
          position: 'absolute', top: '20px', left: '20px',
          backgroundColor: 'rgba(11, 15, 25, 0.95)', border: '2px solid #00ffff',
          borderRadius: '12px', padding: '16px 24px', backdropFilter: 'blur(10px)',
          color: '#fff', fontFamily: "'Segoe UI', sans-serif", fontSize: '14px', zIndex: 100,
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#00ffff', fontSize: '16px' }}>
            ✨ 3D Fluid Particle System
          </h3>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#888' }}>
            5000+ Interactive particles • Mouse-reactive fluid dynamics
          </p>
          <p style={{ margin: '0', fontSize: '12px', color: '#aaa' }}>
            Move mouse • Orbit with mouse • Scroll to zoom
          </p>
        </div>
      </div>
    </ErrorBoundary>
  )
}
