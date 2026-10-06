import React, { Suspense, useRef, ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Sphere } from '@react-three/drei'
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

// Physics world (shared across components)
const world = new CANNON.World()
world.gravity.set(0, -30, 0)
world.defaultContactMaterial.friction = 0.3
world.defaultContactMaterial.restitution = 0.6

// Blocks component with physics
function PhysicsBlocksTower() {
  const { camera, raycaster, mouse, scene } = useThree()
  const blockRefs = useRef<Array<{ mesh: THREE.Mesh; body: CANNON.Body }>>([])
  const ballRef = useRef<{ mesh: THREE.Mesh; body: CANNON.Body } | null>(null)
  const isDragging = useRef(false)
  const draggedBlock = useRef<{ mesh: THREE.Mesh; body: CANNON.Body } | null>(null)

  // Initialize physics blocks tower
  React.useEffect(() => {
    // Create tower of blocks
    const colors = [0xff0080, 0x00ff88, 0x00ffff, 0xffff00, 0xff6600, 0xff00ff, 0x00ff00]
    let blockCount = 0

    for (let level = 0; level < 6; level++) {
      const blockCount_ = 5 - Math.floor(level * 0.8)
      for (let i = 0; i < blockCount_; i++) {
        const x = (i - blockCount_ / 2) * 2
        const y = 2 + level * 2.2
        const z = 0

        const geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8)
        const material = new THREE.MeshStandardMaterial({
          color: colors[blockCount % colors.length],
          metalness: 0.4,
          roughness: 0.3,
          emissive: colors[blockCount % colors.length],
          emissiveIntensity: 0.3,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(x, y, z)
        mesh.castShadow = true
        mesh.receiveShadow = true
        scene.add(mesh)

        // Physics body
        const shape = new CANNON.Box(new CANNON.Vec3(0.9, 0.9, 0.9))
        const body = new CANNON.Body({ mass: 1, shape })
        body.position.set(x, y, z)
        world.addBody(body)

        blockRefs.current.push({ mesh, body })
        blockCount++
      }
    }

    // Ground plane
    const groundShape = new CANNON.Plane()
    const groundBody = new CANNON.Body({ mass: 0, shape: groundShape })
    groundBody.position.set(0, -5, 0)
    const q = new CANNON.Quaternion()
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    groundBody.quaternion = q
    world.addBody(groundBody)

    const groundGeometry = new THREE.PlaneGeometry(50, 50)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.1,
      roughness: 0.8,
    })
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial)
    groundMesh.rotation.x = -Math.PI / 2
    groundMesh.position.y = -5
    groundMesh.receiveShadow = true
    scene.add(groundMesh)

    // Create throwable ball
    const ballGeometry = new THREE.SphereGeometry(0.6, 16, 16)
    const ballMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0080,
      metalness: 0.7,
      roughness: 0.1,
      emissive: 0xff0080,
      emissiveIntensity: 0.5,
    })
    const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial)
    ballMesh.position.set(0, 10, 8)
    ballMesh.castShadow = true
    scene.add(ballMesh)

    const ballShape = new CANNON.Sphere(0.6)
    const ballBody = new CANNON.Body({ mass: 2, shape: ballShape, linearDamping: 0.01 })
    ballBody.position.set(0, 10, 8)
    world.addBody(ballBody)

    ballRef.current = { mesh: ballMesh, body: ballBody }

    // Mouse events for dragging
    const onMouseDown = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, camera)

      const meshes = blockRefs.current.map((b) => b.mesh)
      const intersects = raycaster.intersectObjects(meshes)

      if (intersects.length > 0) {
        isDragging.current = true
        draggedBlock.current = blockRefs.current.find((b) => b.mesh === intersects[0].object) || null
      }
    }

    const onMouseUp = () => {
      isDragging.current = false
      draggedBlock.current = null
    }

    const onMouseMove = (event: MouseEvent) => {
      if (isDragging.current && draggedBlock.current) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        raycaster.setFromCamera(mouse, camera)
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 5)
        const target = new THREE.Vector3()
        raycaster.ray.intersectPlane(plane, target)

        draggedBlock.current.body.position.set(target.x, target.y, target.z)
        draggedBlock.current.body.velocity.set(0, 0, 0)
      }
    }

    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [camera, raycaster, mouse, scene])

  // Physics update loop
  useFrame(() => {
    world.step(1 / 60)

    // Update block positions
    blockRefs.current.forEach(({ mesh, body }) => {
      if (!isDragging.current || draggedBlock.current?.mesh !== mesh) {
        mesh.position.copy(body.position as any)
        mesh.quaternion.copy(body.quaternion as any)
      }
    })

    // Update ball position
    if (ballRef.current) {
      ballRef.current.mesh.position.copy(ballRef.current.body.position as any)
      ballRef.current.mesh.quaternion.copy(ballRef.current.body.quaternion as any)
    }

    // Auto-throw ball if it goes away
    if (ballRef.current && ballRef.current.body.position.y < -10) {
      ballRef.current.body.position.set(0, 10, 8)
      ballRef.current.body.velocity.set(0, -10, -15)
    }
  })

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
      <pointLight position={[-10, 15, 10]} intensity={1} color="#ff0080" />
      <pointLight position={[10, 5, -10]} intensity={0.8} color="#00ffff" />

      <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom enablePan />

      <Environment preset="night" />

      <color attach="background" args={['#0a0a14']} />
      <fog attach="fog" args={['#0a0a14', 5, 50]} />
    </>
  )
}

// Main canvas
function PhysicsBlocksScene() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 8, 15], fov: 50 }}
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
            🎯 Physics Blocks Simulation
          </h3>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#888' }}>
            Drag & destroy - Click blocks to drag them, throw the ball to break the tower
          </p>
          <p style={{ margin: '0', fontSize: '12px', color: '#aaa' }}>
            Cannon.js physics • Neon tower • Interactive destruction
          </p>
        </div>
      </div>
    </ErrorBoundary>
  )
}
