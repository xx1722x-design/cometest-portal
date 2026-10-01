import React, { useRef, useState, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'

type OpticalElementType = 'flatGlass' | 'prism' | 'convexLens' | 'concaveLens' | 'concaveMirror' | 'convexMirror'
type LaserType = '1-ray' | '2-ray' | '3-ray'

interface Laser {
  id: string
  type: LaserType
  position: [number, number]
  rotation: number
}

interface OpticalElement {
  id: string
  type: OpticalElementType
  position: [number, number]
  rotation: number
  ior: number
}

type SpawnedObject = Laser | OpticalElement

const isLaser = (obj: SpawnedObject): obj is Laser => 'type' in obj && (obj as any).type in { '1-ray': 1, '2-ray': 1, '3-ray': 1 }

// Vector2 helper functions
const v2 = (x: number, y: number) => new THREE.Vector2(x, y)
const v2Rotate = (v: THREE.Vector2, angle: number, center: THREE.Vector2 = v2(0, 0)): THREE.Vector2 => {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const x = v.x - center.x
  const y = v.y - center.y
  return v2(center.x + x * cos - y * sin, center.y + x * sin + y * cos)
}

// Snell's Law refraction
const calculateRefraction = (incidentDir: THREE.Vector2, normal: THREE.Vector2, n1: number, n2: number): THREE.Vector2 | null => {
  const cosI = -normal.dot(incidentDir)
  const ratio = n1 / n2
  const sinT2 = ratio * ratio * (1 - cosI * cosI)
  if (sinT2 > 1) return null
  const cosT = Math.sqrt(1 - sinT2)
  return v2(ratio * incidentDir.x + (ratio * cosI - cosT) * normal.x, ratio * incidentDir.y + (ratio * cosI - cosT) * normal.y).normalize()
}

// Law of reflection
const calculateReflection = (incidentDir: THREE.Vector2, normal: THREE.Vector2): THREE.Vector2 => {
  return incidentDir.clone().sub(normal.clone().multiplyScalar(2 * incidentDir.dot(normal))).normalize()
}

// Ray-segment intersection
const raySegmentIntersection = (rayStart: THREE.Vector2, rayDir: THREE.Vector2, p1: THREE.Vector2, p2: THREE.Vector2) => {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const denom = rayDir.x * dy - rayDir.y * dx
  if (Math.abs(denom) < 0.0001) return null
  const t = ((p1.x - rayStart.x) * dy - (p1.y - rayStart.y) * dx) / denom
  const s = ((p1.x - rayStart.x) * rayDir.y - (p1.y - rayStart.y) * rayDir.x) / denom
  if (t > 0.001 && s >= 0 && s <= 1) {
    return { point: rayStart.clone().add(rayDir.clone().multiplyScalar(t)), t, s }
  }
  return null
}

interface Segment {
  p1: THREE.Vector2
  p2: THREE.Vector2
  normal: THREE.Vector2
  elementId: string
  type: 'refract' | 'reflect'
  ior: number
}

// Build 2D segments from optical elements
const buildSegments = (elements: OpticalElement[]): Segment[] => {
  const segments: Segment[] = []
  const scale = 2

  elements.forEach((el) => {
    const pos = v2(el.position[0], el.position[1])
    const rotate = (x: number, y: number) => v2Rotate(v2(x, y), el.rotation, pos)

    switch (el.type) {
      case 'flatGlass': {
        const h = 2 * scale
        const w = 1.2 * scale
        const p1 = rotate(-w / 2, -h / 2)
        const p2 = rotate(w / 2, -h / 2)
        const p3 = rotate(w / 2, h / 2)
        const p4 = rotate(-w / 2, h / 2)
        const cos = Math.cos(el.rotation)
        const sin = Math.sin(el.rotation)
        segments.push({ p1, p2: p3, normal: v2(sin, -cos), elementId: el.id, type: 'refract', ior: 1.5 })
        segments.push({ p1: p4, p2, normal: v2(-sin, cos), elementId: el.id, type: 'refract', ior: 1.5 })
        break
      }

      case 'prism': {
        const h = 2.5 * scale
        const w = 1.5 * scale
        const p1 = rotate(0, h / 2)
        const p2 = rotate(-w / 2, -h / 2)
        const p3 = rotate(w / 2, -h / 2)
        const n1 = new THREE.Vector2(p2.y - p1.y, p1.x - p2.x).normalize()
        const n2 = new THREE.Vector2(p3.y - p2.y, p2.x - p3.x).normalize()
        const n3 = new THREE.Vector2(p1.y - p3.y, p3.x - p1.x).normalize()
        segments.push({ p1, p2, normal: n1, elementId: el.id, type: 'refract', ior: 1.5 })
        segments.push({ p1: p2, p2: p3, normal: n2, elementId: el.id, type: 'refract', ior: 1.5 })
        segments.push({ p1: p3, p2: p1, normal: n3, elementId: el.id, type: 'refract', ior: 1.5 })
        break
      }

      case 'concaveMirror':
      case 'convexMirror': {
        const r = 1.5 * scale
        for (let i = 0; i < 8; i++) {
          const a1 = (i / 8) * Math.PI
          const a2 = ((i + 1) / 8) * Math.PI
          const p1 = rotate(r * Math.cos(a1), r * Math.sin(a1))
          const p2 = rotate(r * Math.cos(a2), r * Math.sin(a2))
          const midAngle = (a1 + a2) / 2
          let normal = v2(Math.cos(midAngle), Math.sin(midAngle))
          if (el.type === 'convexMirror') normal = normal.multiplyScalar(-1)
          normal = v2Rotate(normal, el.rotation)
          segments.push({ p1, p2, normal, elementId: el.id, type: 'reflect', ior: 1 })
        }
        break
      }

      case 'convexLens':
      case 'concaveLens': {
        const r = 1.3 * scale
        for (let i = 0; i < 8; i++) {
          const a1 = (i / 8) * Math.PI
          const a2 = ((i + 1) / 8) * Math.PI
          const p1 = rotate(r * Math.cos(a1), r * Math.sin(a1))
          const p2 = rotate(r * Math.cos(a2), r * Math.sin(a2))
          const midAngle = (a1 + a2) / 2
          let normal = v2(Math.cos(midAngle), Math.sin(midAngle))
          if (el.type === 'concaveLens') normal = normal.multiplyScalar(-1)
          normal = v2Rotate(normal, el.rotation)
          segments.push({ p1, p2, normal, elementId: el.id, type: 'refract', ior: 1.5 })
        }
        break
      }
    }
  })
  return segments
}

// Raytracing engine
const traceRay = (start: THREE.Vector2, direction: THREE.Vector2, elements: OpticalElement[], maxBounces = 10): THREE.Vector3[] => {
  const path: THREE.Vector3[] = [new THREE.Vector3(start.x, start.y, 0)]
  const segments = buildSegments(elements)

  let ray = { start, dir: direction.normalize(), ior: 1, bounces: 0 }

  while (ray.bounces < maxBounces) {
    let closest: { hit: ReturnType<typeof raySegmentIntersection>; seg: Segment } | null = null
    let closestT = Infinity

    for (const seg of segments) {
      const hit = raySegmentIntersection(ray.start, ray.dir, seg.p1, seg.p2)
      if (hit && hit.t < closestT) {
        closestT = hit.t
        closest = { hit, seg }
      }
    }

    if (!closest || closestT > 100) break

    const point = closest.hit!.point
    path.push(new THREE.Vector3(point.x, point.y, 0))

    if (closest.seg.type === 'reflect') {
      ray = {
        start: point.clone().add(closest.seg.normal.clone().multiplyScalar(0.01)),
        dir: calculateReflection(ray.dir, closest.seg.normal),
        ior: ray.ior,
        bounces: ray.bounces + 1,
      }
    } else {
      const refracted = calculateRefraction(ray.dir, closest.seg.normal, ray.ior, closest.seg.ior)
      if (refracted) {
        ray = {
          start: point.clone().add(refracted.clone().multiplyScalar(0.01)),
          dir: refracted,
          ior: closest.seg.ior,
          bounces: ray.bounces + 1,
        }
      } else {
        // Total internal reflection
        ray = {
          start: point.clone().add(closest.seg.normal.clone().multiplyScalar(0.01)),
          dir: calculateReflection(ray.dir, closest.seg.normal),
          ior: ray.ior,
          bounces: ray.bounces + 1,
        }
      }
    }
  }

  if (path.length > 1) {
    const last = path[path.length - 1]
    const extend = ray.dir.multiplyScalar(50)
    path.push(new THREE.Vector3(last.x + extend.x, last.y + extend.y, last.z))
  }

  return path
}

// Compute all laser paths
const computeLaserPaths = (objects: SpawnedObject[], elements: OpticalElement[]): Map<string, THREE.Vector3[]> => {
  const paths = new Map<string, THREE.Vector3[]>()
  const lasers = objects.filter(isLaser) as Laser[]

  for (const laser of lasers) {
    const rayCount = parseInt(laser.type.split('-')[0])
    const baseDir = v2(Math.cos(laser.rotation), Math.sin(laser.rotation))

    if (rayCount === 1) {
      paths.set(laser.id, traceRay(v2(laser.position[0], laser.position[1]), baseDir, elements))
    } else {
      const angles = rayCount === 2 ? [-0.15, 0.15] : [-0.2, 0, 0.2]
      const pathArray = angles.map((angle) => {
        const dir = v2Rotate(baseDir, angle)
        return traceRay(v2(laser.position[0], laser.position[1]), dir, elements)
      })
      paths.set(laser.id, pathArray.flat())
    }
  }

  return paths
}

function OpticsScene({ objects, elements }: { objects: SpawnedObject[]; elements: OpticalElement[] }) {
  const { camera } = useThree()
  const laserPaths = useMemo(() => computeLaserPaths(objects, elements), [objects, elements])

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

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[30, 30, 30]} intensity={1.5} castShadow />

      <mesh position={[0, 0, -1]} receiveShadow>
        <planeGeometry args={[60, 50]} />
        <meshStandardMaterial color={0x0d1b2a} />
      </mesh>

      <gridHelper args={[50, 50, 0x2a4a6a, 0x1a3a5a]} />

      {/* Render lasers */}
      {objects.filter(isLaser).map((laser) => (
        <group key={laser.id} position={[laser.position[0], laser.position[1], 0.5]}>
          <mesh castShadow>
            <boxGeometry args={[1, 0.4, 0.3]} />
            <meshStandardMaterial color={0xff3333} emissive={0xff0000} emissiveIntensity={2} />
          </mesh>
          <mesh position={[0.7, 0, 0]} castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color={0xffdd00} emissive={0xffaa00} emissiveIntensity={4} toneMapped={false} />
          </mesh>
          {/* Rotation handle */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
            <meshStandardMaterial color={0xaaaaaa} />
          </mesh>
        </group>
      ))}

      {/* Render optical elements */}
      {elements.map((el) => {
        let shape: THREE.Shape | null = null
        const scale = 2

        switch (el.type) {
          case 'flatGlass': {
            shape = new THREE.Shape()
            shape.moveTo(-1.2 * scale / 2, -2 * scale / 2)
            shape.lineTo(1.2 * scale / 2, -2 * scale / 2)
            shape.lineTo(1.2 * scale / 2, 2 * scale / 2)
            shape.lineTo(-1.2 * scale / 2, 2 * scale / 2)
            break
          }
          case 'prism': {
            shape = new THREE.Shape()
            shape.moveTo(0, 2.5 * scale / 2)
            shape.lineTo(-1.5 * scale / 2, -2.5 * scale / 2)
            shape.lineTo(1.5 * scale / 2, -2.5 * scale / 2)
            break
          }
          case 'convexLens':
          case 'concaveLens': {
            shape = new THREE.Shape()
            const curves = new THREE.EllipseCurve(0, 0, 1.3 * scale, 1.3 * scale, 0, Math.PI * 2, false, 0)
            const points = curves.getPoints(50)
            shape.setFromPoints(points)
            break
          }
        }

        if (!shape) return null

        const isMirror = el.type.includes('Mirror')
        return (
          <mesh key={el.id} position={[el.position[0], el.position[1], 0.3]} rotation={[0, 0, el.rotation]} castShadow receiveShadow>
            <extrudeGeometry args={[shape, { depth: 1, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.05, bevelSegments: 3 }]} />
            {isMirror ? (
              <meshPhysicalMaterial color={0xdddddd} metalness={1} roughness={0.02} />
            ) : (
              <meshPhysicalMaterial color={0x4a9eff} transmission={0.6} thickness={1} ior={1.5} roughness={0.1} />
            )}
          </mesh>
        )
      })}

      {/* Render laser paths */}
      {Array.from(laserPaths.entries()).map(([id, path]) => (
        <line key={`path-${id}`}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={path.length} array={new Float32Array(path.flatMap((p) => [p.x, p.y, p.z]))} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color={0xff3333} linewidth={3} toneMapped={false} />
        </line>
      ))}
    </>
  )
}

export function LightRefractionLab() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [objects, setObjects] = useState<SpawnedObject[]>([])
  const [elements, setElements] = useState<OpticalElement[]>([])
  const [rotating, setRotating] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const paletteItems = [
    { id: '1-ray', label: t('optical_laser_1_ray') || '1-Ray Laser', icon: '→' },
    { id: '2-ray', label: t('optical_laser_2_ray') || '2-Ray Laser', icon: '→→' },
    { id: '3-ray', label: t('optical_laser_3_ray') || '3-Ray Laser', icon: '→→→' },
    { id: 'flatGlass', label: t('optical_flat_glass'), icon: '📦' },
    { id: 'prism', label: t('optical_prism'), icon: '🔺' },
    { id: 'convexLens', label: t('optical_convex_lens'), icon: '◯' },
    { id: 'concaveLens', label: t('optical_concave_lens'), icon: '⊘' },
    { id: 'concaveMirror', label: t('optical_concave_mirror'), icon: '⌢' },
    { id: 'convexMirror', label: t('optical_convex_mirror'), icon: '⌣' },
  ]

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('itemId', itemId)
  }

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('itemId')
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 50 - 25
    const y = -((e.clientY - rect.top) / rect.height) * 40 + 20

    const isLaserItem = ['1-ray', '2-ray', '3-ray'].includes(itemId)
    if (isLaserItem) {
      const newLaser: Laser = {
        id: `laser-${Date.now()}`,
        type: itemId as LaserType,
        position: [x, y],
        rotation: 0,
      }
      setObjects((prev) => [...prev, newLaser])
    } else {
      const newElement: OpticalElement = {
        id: `element-${Date.now()}`,
        type: itemId as OpticalElementType,
        position: [x, y],
        rotation: Math.random() * Math.PI * 2,
        ior: 1.5,
      }
      setElements((prev) => [...prev, newElement])
    }
  }

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 50 - 25
    const y = -((e.clientY - rect.top) / rect.height) * 40 + 20

    const clickPoint = v2(x, y)
    const clickRadius = 1.5

    // Check if clicked on a laser
    for (const obj of objects) {
      if (isLaser(obj)) {
        const dist = clickPoint.distanceTo(v2(obj.position[0], obj.position[1]))
        if (dist < clickRadius) {
          setRotating(obj.id)
          return
        }
      }
    }

    // Check if clicked on an element
    for (const el of elements) {
      const dist = clickPoint.distanceTo(v2(el.position[0], el.position[1]))
      if (dist < clickRadius * 1.5) {
        setRotating(el.id)
        return
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!rotating || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 50 - 25
    const y = -((e.clientY - rect.top) / rect.height) * 40 + 20

    // Find object and update rotation
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id === rotating && isLaser(obj)) {
          const dx = x - obj.position[0]
          const dy = y - obj.position[1]
          return { ...obj, rotation: Math.atan2(dy, dx) }
        }
        return obj
      })
    )

    setElements((prev) =>
      prev.map((el) => {
        if (el.id === rotating) {
          const dx = x - el.position[0]
          const dy = y - el.position[1]
          return { ...el, rotation: Math.atan2(dy, dx) }
        }
        return el
      })
    )
  }

  const handleMouseUp = () => {
    setRotating(null)
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#0a0a1a', display: 'flex', flexDirection: 'column' }}>
      <div
        ref={canvasRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleCanvasDrop}
        onContextMenu={handleCanvasContextMenu}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ flex: 1, position: 'relative', cursor: rotating ? 'grabbing' : 'grab' }}
      >
        <Canvas camera={{ position: [0, 0, 40], near: 0.1, far: 1000 }} orthographic>
          <OpticsScene objects={objects} elements={elements} />
        </Canvas>
      </div>

      {/* Palette */}
      <div
        style={{
          background: '#1a2332',
          borderTop: '1px solid #3a5a7a',
          padding: '12px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          alignItems: 'center',
        }}
      >
        {paletteItems.map((item) => (
          <button
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e as any, item.id)}
            style={{
              padding: '8px 12px',
              background: ['1-ray', '2-ray', '3-ray'].includes(item.id) ? '#ff4444' : '#4a7aaa',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'grab',
              fontSize: '12px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate('/optics')}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          padding: '8px 16px',
          backgroundColor: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 10,
        }}
      >
        ← {t('home_button')}
      </button>

      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '16px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#aaa',
          padding: '12px 16px',
          borderRadius: '6px',
          fontSize: '12px',
          maxWidth: '300px',
        }}
      >
        <div style={{ fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Optics Simulator</div>
        <div>• Drag items from palette to spawn</div>
        <div>• Right-click + drag to rotate</div>
        <div>• Lasers bend through glass by Snell's Law</div>
      </div>
    </div>
  )
}
