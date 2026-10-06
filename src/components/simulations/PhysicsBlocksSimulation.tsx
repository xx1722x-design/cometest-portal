import React, { Suspense, useRef, ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

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
    console.error('Physics Blocks Error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%', height: '100vh', backgroundColor: '#1a1a2e',
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

// Physics world
const world = new CANNON.World()
world.gravity.set(0, -20, 0)
world.defaultContactMaterial.friction = 0.4
world.defaultContactMaterial.restitution = 0.5

// Blocks component with physics
function PhysicsBlocksTower() {
  const { scene } = useThree()
  const blockRefs = useRef<Array<{ mesh: THREE.Mesh; body: CANNON.Body }>>([])
  const ballRef = useRef<{ mesh: THREE.Mesh; body: CANNON.Body } | null>(null)
  const isDragging = useRef(false)
  const draggedBlock = useRef<{ mesh: THREE.Mesh; body: CANNON.Body } | null>(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())

  // Initialize - ONLY ONCE
  React.useEffect(() => {
    const colors = [0xff0080, 0x00ff88, 0x00ffff, 0xffff00, 0xff6600, 0xff00ff]
    let blockIdx = 0

    // CRITICAL: Space blocks with proper gaps so they don't overlap
    for (let level = 0; level < 5; level++) {
      const blocksPerLevel = 5 - level
      for (let i = 0; i < blocksPerLevel; i++) {
        const x = (i - blocksPerLevel / 2) * 2.2
        const y = 2 + level * 2.5  // SPACED vertically - NO overlap!
        const z = 0

        // Mesh
        const geom = new THREE.BoxGeometry(1.8, 1.8, 1.8)
        const mat = new THREE.MeshStandardMaterial({
          color: colors[blockIdx % colors.length],
          metalness: 0.5,
          roughness: 0.3,
          emissive: colors[blockIdx % colors.length],
          emissiveIntensity: 0.25,
        })
        const mesh = new THREE.Mesh(geom, mat)
        mesh.position.set(x, y, z)
        scene.add(mesh)

        // Physics - SEPARATED, NO OVERLAP
        const shape = new CANNON.Box(new CANNON.Vec3(0.9, 0.9, 0.9))
        const body = new CANNON.Body({ mass: 1, shape, linearDamping: 0.05 })
        body.position.set(x, y, z)
        world.addBody(body)

        blockRefs.current.push({ mesh, body })
        blockIdx++
      }
    }

    // STATIC FLOOR - properly sized
    const floorShape = new CANNON.Box(new CANNON.Vec3(50, 1, 50))
    const floorBody = new CANNON.Body({ mass: 0, shape: floorShape })
    floorBody.position.set(0, -6, 0)
    world.addBody(floorBody)

    const floorGeom = new THREE.BoxGeometry(100, 2, 100)
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e })
    const floorMesh = new THREE.Mesh(floorGeom, floorMat)
    floorMesh.position.set(0, -6, 0)
    scene.add(floorMesh)

    // BALL
    const ballGeom = new THREE.SphereGeometry(0.6, 16, 16)
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xff0080,
      metalness: 0.8,
      roughness: 0.1,
      emissive: 0xff0080,
      emissiveIntensity: 0.6,
    })
    const ballMesh = new THREE.Mesh(ballGeom, ballMat)
    ballMesh.position.set(0, 12, 10)
    scene.add(ballMesh)

    const ballShape = new CANNON.Sphere(0.6)
    const ballBody = new CANNON.Body({ mass: 3, shape: ballShape, linearDamping: 0.02 })
    ballBody.position.set(0, 12, 10)
    world.addBody(ballBody)

    ballRef.current = { mesh: ballMesh, body: ballBody }

    // Mouse events
    const onMouseDown = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1

      const camera = (scene as any).userData.camera
      if (!camera) return

      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const meshes = blockRefs.current.map((b) => b.mesh)
      const intersects = raycasterRef.current.intersectObjects(meshes)

      if (intersects.length > 0) {
        isDragging.current = true
        draggedBlock.current = blockRefs.current.find((b) => b.mesh === intersects[0].object) || null
      }
    }

    const onMouseUp = () => {
      isDragging.current = false
      draggedBlock.current = null
    }

    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [scene])

  // Physics update - NO setState here!
  useFrame((state) => {
    world.step(1 / 60)

    // Update blocks - use ref only, NO state updates
    blockRefs.current.forEach(({ mesh, body }) => {
      if (!isDragging.current || draggedBlock.current?.mesh !== mesh) {
        mesh.position.copy(body.position as any)
        mesh.quaternion.copy(body.quaternion as any)
      }
    })

    // Update ball
    if (ballRef.current) {
      ballRef.current.mesh.position.copy(ballRef.current.body.position as any)
      ballRef.current.mesh.quaternion.copy(ballRef.current.body.quaternion as any)

      // Reset if falls too far
      if (ballRef.current.body.position.y < -20) {
        ballRef.current.body.position.set(0, 12, 10)
        ballRef.current.body.velocity.set(0, -5, -10)
      }
    }

    // Store camera in scene for mouse raycasting
    state.scene.userData.camera = state.camera
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[15, 20, 10]} intensity={1.2} castShadow />
      <pointLight position={[-8, 10, 8]} intensity={1} color="#ff0080" />
      <pointLight position={[8, 5, -8]} intensity={0.8} color="#00ffff" />

      <OrbitControls autoRotate autoRotateSpeed={0.3} enableZoom enablePan target={[0, 2, 0]} />

      <Environment preset="night" />

      <color attach="background" args={['#0a0a14']} />
      <fog attach="fog" args={['#0a0a14', 10, 60]} />
    </>
  )
}

// Main canvas
function PhysicsBlocksScene() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 10, 15], fov: 50 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
    >
      <PhysicsBlocksTower />
    </Canvas>
  )
}

export function PhysicsBlocksSimulation() {
  return (
    <ErrorBoundary>
      <div style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0a0a14',
      }}>
        <Suspense fallback={
          <div style={{
            width: '100%', height: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#0a0a14', color: '#00ffff', fontSize: '18px',
          }}>
            Initializing physics simulation...
          </div>
        }>
          <PhysicsBlocksScene />
        </Suspense>

        {/* Info Panel */}
        <div style={{
          position: 'absolute', top: '20px', left: '20px',
          backgroundColor: 'rgba(10, 10, 20, 0.95)', border: '2px solid #ff0080',
          borderRadius: '12px', padding: '16px 24px', backdropFilter: 'blur(10px)',
          color: '#fff', fontFamily: "'Segoe UI', sans-serif", fontSize: '14px', zIndex: 100,
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.3)',
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#ff0080', fontSize: '16px' }}>
            🎯 Physics Blocks Tower
          </h3>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#888' }}>
            Stable 3D destructible tower with Cannon.js physics
          </p>
          <p style={{ margin: '0', fontSize: '12px', color: '#aaa' }}>
            Click to drag blocks • Ball auto-throws • Interact freely
          </p>
        </div>
      </div>
    </ErrorBoundary>
  )
}
