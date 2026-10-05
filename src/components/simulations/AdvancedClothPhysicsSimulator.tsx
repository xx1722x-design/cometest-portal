import React, { Suspense, useRef, useEffect, ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// Safe Verlet Particle class
class Particle {
  position: THREE.Vector3
  prevPosition: THREE.Vector3
  pinned = false
  damping = 0.99

  constructor(x: number, y: number, z: number) {
    this.position = new THREE.Vector3(x, y, z)
    this.prevPosition = new THREE.Vector3(x, y, z)
  }

  applyForce(fx: number, fy: number, fz: number) {
    this.position.x += fx
    this.position.y += fy
    this.position.z += fz
  }

  integrate() {
    if (this.pinned) return

    const vx = (this.position.x - this.prevPosition.x) * this.damping
    const vy = (this.position.y - this.prevPosition.y) * this.damping
    const vz = (this.position.z - this.prevPosition.z) * this.damping

    this.prevPosition.copy(this.position)

    this.position.x += vx
    this.position.y += vy - 0.025
    this.position.z += vz
  }
}

// Safe Constraint class
class Constraint {
  p1: Particle
  p2: Particle
  restDistance: number

  constructor(p1: Particle, p2: Particle) {
    this.p1 = p1
    this.p2 = p2
    this.restDistance = p1.position.distanceTo(p2.position)
  }

  satisfy() {
    const dx = this.p2.position.x - this.p1.position.x
    const dy = this.p2.position.y - this.p1.position.y
    const dz = this.p2.position.z - this.p1.position.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (dist < 0.001) return

    const diff = (this.restDistance - dist) / dist
    const mx = (dx * diff) * 0.5
    const my = (dy * diff) * 0.5
    const mz = (dz * diff) * 0.5

    if (!this.p1.pinned) {
      this.p1.position.x -= mx
      this.p1.position.y -= my
      this.p1.position.z -= mz
    }

    if (!this.p2.pinned) {
      this.p2.position.x += mx
      this.p2.position.y += my
      this.p2.position.z += mz
    }
  }
}

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

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Simulation Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#0b0f19',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: '#ff0000',
          fontFamily: "'Courier New', monospace",
          fontSize: '14px',
          padding: '20px',
        }}>
          <h2 style={{ color: '#ff4444' }}>⚠️ SIMULATION ERROR</h2>
          <p style={{ color: '#ffaaaa' }}>{this.state.error?.message}</p>
          <pre style={{
            backgroundColor: '#1a1f2e',
            padding: '12px',
            borderRadius: '8px',
            color: '#0f0',
            fontSize: '11px',
            maxHeight: '300px',
            overflow: 'auto',
          }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              backgroundColor: '#ff4444',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Cloth Mesh with Safe Verlet Integration
function ClothMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<Particle[] | null>(null)
  const constraintsRef = useRef<Constraint[] | null>(null)
  const geometryRef = useRef<THREE.BufferGeometry | null>(null)

  useEffect(() => {
    if (!meshRef.current) return

    const clothWidth = 8
    const clothHeight = 6
    const segmentsX = 20
    const segmentsY = 15

    // Initialize particles (SAFE: always defined)
    const particles: Particle[] = []
    for (let y = 0; y <= segmentsY; y++) {
      for (let x = 0; x <= segmentsX; x++) {
        const px = (x / segmentsX) * clothWidth - clothWidth / 2
        const py = clothHeight
        const pz = (y / segmentsY) * clothHeight

        const particle = new Particle(px, py, pz)

        // Pin top corners
        if (y === 0 && (x === 0 || x === segmentsX)) {
          particle.pinned = true
        }

        particles.push(particle)
      }
    }
    particlesRef.current = particles

    // Initialize constraints (SAFE: always defined)
    const constraints: Constraint[] = []
    for (let y = 0; y <= segmentsY; y++) {
      for (let x = 0; x <= segmentsX; x++) {
        const index = x + y * (segmentsX + 1)

        if (x < segmentsX) {
          const p1 = particles[index]
          const p2 = particles[index + 1]
          if (p1 && p2) constraints.push(new Constraint(p1, p2))
        }

        if (y < segmentsY) {
          const p1 = particles[index]
          const p2 = particles[index + segmentsX + 1]
          if (p1 && p2) constraints.push(new Constraint(p1, p2))
        }
      }
    }
    constraintsRef.current = constraints

    // Initialize geometry (SAFE: immediate initialization)
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particles.length * 3)

    particles.forEach((p, i) => {
      positions[i * 3] = p.position.x
      positions[i * 3 + 1] = p.position.y
      positions[i * 3 + 2] = p.position.z
    })

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.computeVertexNormals()
    geometryRef.current = geometry
    meshRef.current.geometry = geometry

    // Create indices for cloth triangles
    const indices: number[] = []
    for (let y = 0; y < segmentsY; y++) {
      for (let x = 0; x < segmentsX; x++) {
        const a = x + y * (segmentsX + 1)
        const b = x + 1 + y * (segmentsX + 1)
        const c = x + (y + 1) * (segmentsX + 1)
        const d = x + 1 + (y + 1) * (segmentsX + 1)

        indices.push(a, c, b)
        indices.push(b, c, d)
      }
    }
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
  }, [])

  useFrame(() => {
    // SAFE: Check all refs exist before using
    if (!meshRef.current || !particlesRef.current || !constraintsRef.current) return

    const particles = particlesRef.current
    const constraints = constraintsRef.current

    // Apply wind force (SAFE: iterate safely)
    ;(particles || []).forEach((p) => {
      p.applyForce(Math.random() * 0.02 - 0.01, 0, Math.random() * 0.02 - 0.01)
    })

    // Constraint satisfaction (SAFE: iterate safely)
    for (let iter = 0; iter < 3; iter++) {
      ;(constraints || []).forEach((c) => c.satisfy())
    }

    // Integrate (SAFE: iterate safely)
    ;(particles || []).forEach((p) => p.integrate())

    // Update geometry (SAFE: check attribute exists)
    if (meshRef.current.geometry?.attributes?.position) {
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array | undefined
      if (positions) {
        particles.forEach((p, i) => {
          positions[i * 3] = p.position.x
          positions[i * 3 + 1] = p.position.y
          positions[i * 3 + 2] = p.position.z
        })
        meshRef.current.geometry.attributes.position.needsUpdate = true
      }
    }
  })

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <meshPhongMaterial
        color="#60a5fa"
        emissive="#1e40af"
        emissiveIntensity={0.3}
        side={THREE.DoubleSide}
        wireframe={false}
      />
    </mesh>
  )
}

// Interactive Sphere
function InteractiveSphere() {
  const sphereRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x += 0.005
      sphereRef.current.rotation.y += 0.008
    }
  })

  return (
    <mesh ref={sphereRef} position={[0, 2, 4]} castShadow receiveShadow>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color="#f59e0b"
        emissive="#d97706"
        emissiveIntensity={0.4}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  )
}

// Main Scene
function AdvancedClothScene() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      shadows
      camera={{ position: [0, 5, 12], fov: 45 }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={45} />
      <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom enablePan />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
      <pointLight position={[-10, 5, -10]} intensity={0.8} />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#60a5fa" />

      {/* Environment */}
      <Environment preset="sunset" />

      {/* Objects */}
      <ClothMesh />
      <InteractiveSphere />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0f172a" metalness={0.1} roughness={0.9} />
      </mesh>

      {/* Effects */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.9} intensity={1.5} />
        <DepthOfField focusDistance={10} focalLength={0.02} bokehScale={10} />
        <Vignette darkness={0.5} />
      </EffectComposer>

      <fog attach="fog" args={['#0a0a1a', 5, 50]} />
      <color attach="background" args={['#0a0a1a']} />
    </Canvas>
  )
}

export function AdvancedClothPhysicsSimulator() {
  return (
    <ErrorBoundary>
      <div style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0a0a1a',
      }}>
        <Suspense fallback={
          <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a1a',
            color: '#00ff88',
            fontSize: '18px',
            fontFamily: "'Segoe UI', sans-serif",
          }}>
            Loading Advanced Cloth Physics...
          </div>
        }>
          <AdvancedClothScene />
        </Suspense>

        {/* Info Overlay */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #60a5fa',
          borderRadius: '12px',
          padding: '16px 24px',
          backdropFilter: 'blur(10px)',
          color: '#fff',
          fontFamily: "'Segoe UI', sans-serif",
          fontSize: '14px',
          zIndex: 100,
          boxShadow: '0 8px 32px rgba(96, 165, 250, 0.3)',
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#60a5fa', fontWeight: '700' }}>
            🧵 Advanced Cloth Physics
          </h3>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#888' }}>
            Verlet Integration • Post-Processing • HDRI Lighting
          </p>
          <p style={{ margin: '0', fontSize: '12px', color: '#aaa' }}>
            Orbit to rotate • Scroll to zoom • Wind physics
          </p>
        </div>
      </div>
    </ErrorBoundary>
  )
}
