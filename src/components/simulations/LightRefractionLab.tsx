import React, { useRef, useState, useCallback } from 'react'
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
  isDragging: boolean
  isRotating: boolean
  startMouse: [number, number]
}

function OpticsScene({ elements, onElementsChange }: { elements: SpawnedElement[]; onElementsChange: (els: SpawnedElement[]) => void }) {
  const { camera, gl } = useThree()
  const raycasterRef = useRef(new THREE.Raycaster())
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const dragPointRef = useRef(new THREE.Vector3())
  const dragStateRef = useRef<DragState>({ elementId: null, isDragging: false, isRotating: false, startMouse: [0, 0] })
  const meshesRef = useRef<{ [key: string]: THREE.Mesh }>({})

  React.useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.position.z = 40
      camera.left = -25
      camera.right = 25
      camera.top = 20
      camera.bottom = -20
      camera.updateProjectionMatrix()
    }
  }, [camera])

  const worldToNDC = (clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 2 - 1
    const y = -((clientY - rect.top) / rect.height) * 2 + 1
    return new THREE.Vector2(x, y)
  }

  const handleCanvasMouseDown = (e: any) => {
    const ndc = worldToNDC(e.clientX || e.nativeEvent.clientX, e.clientY || e.nativeEvent.clientY)
    raycasterRef.current.setFromCamera(ndc, camera)

    const meshes = Object.values(meshesRef.current)
    const hits = raycasterRef.current.intersectObjects(meshes)

    if (hits.length > 0) {
      const hitMesh = hits[0].object as any
      const button = e.button || (e.nativeEvent?.button ?? 0)
      dragStateRef.current = {
        elementId: hitMesh.userData.elementId,
        isDragging: button === 0,
        isRotating: button === 2,
        startMouse: [e.clientX || e.nativeEvent.clientX, e.clientY || e.nativeEvent.clientY],
      }
    }
  }

  const handleCanvasMouseMove = (e: any) => {
    if (!dragStateRef.current.elementId) return

    const clientX = e.clientX || e.nativeEvent?.clientX || 0
    const clientY = e.clientY || e.nativeEvent?.clientY || 0
    const ndc = worldToNDC(clientX, clientY)
    raycasterRef.current.setFromCamera(ndc, camera)
    raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, dragPointRef.current)

    const deltaX = clientX - dragStateRef.current.startMouse[0]
    const deltaY = clientY - dragStateRef.current.startMouse[1]

    onElementsChange(
      elements.map((el) => {
        if (el.id === dragStateRef.current.elementId) {
          if (dragStateRef.current.isDragging) {
            return {
              ...el,
              position: [
                el.position[0] + deltaX * 0.02,
                el.position[1] - deltaY * 0.02,
                el.position[2],
              ],
            }
          } else if (dragStateRef.current.isRotating) {
            return {
              ...el,
              rotation: [el.rotation[0], el.rotation[1], el.rotation[2] + deltaX * 0.02],
            }
          }
        }
        return el
      })
    )

    dragStateRef.current.startMouse = [clientX, clientY]
  }

  const handleCanvasMouseUp = () => {
    dragStateRef.current = { elementId: null, isDragging: false, isRotating: false, startMouse: [0, 0] }
  }

  return (
    <mesh
      onPointerDown={handleCanvasMouseDown}
      onPointerMove={handleCanvasMouseMove}
      onPointerUp={handleCanvasMouseUp}
      onPointerLeave={handleCanvasMouseUp}
    >
      <planeGeometry args={[50, 40]} />
      <meshBasicMaterial transparent opacity={0} />

      <ambientLight intensity={0.8} />
      <directionalLight position={[30, 30, 30]} intensity={1.5} castShadow />
      <pointLight position={[-20, -20, 20]} intensity={0.6} color={0x4a9eff} />

      <mesh position={[0, 0, -1]} receiveShadow>
        <planeGeometry args={[60, 50]} />
        <meshStandardMaterial color={0x0d1b2a} roughness={0.95} />
      </mesh>

      <gridHelper args={[50, 50, 0x2a4a6a, 0x1a3a5a]} position={[0, 0, 0.01]} />

      {/* Laser emitter */}
      <group position={[-20, 0, 0.8]} castShadow>
        <mesh castShadow>
          <boxGeometry args={[1.5, 0.6, 0.5]} />
          <meshStandardMaterial color={0xff3333} emissive={0xff0000} emissiveIntensity={3} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[1, 0, 0]} castShadow>
          <sphereGeometry args={[0.45, 24, 24]} />
          <meshStandardMaterial color={0xffdd00} emissive={0xffaa00} emissiveIntensity={5} metalness={0.95} roughness={0.05} toneMapped={false} />
        </mesh>
      </group>

      {/* Laser ray */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([-20, 0, 0, 20, 0, 0])} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color={0xff0000} linewidth={4} toneMapped={false} />
      </line>

      {/* Spawned elements */}
      {elements.map((el) => (
        <group key={el.id} position={el.position} rotation={el.rotation} castShadow receiveShadow>
          <ElementMesh
            element={el}
            ref={(mesh: THREE.Mesh) => {
              if (mesh && mesh.userData.elementId !== el.id) {
                mesh.userData.elementId = el.id
                meshesRef.current[el.id] = mesh
              }
            }}
          />
        </group>
      ))}
    </mesh>
  )
}

const ElementMesh = React.forwardRef<THREE.Mesh, { element: SpawnedElement }>(({ element }, ref) => {
  const meshRef = useRef<THREE.Mesh>(null)

  const getProps = () => {
    const s = 2
    switch (element.type) {
      case 'flatGlass':
        return {
          geometry: <boxGeometry args={[2.5 * s, 4 * s, 1 * s]} />,
          color: 0x4a9eff,
          opacity: 0.7,
          metalness: 0.3,
          roughness: 0.4,
        }
      case 'prism':
        return {
          geometry: <coneGeometry args={[1.5 * s, 2.5 * s, 3]} />,
          color: 0x7b68ee,
          opacity: 0.75,
          metalness: 0.4,
          roughness: 0.3,
        }
      case 'convexLens':
        return {
          geometry: <sphereGeometry args={[1.3 * s, 32, 32]} />,
          color: 0x4a9eff,
          opacity: 0.75,
          metalness: 0.3,
          roughness: 0.4,
        }
      case 'concaveLens':
        return {
          geometry: <octahedronGeometry args={[1.2 * s, 2]} />,
          color: 0x4a9eff,
          opacity: 0.75,
          metalness: 0.3,
          roughness: 0.4,
        }
      case 'convexMirror':
        return {
          geometry: <sphereGeometry args={[1.5 * s, 28, 28]} />,
          color: 0xdddddd,
          opacity: 1,
          metalness: 0.98,
          roughness: 0.05,
        }
      case 'concaveMirror':
        return {
          geometry: <sphereGeometry args={[1.5 * s, 28, 28]} />,
          color: 0xdddddd,
          opacity: 1,
          metalness: 0.98,
          roughness: 0.05,
        }
      default:
        return {
          geometry: <boxGeometry args={[1, 1, 1]} />,
          color: 0x888888,
          opacity: 1,
          metalness: 0.5,
          roughness: 0.5,
        }
    }
  }

  const props = getProps()

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {props.geometry}
      <meshStandardMaterial
        color={props.color}
        transparent
        opacity={props.opacity}
        metalness={props.metalness}
        roughness={props.roughness}
        emissive={0x1a2a3a}
        emissiveIntensity={0.2}
      />
    </mesh>
  )
})

ElementMesh.displayName = 'ElementMesh'

export function LightRefractionLab() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [elements, setElements] = useState<SpawnedElement[]>([])
  const canvasRef = useRef<HTMLDivElement>(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const targetRef = useRef(new THREE.Vector3())

  const opticalTools = [
    { id: 'flatGlass', label: t('optical_flat_glass'), icon: '📦' },
    { id: 'prism', label: t('optical_prism'), icon: '🔺' },
    { id: 'convexLens', label: t('optical_convex_lens'), icon: '◯' },
    { id: 'concaveLens', label: t('optical_concave_lens'), icon: '⊘' },
    { id: 'concaveMirror', label: t('optical_concave_mirror'), icon: '⌢' },
    { id: 'convexMirror', label: t('optical_convex_mirror'), icon: '⌣' },
  ]

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('elementType', type)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!canvasRef.current) return

    const type = e.dataTransfer.getData('elementType') as Exclude<ElementType, 'laser'>
    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.clientX - rect.left
    const clientY = e.clientY - rect.top

    const x = (clientX / rect.width) * 2 - 1
    const y = -(clientY / rect.height) * 2 + 1

    // Note: We'll spawn at center since we can't access the camera directly here
    const newElement: SpawnedElement = {
      id: `${type}-${Date.now()}`,
      type,
      position: [0, 0, 0.5],
      rotation: [0, 0, Math.random() * Math.PI * 2],
    }
    setElements((prev) => [...prev, newElement])
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#0a0a1a', display: 'flex', flexDirection: 'column' }}>
      <div
        ref={canvasRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ flex: 1, position: 'relative' }}
      >
        <Canvas orthographic camera={{ position: [0, 0, 40], zoom: 1 }} style={{ width: '100%', height: '100%' }}>
          <OpticsScene elements={elements} onElementsChange={setElements} />
        </Canvas>

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
            zIndex: 100,
          }}
        >
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '16px', color: '#66ccff', fontWeight: '700' }}>💡 {t('light_refraction_title')}</h2>
          <p style={{ margin: '0 0 1rem 0', fontSize: '12px', color: '#aaa' }}>{t('light_refraction_content')}</p>
          <div style={{ fontSize: '11px', color: '#888', lineHeight: '1.8', borderTop: '1px solid #2a4a6a', paddingTop: '1rem' }}>
            <div>🎯 Drag lenses from palette onto canvas</div>
            <div>🖱️ Left-drag to move</div>
            <div>↻ Right-drag to rotate 360°</div>
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
          }}
        >
          {t('back_button')}
        </button>
      </div>

      <div
        style={{
          background: 'rgba(10, 10, 26, 0.98)',
          border: '2px solid #4a9eff',
          borderBottom: 'none',
          borderRadius: '16px 16px 0 0',
          padding: '1rem',
          display: 'flex',
          gap: '0.8rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          zIndex: 50,
        }}
      >
        {opticalTools.map((tool) => (
          <div
            key={tool.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tool.id)}
            style={{
              padding: '0.7rem 1rem',
              background: '#1a2a3a',
              border: '2px solid #4a9eff',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'grab',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              userSelect: 'none',
            }}
          >
            <span style={{ fontSize: '16px' }}>{tool.icon}</span>
            {tool.label}
          </div>
        ))}
      </div>
    </div>
  )
}
