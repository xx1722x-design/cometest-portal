import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'

type ElementType = 'laser' | 'flatGlass' | 'prism' | 'convexLens' | 'concaveLens' | 'concaveMirror' | 'convexMirror'

interface CanvasElement {
  id: string
  type: Exclude<ElementType, 'laser'>
  position: [number, number, number]
  rotation: [number, number, number]
}

interface DragState {
  isDraggingFromPalette: boolean
  paletteItemType: Exclude<ElementType, 'laser'> | null
  canvasElementId: string | null
  isRotating: boolean
  startPos: [number, number]
}

const CANVAS_WIDTH = 50
const CANVAS_HEIGHT = 40
const SPAWN_Y = 5

function LaserCanvas({ elements, onElementsChange }: { elements: CanvasElement[]; onElementsChange: (els: CanvasElement[]) => void }) {
  const { camera, scene, gl } = useThree()
  const raycasterRef = useRef(new THREE.Raycaster())
  const dragStateRef = useRef<DragState>({
    isDraggingFromPalette: false,
    paletteItemType: null,
    canvasElementId: null,
    isRotating: false,
    startPos: [0, 0],
  })
  const elementsRef = useRef<{ [key: string]: THREE.Mesh }>({})
  const laserPosRef = useRef({ x: -CANVAS_WIDTH / 2 + 5, y: 0, angle: 0 })

  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.position.z = 40
      camera.left = -CANVAS_WIDTH / 2
      camera.right = CANVAS_WIDTH / 2
      camera.top = CANVAS_HEIGHT / 2
      camera.bottom = -CANVAS_HEIGHT / 2
      camera.updateProjectionMatrix()
    }

    const handleGlobalMouseDown = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const mouse = new THREE.Vector2(x * 2 - 1, -(y * 2 - 1))
      raycasterRef.current.setFromCamera(mouse, camera)

      if (e.button === 2) {
        // Right-click: start rotation
        const objectsToTest = Object.values(elementsRef.current)
        const intersects = raycasterRef.current.intersectObjects(objectsToTest)
        if (intersects.length > 0) {
          dragStateRef.current = {
            isDraggingFromPalette: false,
            paletteItemType: null,
            canvasElementId: (intersects[0].object as any).userData.elementId,
            isRotating: true,
            startPos: [e.clientX, e.clientY],
          }
        }
      } else if (e.button === 0) {
        // Left-click: check for canvas element drag
        const objectsToTest = Object.values(elementsRef.current)
        const intersects = raycasterRef.current.intersectObjects(objectsToTest)
        if (intersects.length > 0) {
          dragStateRef.current = {
            isDraggingFromPalette: false,
            paletteItemType: null,
            canvasElementId: (intersects[0].object as any).userData.elementId,
            isRotating: false,
            startPos: [e.clientX, e.clientY],
          }
        }
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.canvasElementId) return

      const deltaX = (e.clientX - dragStateRef.current.startPos[0]) * 0.02
      const deltaY = (e.clientY - dragStateRef.current.startPos[1]) * 0.02

      const elementId = dragStateRef.current.canvasElementId
      onElementsChange(
        elements.map((el) => {
          if (el.id === elementId) {
            if (dragStateRef.current.isRotating) {
              return {
                ...el,
                rotation: [
                  el.rotation[0],
                  el.rotation[1],
                  el.rotation[2] + deltaX * 0.1,
                ],
              }
            } else {
              return {
                ...el,
                position: [
                  el.position[0] + deltaX,
                  el.position[1] - deltaY,
                  el.position[2],
                ],
              }
            }
          }
          return el
        })
      )

      dragStateRef.current.startPos = [e.clientX, e.clientY]
    }

    const handleGlobalMouseUp = () => {
      if (dragStateRef.current.canvasElementId) {
        const element = elements.find((e) => e.id === dragStateRef.current.canvasElementId)
        if (element && (Math.abs(element.position[0]) > CANVAS_WIDTH / 2 || Math.abs(element.position[1]) > CANVAS_HEIGHT / 2)) {
          onElementsChange(elements.filter((e) => e.id !== dragStateRef.current.canvasElementId))
        }
      }
      dragStateRef.current = {
        isDraggingFromPalette: false,
        paletteItemType: null,
        canvasElementId: null,
        isRotating: false,
        startPos: [0, 0],
      }
    }

    gl.domElement.addEventListener('mousedown', handleGlobalMouseDown)
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    gl.domElement.addEventListener('contextmenu', (e) => e.preventDefault())

    return () => {
      gl.domElement.removeEventListener('mousedown', handleGlobalMouseDown)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [elements, onElementsChange, camera, gl])

  const getLaserRay = () => {
    const start = new THREE.Vector3(laserPosRef.current.x, laserPosRef.current.y, 0)
    const direction = new THREE.Vector3(Math.cos(laserPosRef.current.angle), Math.sin(laserPosRef.current.angle), 0)
    const end = start.clone().add(direction.clone().multiplyScalar(100))
    return { start, end }
  }

  const ray = getLaserRay()

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.7} color={0xffffff} />
      <directionalLight position={[25, 25, 25]} intensity={1.3} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[-25, -25, 20]} intensity={0.5} color={0x4a9eff} />

      {/* Background */}
      <mesh position={[0, 0, -1]} receiveShadow>
        <planeGeometry args={[CANVAS_WIDTH + 10, CANVAS_HEIGHT + 10]} />
        <meshStandardMaterial color={0x0d1b2a} roughness={0.95} metalness={0} />
      </mesh>

      {/* Grid */}
      <gridHelper args={[CANVAS_WIDTH, CANVAS_HEIGHT, 0x2a4a6a, 0x1a3a5a]} position={[0, 0, 0.01]} />

      {/* Laser Emitter */}
      <group position={[laserPosRef.current.x, laserPosRef.current.y, 0.8]} rotation={[0, 0, laserPosRef.current.angle]} castShadow>
        <mesh castShadow>
          <boxGeometry args={[1.5, 0.6, 0.5]} />
          <meshStandardMaterial color={0xff3333} emissive={0xff1111} emissiveIntensity={2} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[1, 0, 0]} castShadow>
          <sphereGeometry args={[0.4, 20, 20]} />
          <meshStandardMaterial color={0xffdd00} emissive={0xffbb00} emissiveIntensity={4} metalness={0.9} roughness={0.1} toneMapped={false} />
        </mesh>
      </group>

      {/* Spawned Elements */}
      {elements.map((elem) => (
        <group key={elem.id} position={elem.position} rotation={elem.rotation} castShadow receiveShadow>
          <ElementMesh
            element={elem}
            ref={(mesh: THREE.Mesh) => {
              if (mesh) elementsRef.current[elem.id] = mesh
            }}
          />
        </group>
      ))}

      {/* Infinite Laser Ray */}
      <lineSegments position={ray.start}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([0, 0, 0, ray.end.x - ray.start.x, ray.end.y - ray.start.y, 0])} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color={0xff0000} linewidth={4} toneMapped={false} fog={false} />
      </lineSegments>
    </>
  )
}

const ElementMesh = React.forwardRef<THREE.Mesh, { element: CanvasElement }>(({ element }, ref) => {
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData.elementId = element.id
    }
  }, [element.id])

  const getGeometry = () => {
    const s = 1.8
    switch (element.type) {
      case 'flatGlass':
        return <boxGeometry args={[2.5 * s, 4 * s, 1.2 * s]} />
      case 'prism':
        return <tetrahedronGeometry args={[1.5 * s, 2]} />
      case 'convexLens':
        return <sphereGeometry args={[1.3 * s, 28, 28]} />
      case 'concaveLens':
        return <octahedronGeometry args={[1.2 * s, 3]} />
      case 'convexMirror':
        return <sphereGeometry args={[1.5 * s, 24, 24]} />
      case 'concaveMirror':
        return <sphereGeometry args={[1.5 * s, 24, 24]} />
      default:
        return <boxGeometry args={[1, 1, 1]} />
    }
  }

  const getMaterialProps = () => {
    switch (element.type) {
      case 'flatGlass':
      case 'convexLens':
      case 'concaveLens':
        return { color: 0x4a9eff, transparent: true, opacity: 0.75, metalness: 0.3, roughness: 0.4, emissive: 0x1a3a5a, emissiveIntensity: 0.2 }
      case 'prism':
        return { color: 0x7b68ee, transparent: true, opacity: 0.8, metalness: 0.4, roughness: 0.3, emissive: 0x3a2a6a, emissiveIntensity: 0.2 }
      case 'convexMirror':
      case 'concaveMirror':
        return { color: 0xdddddd, metalness: 0.95, roughness: 0.08, emissive: 0x444444, emissiveIntensity: 0.1 }
      default:
        return { color: 0x888888 }
    }
  }

  const matProps = getMaterialProps()

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {getGeometry()}
      <meshStandardMaterial {...matProps} />
    </mesh>
  )
})

ElementMesh.displayName = 'ElementMesh'

export function LightRefractionLab() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [elements, setElements] = useState<CanvasElement[]>([])
  const paletteStartRef = useRef<[number, number] | null>(null)

  const opticalTools = [
    { id: 'flatGlass', label: t('optical_flat_glass'), icon: '📦', color: '#4a9eff' },
    { id: 'prism', label: t('optical_prism'), icon: '🔺', color: '#7b68ee' },
    { id: 'convexLens', label: t('optical_convex_lens'), icon: '◯', color: '#4a9eff' },
    { id: 'concaveLens', label: t('optical_concave_lens'), icon: '⊘', color: '#4a9eff' },
    { id: 'concaveMirror', label: t('optical_concave_mirror'), icon: '⌢', color: '#cccccc' },
    { id: 'convexMirror', label: t('optical_convex_mirror'), icon: '⌣', color: '#cccccc' },
  ] as const

  const handlePaletteMouseDown = (type: Exclude<ElementType, 'laser'>, e: React.MouseEvent) => {
    paletteStartRef.current = [e.clientX, e.clientY]
  }

  const handlePaletteMouseUp = (type: Exclude<ElementType, 'laser'>, e: React.MouseEvent) => {
    if (!paletteStartRef.current) return

    const distance = Math.sqrt(
      Math.pow(e.clientX - paletteStartRef.current[0], 2) + Math.pow(e.clientY - paletteStartRef.current[1], 2)
    )

    if (distance > 50) {
      const newElement: CanvasElement = {
        id: `${type}-${Date.now()}`,
        type,
        position: [0, SPAWN_Y, 0.5],
        rotation: [0, 0, Math.random() * Math.PI * 2],
      }
      setElements((prev) => [...prev, newElement])
    }

    paletteStartRef.current = null
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#0a0a1a', display: 'flex', flexDirection: 'column' }}>
      {/* Canvas Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas orthographic camera={{ position: [0, 0, 40], zoom: 1 }} style={{ width: '100%', height: '100%' }}>
          <LaserCanvas elements={elements} onElementsChange={setElements} />
        </Canvas>

        {/* Info Panel */}
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
            maxWidth: '360px',
            fontSize: '13px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(74, 158, 255, 0.25)',
            zIndex: 100,
          }}
        >
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '16px', color: '#66ccff', fontWeight: '700' }}>💡 {t('light_refraction_title')}</h2>
          <p style={{ margin: '0 0 1rem 0', fontSize: '12px', color: '#aaa', lineHeight: 1.6 }}>{t('light_refraction_content')}</p>
          <div style={{ marginTop: '1rem', fontSize: '11px', color: '#888', lineHeight: '1.8', borderTop: '1px solid #2a4a6a', paddingTop: '1rem' }}>
            <div>🎯 Drag from palette to spawn</div>
            <div>🖱️ Left-drag to move elements</div>
            <div>↻ Right-drag to rotate</div>
            <div>⛔ Drag off-screen to delete</div>
          </div>
        </div>

        {/* Back Button */}
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

      {/* Bottom Palette */}
      <div
        style={{
          background: 'rgba(10, 10, 26, 0.98)',
          border: '2px solid #4a9eff',
          borderBottom: 'none',
          borderRadius: '16px 16px 0 0',
          padding: '1.5rem',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 -8px 32px rgba(74, 158, 255, 0.3)',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          zIndex: 50,
        }}
      >
        {opticalTools.map((tool) => (
          <div
            key={tool.id}
            onMouseDown={(e) => handlePaletteMouseDown(tool.id as Exclude<ElementType, 'laser'>, e)}
            onMouseUp={(e) => handlePaletteMouseUp(tool.id as Exclude<ElementType, 'laser'>, e)}
            onMouseLeave={(e) => (paletteStartRef.current = null)}
            style={{
              padding: '0.8rem 1.2rem',
              background: '#1a2a3a',
              border: `2px solid ${tool.color}`,
              borderRadius: '10px',
              color: '#fff',
              cursor: 'grab',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tool.color
              e.currentTarget.style.color = '#000'
              e.currentTarget.style.boxShadow = `0 0 16px ${tool.color}80`
              e.currentTarget.style.transform = 'scale(1.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1a2a3a'
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <span style={{ fontSize: '16px' }}>{tool.icon}</span>
            <span>{tool.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
