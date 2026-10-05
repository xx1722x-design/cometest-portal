import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Sphere, Box, Torus } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// Cloth Simulation using Verlet Integration
class Cloth {
  particles: Particle[] = []
  constraints: Constraint[] = []
  geometry: THREE.BufferGeometry
  mesh: THREE.Mesh | null = null

  constructor(width: number, height: number, segments: number = 20) {
    this.geometry = new THREE.BufferGeometry()

    // Create particles
    for (let y = 0; y <= segments; y++) {
      for (let x = 0; x <= segments; x++) {
        const particle = new Particle(
          new THREE.Vector3((x / segments) * width - width / 2, height, (y / segments) * height),
          0.1
        )

        // Pin top corners
        if (y === 0 && (x === 0 || x === segments)) {
          particle.pinned = true
        }

        this.particles.push(particle)
      }
    }

    // Create constraints
    for (let y = 0; y <= segments; y++) {
      for (let x = 0; x <= segments; x++) {
        const index = x + y * (segments + 1)

        // Horizontal constraints
        if (x < segments) {
          const p1 = this.particles[index]
          const p2 = this.particles[index + 1]
          this.constraints.push(new Constraint(p1, p2))
        }

        // Vertical constraints
        if (y < segments) {
          const p1 = this.particles[index]
          const p2 = this.particles[index + segments + 1]
          this.constraints.push(new Constraint(p1, p2))
        }
      }
    }

    // Update geometry
    this.updateGeometry()
  }

  updateGeometry() {
    const positions = new Float32Array(this.particles.length * 3)
    this.particles.forEach((p, i) => {
      positions[i * 3] = p.position.x
      positions[i * 3 + 1] = p.position.y
      positions[i * 3 + 2] = p.position.z
    })

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.geometry.computeVertexNormals()
  }

  simulate(wind: THREE.Vector3) {
    this.particles.forEach((p) => p.applyForce(new THREE.Vector3(0, -0.098, 0)))
    this.particles.forEach((p) => p.applyForce(wind))

    for (let i = 0; i < 5; i++) {
      this.constraints.forEach((c) => c.satisfy())
    }

    this.particles.forEach((p) => p.integrate())
    this.updateGeometry()
  }
}

class Particle {
  position: THREE.Vector3
  oldPosition: THREE.Vector3
  acceleration = new THREE.Vector3(0, 0, 0)
  pinned = false
  damping = 0.99

  constructor(position: THREE.Vector3, mass: number) {
    this.position = position.clone()
    this.oldPosition = position.clone()
  }

  applyForce(force: THREE.Vector3) {
    this.acceleration.add(force)
  }

  integrate() {
    if (this.pinned) return

    const vel = this.position.clone().sub(this.oldPosition).multiplyScalar(this.damping)
    this.oldPosition.copy(this.position)
    this.position.add(vel).add(this.acceleration)
    this.acceleration.set(0, 0, 0)
  }
}

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
    const delta = this.p2.position.clone().sub(this.p1.position)
    const dist = delta.length()
    const diff = (this.restDistance - dist) / dist
    const offset = delta.multiplyScalar(diff * 0.5)

    if (!this.p1.pinned) this.p1.position.sub(offset)
    if (!this.p2.pinned) this.p2.position.add(offset)
  }
}

// Cloth Component
function ClothMesh({ cloth }: { cloth: Cloth }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const windRef = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((state) => {
    windRef.current.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
    windRef.current.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.02

    cloth.simulate(windRef.current)

    if (meshRef.current) {
      meshRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <mesh ref={meshRef} geometry={cloth.geometry} castShadow receiveShadow>
      <meshStandardMaterial color="#60a5fa" wireframe={false} metalness={0.3} roughness={0.5} emissive="#1e40af" emissiveIntensity={0.5} />
    </mesh>
  )
}

// Interactive Sphere
function InteractiveSphere() {
  const sphereRef = useRef<THREE.Mesh>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const dragPoint = useRef(new THREE.Vector3())
  const { camera } = useThree()

  useFrame((state) => {
    if (sphereRef.current && !isDragging) {
      sphereRef.current.rotation.x += 0.005
      sphereRef.current.rotation.y += 0.008
    }
  })

  const handlePointerDown = (e: any) => {
    setIsDragging(true)
  }

  const handlePointerMove = (e: any) => {
    if (isDragging && sphereRef.current) {
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(
        new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1),
        camera
      )

      raycaster.ray.intersectPlane(dragPlane.current, dragPoint.current)
      sphereRef.current.position.copy(dragPoint.current)
    }
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  return (
    <Sphere
      ref={sphereRef}
      args={[1, 64, 64]}
      position={[0, 0, 3]}
      castShadow
      receiveShadow
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <meshStandardMaterial
        color="#f59e0b"
        metalness={0.8}
        roughness={0.2}
        emissive="#d97706"
        emissiveIntensity={0.3}
      />
    </Sphere>
  )
}

// Premium 3D Scene
function AdvancedClothScene() {
  const clothRef = useRef(new Cloth(8, 6, 25))

  return (
    <Canvas shadows style={{ width: '100%', height: '100%' }} camera={{ position: [0, 5, 12], fov: 45 }}>
      <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={45} />
      <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom enablePan />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize-width={4096} shadow-mapSize-height={4096} />
      <pointLight position={[-10, 5, -10]} intensity={0.8} />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#60a5fa" />

      {/* Environment */}
      <Environment preset="sunset" />

      {/* Objects */}
      <ClothMesh cloth={clothRef.current} />
      <InteractiveSphere />

      <Box position={[-3, 0, 2]} scale={1.5} castShadow receiveShadow>
        <meshStandardMaterial color="#10b981" metalness={0.4} roughness={0.6} />
      </Box>

      <Torus position={[3, 2, -2]} args={[1, 0.4, 16, 16]} castShadow receiveShadow>
        <meshStandardMaterial color="#a855f7" metalness={0.3} roughness={0.5} emissive="#7c3aed" emissiveIntensity={0.4} />
      </Torus>

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
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#0a0a1a' }}>
      <AdvancedClothScene />

      {/* Premium Info Overlay */}
      <div
        style={{
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
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#60a5fa', fontWeight: '700' }}>🧵 Advanced Cloth Physics</h3>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#888' }}>Verlet Integration • Post-Processing • HDRI Lighting</p>
        <p style={{ margin: '0', fontSize: '12px', color: '#aaa' }}>Drag the golden sphere • Orbit to rotate • Scroll to zoom</p>
      </div>
    </div>
  )
}
