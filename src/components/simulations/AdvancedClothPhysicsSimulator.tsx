import React, { Suspense, useRef, useEffect, useState, ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// Safe Verlet Particle
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

// Safe Constraint
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
    console.error('Cloth Physics Error:', error, errorInfo)
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
          <h2 style={{ color: '#ff4444' }}>⚠️ ERROR</h2>
          <p>{this.state.error?.message}</p>
          <pre style={{
            backgroundColor: '#1a1f2e',
            padding: '12px',
            borderRadius: '8px',
            color: '#0f0',
            fontSize: '11px',
            maxHeight: '300px',
            overflow: 'auto',
          }}>{this.state.error?.stack}</pre>
          <button onClick={() => window.location.reload()} style={{
            marginTop: '16px',
            padding: '10px 20px',
            backgroundColor: '#ff4444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}>Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}

// Cloth Mesh Component
function ClothMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<Particle[] | null>(null)
  const constraintsRef = useRef<Constraint[] | null>(null)

  useEffect(() => {
    if (!meshRef.current) return

    const clothWidth = 8
    const clothHeight = 6
    const segmentsX = 20
    const segmentsY = 15

    // Create particles
    const particles: Particle[] = []
    for (let y = 0; y <= segmentsY; y++) {
      for (let x = 0; x <= segmentsX; x++) {
        const px = (x / segmentsX) * clothWidth - clothWidth / 2
        const py = clothHeight
        const pz = (y / segmentsY) * clothHeight
        const particle = new Particle(px, py, pz)
        if (y === 0 && (x === 0 || x === segmentsX)) {
          particle.pinned = true
        }
        particles.push(particle)
      }
    }
    particlesRef.current = particles

    // Create constraints
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

    // Create geometry
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particles.length * 3)
    particles.forEach((p, i) => {
      positions[i * 3] = p.position.x
      positions[i * 3 + 1] = p.position.y
      positions[i * 3 + 2] = p.position.z
    })
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.computeVertexNormals()

    // Create indices
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

    meshRef.current.geometry = geometry
  }, [])

  useFrame(() => {
    if (!meshRef.current || !particlesRef.current || !constraintsRef.current) return

    const particles = particlesRef.current
    const constraints = constraintsRef.current

    // Apply forces
    ;(particles || []).forEach((p) => {
      p.applyForce(Math.random() * 0.02 - 0.01, 0, Math.random() * 0.02 - 0.01)
    })

    // Satisfy constraints
    for (let iter = 0; iter < 3; iter++) {
      ;(constraints || []).forEach((c) => c.satisfy())
    }

    // Integrate
    ;(particles || []).forEach((p) => p.integrate())

    // Update positions
    if (meshRef.current.geometry?.attributes?.position) {
      const posAttr = meshRef.current.geometry.attributes.position
      const positions = posAttr.array as Float32Array | undefined
      if (positions && particles) {
        particles.forEach((p, i) => {
          positions[i * 3] = p.position.x
          positions[i * 3 + 1] = p.position.y
          positions[i * 3 + 2] = p.position.z
        })
        posAttr.needsUpdate = true
      }
    }
  })

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <meshPhysicalMaterial
        color="#00ffff"
        emissive="#0088ff"
        emissiveIntensity={1.5}
        metalness={0.8}
        roughness={0.15}
        side={THREE.DoubleSide}
        wireframe={false}
        clearcoat={0.5}
        clearcoatRoughness={0.2}
      />
    </mesh>
  )
}

// Interactive Sphere
function Sphere() {
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
      <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.4} metalness={0.8} roughness={0.2} />
    </mesh>
  )
}

// Main Canvas Scene
function ClothPhysicsScene() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      shadows
      camera={{ position: [0, 5, 12], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
    >
      <ambientLight intensity={1.0} />
      <directionalLight position={[-8, 15, 10]} intensity={3.0} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[-6, 6, 8]} intensity={2.0} color="#00ffff" />
      <pointLight position={[6, 6, 8]} intensity={2.0} color="#ff00ff" />
      <pointLight position={[0, 4, 12]} intensity={1.8} color="#00ff88" />

      <ClothMesh />
      <Sphere />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a2a4a" metalness={0.3} roughness={0.6} emissive="#001a33" emissiveIntensity={0.2} />
      </mesh>

      <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom enablePan />
      <fog attach="fog" args={['#0a0a1a', 5, 50]} />
      <color attach="background" args={['#0a0a1a']} />
    </Canvas>
  )
}

export function AdvancedClothPhysicsSimulator() {
  const [resetKey, setResetKey] = useState(0)

  const handleReset = () => {
    setResetKey(prev => prev + 1)
  }

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
          }}>
            Loading Cloth Physics...
          </div>
        }>
          <ClothPhysicsScene key={resetKey} />
        </Suspense>

        {/* Top-Left Info Panel */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(10, 10, 26, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '2px solid #00ffff',
          borderRadius: '16px',
          padding: '20px 28px',
          color: '#fff',
          fontSize: '14px',
          fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
          zIndex: 100,
          boxShadow: '0 8px 32px rgba(0, 255, 255, 0.2)',
          maxWidth: '320px',
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            color: '#00ffff',
            fontSize: '18px',
            fontWeight: '700',
            textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
          }}>
            🧵 Cloth Physics Simulator
          </h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#aaa', lineHeight: '1.5' }}>
            Interactive 3D cloth dynamics with Verlet integration, wind forces, and gravity.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginTop: '12px',
            fontSize: '12px',
            color: '#888',
          }}>
            <div>🖱️ <strong style={{ color: '#00ffff' }}>Drag</strong> to rotate</div>
            <div>🔍 <strong style={{ color: '#00ffff' }}>Scroll</strong> to zoom</div>
            <div>💨 Watch wind dynamics</div>
            <div>⬇️ Gravity pulls cloth</div>
          </div>
        </div>

        {/* Bottom-Right Control Panel */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'rgba(10, 10, 26, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '2px solid #ff00ff',
          borderRadius: '16px',
          padding: '16px 24px',
          color: '#fff',
          fontSize: '13px',
          fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
          zIndex: 100,
          boxShadow: '0 8px 32px rgba(255, 0, 255, 0.2)',
        }}>
          <button
            onClick={handleReset}
            style={{
              backgroundColor: '#ff00ff',
              color: '#0a0a1a',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ff33ff'
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 0, 255, 0.8)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ff00ff'
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.5)'
            }}
          >
            🔄 Reset Cloth
          </button>
          <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: '#666' }}>
            Press to restart the simulation
          </p>
        </div>
      </div>
    </ErrorBoundary>
  )
}
