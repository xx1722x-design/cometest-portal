import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'

type ElementType = 'laser' | 'flatGlass' | 'prism' | 'convexLens' | 'concaveLens' | 'concaveMirror' | 'convexMirror'

interface SpawnedElement {
  id: string
  type: Exclude<ElementType, 'laser'>
  position: [number, number, number]
  rotation: [number, number, number]
}

interface DragState {
  elementId: string | null
  startPos: [number, number] | null
}

function LaserScene({ laser, spawned, onElementDrag }: { laser: { position: [number, number]; rotation: number }; spawned: SpawnedElement[]; onElementDrag: (id: string, delta: [number, number]) => void }) {
  const { camera, scene } = useThree()
  const raycasterRef = useRef(new THREE.Raycaster())
  const dragStateRef = useRef<DragState>({ elementId: null, startPos: null })
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const dragPointRef = useRef(new THREE.Vector3())
  const elementsRef = useRef<{ [key: string]: THREE.Mesh }>({})

  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.position.z = 30
      const width = 40
      const height = 30
      camera.left = -width / 2
      camera.right = width / 2
      camera.top = height / 2
      camera.bottom = -height / 2
      camera.updateProjectionMatrix()
    }
  }, [camera])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return

    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    const mouse = new THREE.Vector2(x * 2 - 1, -(y * 2 - 1))
    raycasterRef.current.setFromCamera(mouse, camera)

    const objectsToTest = Object.values(elementsRef.current)
    const intersects = raycasterRef.current.intersectObjects(objectsToTest)

    if (intersects.length > 0) {
      const hitElement = intersects[0].object
      const elementId = (hitElement.userData as any).elementId
      dragStateRef.current = {
        elementId,
        startPos: [e.clientX, e.clientY],
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStateRef.current.elementId || !dragStateRef.current.startPos) return

    const deltaX = (e.clientX - dragStateRef.current.startPos[0]) * 0.01
    const deltaY = (e.clientY - dragStateRef.current.startPos[1]) * 0.01

    onElementDrag(dragStateRef.current.elementId, [deltaX, -deltaY])
    dragStateRef.current.startPos = [e.clientX, e.clientY]
  }

  const handleMouseUp = () => {
    dragStateRef.current = { elementId: null, startPos: null }
  }

  const calculateRays = () => {
    const rays: Array<{ start: THREE.Vector3; end: THREE.Vector3; color: number }> = []
    const laserDir = new THREE.Vector3(Math.cos(laser.rotation), Math.sin(laser.rotation), 0)
    const laserPos = new THREE.Vector3(laser.position[0], laser.position[1], 0)

    const start = laserPos.clone()
    const end = start.clone().add(laserDir.clone().multiplyScalar(25))
    rays.push({ start, end, color: 0xff0000 })

    return rays
  }

  const rays = calculateRays()

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} color={0xffffff} />
      <directionalLight position={[15, 15, 20]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[-15, -15, 15]} intensity={0.4} color={0x4a9eff} />

      {/* Background plane */}
      <mesh position={[0, 0, -1]} receiveShadow>
        <planeGeometry args={[50, 40]} />
        <meshStandardMaterial color={0x0d1b2a} roughness={0.9} metalness={0} />
      </mesh>

      {/* Grid */}
      <gridHelper args={[40, 40, 0x2a4a6a, 0x1a3a5a]} position={[0, 0, 0.01]} />

      {/* Laser emitter */}
      <group position={[laser.position[0], laser.position[1], 0.5]} rotation={[0, 0, laser.rotation]} castShadow>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.5, 0.4]} />
          <meshStandardMaterial color={0xff4444} emissive={0xff2222} emissiveIntensity={1.5} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.8, 0, 0]} castShadow>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color={0xffdd00} emissive={0xffaa00} emissiveIntensity={3} metalness={0.8} roughness={0.2} toneMapped={false} />
        </mesh>
      </group>

      {/* Spawned optical elements */}
      {spawned.map((elem) => (
        <OpticalElementMesh
          key={elem.id}
          element={elem}
          ref={(mesh: THREE.Mesh) => {
            if (mesh) elementsRef.current[elem.id] = mesh
          }}
        />
      ))}

      {/* Laser rays - with neon glow */}
      {rays.map((ray, idx) => (
        <lineSegments key={idx} position={ray.start}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([0, 0, 0, ray.end.x - ray.start.x, ray.end.y - ray.start.y, ray.end.z - ray.start.z])} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color={ray.color} linewidth={3} toneMapped={false} fog={false} />
        </lineSegments>
      ))}

      {/* Invisible drag plane for interaction */}
      <mesh position={[0, 0, 0]} onPointerDown={(e: any) => handleMouseDown(e.nativeEvent)} onPointerMove={(e: any) => handleMouseMove(e.nativeEvent)} onPointerUp={(e: any) => handleMouseUp()} onPointerLeave={(e: any) => handleMouseUp()}>
        <planeGeometry args={[50, 40]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  )
}

const OpticalElementMesh = React.forwardRef<
  THREE.Mesh,
  { element: SpawnedElement }
>(({ element }, ref) => {
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData.elementId = element.id
    }
  }, [element.id])

  const getGeometry = () => {
    const scale = 1.5
    switch (element.type) {
      case 'flatGlass':
        return <boxGeometry args={[2 * scale, 3 * scale, 0.5 * scale]} />
      case 'prism':
        return <coneGeometry args={[1 * scale, 2.5 * scale, 3]} />
      case 'convexLens':
        return <sphereGeometry args={[1 * scale, 24, 24]} />
      case 'concaveLens':
        return <icosahedronGeometry args={[1 * scale, 3]} />
      case 'convexMirror':
        return <sphereGeometry args={[1.2 * scale, 20, 20]} />
      case 'concaveMirror':
        return <sphereGeometry args={[1.2 * scale, 20, 20]} />
      default:
        return <boxGeometry args={[1, 1, 0.5]} />
    }
  }

  const getColor = () => {
    switch (element.type) {
      case 'flatGlass':
      case 'convexLens':
      case 'concaveLens':
        return 0x4a9eff
      case 'prism':
        return 0x7b68ee
      case 'convexMirror':
      case 'concaveMirror':
        return 0xcccccc
      default:
        return 0x888888
    }
  }

  const isMirror = element.type.includes('Mirror')

  return (
    <mesh ref={ref} position={element.position} rotation={element.rotation} castShadow receiveShadow>
      {getGeometry()}
      <meshStandardMaterial
        color={getColor()}
        transparent
        opacity={isMirror ? 0.95 : 0.8}
        metalness={isMirror ? 0.95 : 0.4}
        roughness={isMirror ? 0.05 : 0.5}
        emissive={isMirror ? 0x444444 : 0x1a2a3a}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
})

OpticalElementMesh.displayName = 'OpticalElementMesh'

export function LightRefractionLab() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [laser, setLaser] = useState({ position: [-15, 0] as [number, number], rotation: 0 })
  const [spawned, setSpawned] = useState<SpawnedElement[]>([])

  const handleSpawnElement = (type: Exclude<ElementType, 'laser'>) => {
    const newElement: SpawnedElement = {
      id: `${type}-${Date.now()}`,
      type,
      position: [0, 0, 0.5],
      rotation: [0, 0, 0],
    }
    setSpawned((prev) => [...prev, newElement])
  }

  const handleElementDrag = (id: string, delta: [number, number]) => {
    setSpawned((prev) =>
      prev.map((elem) =>
        elem.id === id
          ? {
              ...elem,
              position: [elem.position[0] + delta[0], elem.position[1] + delta[1], elem.position[2]],
            }
          : elem
      )
    )
  }

  const opticalTools = [
    { id: 'flatGlass', label: t('optical_flat_glass'), icon: '📦', color: '#4a9eff' },
    { id: 'prism', label: t('optical_prism'), icon: '🔺', color: '#7b68ee' },
    { id: 'convexLens', label: t('optical_convex_lens'), icon: '◯', color: '#4a9eff' },
    { id: 'concaveLens', label: t('optical_concave_lens'), icon: '⊘', color: '#4a9eff' },
    { id: 'concaveMirror', label: t('optical_concave_mirror'), icon: '⌢', color: '#cccccc' },
    { id: 'convexMirror', label: t('optical_convex_mirror'), icon: '⌣', color: '#cccccc' },
  ] as const

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#0a0a1a', display: 'flex', overflow: 'hidden' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas orthographic camera={{ position: [0, 0, 30], zoom: 1 }} style={{ width: '100%', height: '100%' }}>
          <LaserScene laser={laser} spawned={spawned} onElementDrag={handleElementDrag} />
        </Canvas>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          background: 'rgba(10, 10, 26, 0.97)',
          border: '2px solid #4a9eff',
          borderRadius: '12px',
          padding: '1.5rem',
          color: '#fff',
          fontFamily: "'Segoe UI', sans-serif",
          maxWidth: '340px',
          fontSize: '13px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(74, 158, 255, 0.25)',
          zIndex: 100,
        }}
      >
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '16px', color: '#66ccff', fontWeight: '700' }}>💡 {t('light_refraction_title')}</h2>
        <p style={{ margin: '0 0 1rem 0', fontSize: '12px', color: '#aaa' }}>{t('light_refraction_content')}</p>
        <div style={{ marginTop: '1rem', fontSize: '11px', color: '#888', lineHeight: '1.8', borderTop: '1px solid #2a4a6a', paddingTop: '1rem' }}>
          <div>🖱️ {t('left_drag')}</div>
          <div>📦 Click element buttons to spawn</div>
          <div>🎯 Drag spawned objects freely</div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10, 10, 26, 0.98)',
          border: '2px solid #4a9eff',
          borderRadius: '16px',
          padding: '1.25rem',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(74, 158, 255, 0.3)',
          zIndex: 100,
          maxWidth: '90vw',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {opticalTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleSpawnElement(tool.id as Exclude<ElementType, 'laser'>)}
              style={{
                padding: '0.7rem 1.1rem',
                background: '#1a2a3a',
                border: `2px solid ${tool.color}`,
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tool.color
                e.currentTarget.style.color = '#000'
                e.currentTarget.style.boxShadow = `0 0 16px ${tool.color}80`
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a2a3a'
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <span style={{ fontSize: '14px' }}>{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => navigate('/optics')}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 100,
          padding: '0.75rem 1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {t('back_button')}
      </button>
    </div>
  )
}
