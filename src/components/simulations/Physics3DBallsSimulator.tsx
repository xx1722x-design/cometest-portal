import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

// Physics ball component
function PhysicsBall({ position, radius = 0.5 }: { position: [number, number, number]; radius?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const bodyRef = useRef<CANNON.Body | null>(null)
  const { scene } = useThree()

  // Get physics world from window (set by PhysicsWorld)
  const world = (window as any).__physicsWorld as CANNON.World

  useEffect(() => {
    if (!meshRef.current || !world) return

    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
      mass: 1,
      shape,
      linearDamping: 0.3,
      angularDamping: 0.3,
    })

    body.position.set(position[0], position[1], position[2])
    world.addBody(body)
    bodyRef.current = body

    return () => {
      world.removeBody(body)
    }
  }, [world, radius, position])

  useFrame(() => {
    if (meshRef.current && bodyRef.current) {
      meshRef.current.position.copy(bodyRef.current.position as any)
      meshRef.current.quaternion.copy(bodyRef.current.quaternion as any)
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={new THREE.Color().setHSL(Math.random(), 0.8, 0.6)}
        emissive={new THREE.Color().setHSL(Math.random(), 0.6, 0.3)}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  )
}

// Ground plane
function Ground() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { scene } = useThree()
  const world = (window as any).__physicsWorld as CANNON.World

  useEffect(() => {
    if (!world) return

    const groundShape = new CANNON.Plane()
    const groundBody = new CANNON.Body({ mass: 0, shape: groundShape })
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    groundBody.position.y = -5
    world.addBody(groundBody)

    return () => {
      world.removeBody(groundBody)
    }
  }, [world])

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.8} />
    </mesh>
  )
}

// Physics world initialization
function PhysicsWorld({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return

    const world = new CANNON.World()
    world.gravity.set(0, -9.82, 0)
    world.defaultContactMaterial.friction = 0.3
    world.defaultContactMaterial.restitution = 0.7

    ;(window as any).__physicsWorld = world

    const stepInterval = setInterval(() => {
      world.step(1 / 60)
    }, 1000 / 60)

    initialized.current = true

    return () => {
      clearInterval(stepInterval)
      delete (window as any).__physicsWorld
    }
  }, [])

  return <>{children}</>
}

// Main 3D Scene
function Physics3DScene() {
  const ballCount = 20

  return (
    <PhysicsWorld>
      <Canvas shadows camera={{ position: [0, 5, 15], fov: 50 }}>
        <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={50} />
        <OrbitControls autoRotate autoRotateSpeed={2} enableZoom enablePan />

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <pointLight position={[-10, 10, -10]} intensity={0.8} />

        {/* Environment */}
        <fog attach="fog" args={['#0a0a1a', 5, 50]} />

        {/* Ground */}
        <Ground />

        {/* Falling balls */}
        {Array.from({ length: ballCount }).map((_, i) => (
          <PhysicsBall
            key={i}
            position={[Math.random() * 8 - 4, 10 + Math.random() * 8, Math.random() * 8 - 4]}
            radius={0.4 + Math.random() * 0.4}
          />
        ))}

        {/* Background */}
        <color attach="background" args={['#0a0a1a']} />
      </Canvas>
    </PhysicsWorld>
  )
}

export function Physics3DBallsSimulator() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#0a0a1a' }}>
      <Physics3DScene />

      {/* Info overlay */}
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
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#60a5fa', fontWeight: '700' }}>🎱 3D Physics Balls</h3>
        <p style={{ margin: '0', fontSize: '12px', color: '#888' }}>Drag to rotate • Scroll to zoom • Watch physics unfold</p>
      </div>

      {/* Back button placeholder - will be added by parent page */}
    </div>
  )
}
