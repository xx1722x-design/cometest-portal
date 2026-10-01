import React, { useRef, useState, useMemo, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import { useDrag } from '@use-gesture/react'

type LaserType = '1-ray' | '2-ray' | '3-ray'
type OpticalElementType = 'flatGlass' | 'prism' | 'convexLens' | 'concaveLens' | 'concaveMirror' | 'convexMirror'

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
  radius: number
}

type SpawnedObject = Laser | OpticalElement
const isLaser = (obj: SpawnedObject): obj is Laser => obj.type in { '1-ray': 1, '2-ray': 1, '3-ray': 1 }

// EXACT RAY-CIRCLE INTERSECTION
const rayCircleIntersection = (
  rayStart: THREE.Vector2,
  rayDir: THREE.Vector2,
  circleCenter: THREE.Vector2,
  radius: number
): { point: THREE.Vector2; normal: THREE.Vector2; t: number } | null => {
  const oc = rayStart.clone().sub(circleCenter)
  const a = rayDir.dot(rayDir)
  const b = 2.0 * oc.dot(rayDir)
  const c = oc.dot(oc) - radius * radius
  const discriminant = b * b - 4 * a * c
  if (discriminant < 0) return null
  const t1 = (-b - Math.sqrt(discriminant)) / (2 * a)
  const t2 = (-b + Math.sqrt(discriminant)) / (2 * a)
  const t = t1 > 0.001 ? t1 : t2 > 0.001 ? t2 : null
  if (!t) return null
  const point = rayStart.clone().add(rayDir.clone().multiplyScalar(t))
  const normal = point.clone().sub(circleCenter).normalize()
  return { point, normal, t }
}

// EXACT RAY-LINE SEGMENT INTERSECTION
const rayLineIntersection = (
  rayStart: THREE.Vector2,
  rayDir: THREE.Vector2,
  p1: THREE.Vector2,
  p2: THREE.Vector2
): { point: THREE.Vector2; normal: THREE.Vector2; t: number } | null => {
  const edge = p2.clone().sub(p1)
  const denom = rayDir.x * edge.y - rayDir.y * edge.x
  if (Math.abs(denom) < 0.0001) return null
  const ov = p1.clone().sub(rayStart)
  const t = (ov.x * edge.y - ov.y * edge.x) / denom
  const s = (ov.x * rayDir.y - ov.y * rayDir.x) / denom
  if (t > 0.001 && s >= 0 && s <= 1) {
    const point = rayStart.clone().add(rayDir.clone().multiplyScalar(t))
    const normal = new THREE.Vector2(-edge.y, edge.x).normalize()
    return { point, normal, t }
  }
  return null
}

// SNELL'S LAW - EXACT
const calculateRefraction = (incidentDir: THREE.Vector2, normal: THREE.Vector2, n1: number, n2: number): THREE.Vector2 | null => {
  let cosI = -normal.dot(incidentDir)
  if (cosI < 0) {
    cosI = -cosI
  }
  const ratio = n1 / n2
  const sinT2 = ratio * ratio * (1 - cosI * cosI)
  if (sinT2 > 1) return null
  const cosT = Math.sqrt(1 - sinT2)
  const sign = normal.dot(incidentDir) > 0 ? -1 : 1
  return new THREE.Vector2(
    ratio * incidentDir.x + sign * (ratio * cosI - cosT) * normal.x,
    ratio * incidentDir.y + sign * (ratio * cosI - cosT) * normal.y
  ).normalize()
}

// REFLECTION LAW
const calculateReflection = (incidentDir: THREE.Vector2, normal: THREE.Vector2): THREE.Vector2 => {
  return incidentDir.clone().sub(normal.clone().multiplyScalar(2 * incidentDir.dot(normal))).normalize()
}

interface OpticalSurface {
  type: 'circle' | 'line'
  center?: THREE.Vector2
  radius?: number
  p1?: THREE.Vector2
  p2?: THREE.Vector2
  surfaceType: 'refract' | 'reflect'
  ior: number
  id: string
}

const buildSurfaces = (elements: OpticalElement[]): OpticalSurface[] => {
  const surfaces: OpticalSurface[] = []
  const scale = 2

  elements.forEach((el) => {
    const pos = new THREE.Vector2(...el.position)
    const rot = el.rotation
    const cos = Math.cos(rot)
    const sin = Math.sin(rot)
    const rotatePoint = (x: number, y: number): THREE.Vector2 => new THREE.Vector2(pos.x + x * cos - y * sin, pos.y + x * sin + y * cos)

    if (el.type === 'flatGlass') {
      const h = 2 * scale, w = 1.2 * scale
      const p1 = rotatePoint(-w / 2, -h / 2)
      const p2 = rotatePoint(w / 2, -h / 2)
      const p3 = rotatePoint(w / 2, h / 2)
      const p4 = rotatePoint(-w / 2, h / 2)
      surfaces.push({ type: 'line', p1, p2: p3, surfaceType: 'refract', ior: 1.5, id: el.id })
      surfaces.push({ type: 'line', p1: p4, p2, surfaceType: 'refract', ior: 1.5, id: el.id })
    } else if (el.type === 'prism') {
      const h = 2.5 * scale, w = 1.5 * scale
      const p1 = rotatePoint(0, h / 2)
      const p2 = rotatePoint(-w / 2, -h / 2)
      const p3 = rotatePoint(w / 2, -h / 2)
      surfaces.push({ type: 'line', p1, p2, surfaceType: 'refract', ior: 1.5, id: el.id })
      surfaces.push({ type: 'line', p1: p2, p2: p3, surfaceType: 'refract', ior: 1.5, id: el.id })
      surfaces.push({ type: 'line', p1: p3, p2: p1, surfaceType: 'refract', ior: 1.5, id: el.id })
    } else if (el.type === 'convexLens' || el.type === 'concaveLens') {
      const r = scale * 0.9
      const offset = scale * 0.3 * (el.type === 'concaveLens' ? -1 : 1)
      const c1 = rotatePoint(-offset, 0)
      const c2 = rotatePoint(offset, 0)
      surfaces.push({ type: 'circle', center: c1, radius: r, surfaceType: 'refract', ior: 1.5, id: el.id })
      surfaces.push({ type: 'circle', center: c2, radius: r, surfaceType: 'refract', ior: 1.5, id: el.id })
    } else if (el.type === 'concaveMirror' || el.type === 'convexMirror') {
      const r = scale * 1.5
      surfaces.push({ type: 'circle', center: pos, radius: r, surfaceType: 'reflect', ior: 1, id: el.id })
    }
  })
  return surfaces
}

const traceRay = (start: THREE.Vector2, dir: THREE.Vector2, elements: OpticalElement[]): THREE.Vector3[] => {
  const path: THREE.Vector3[] = [new THREE.Vector3(start.x, start.y, 0)]
  const surfaces = buildSurfaces(elements)
  let ray = { start, dir: dir.normalize(), ior: 1, bounces: 0 }

  while (ray.bounces < 10) {
    let closest: { surface: OpticalSurface; hit: any } | null = null
    let closestT = Infinity

    for (const surf of surfaces) {
      let hit: any = null
      if (surf.type === 'circle' && surf.center && surf.radius) {
        hit = rayCircleIntersection(ray.start, ray.dir, surf.center, surf.radius)
      } else if (surf.type === 'line' && surf.p1 && surf.p2) {
        hit = rayLineIntersection(ray.start, ray.dir, surf.p1, surf.p2)
      }
      if (hit && hit.t < closestT) {
        closestT = hit.t
        closest = { surface: surf, hit }
      }
    }

    if (!closest || closestT > 200) {
      const extend = ray.dir.multiplyScalar(200)
      path.push(new THREE.Vector3(ray.start.x + extend.x, ray.start.y + extend.y, 0))
      break
    }

    path.push(new THREE.Vector3(closest.hit.point.x, closest.hit.point.y, 0))

    if (closest.surface.surfaceType === 'reflect') {
      ray = { start: closest.hit.point.clone().add(closest.hit.normal.clone().multiplyScalar(0.01)), dir: calculateReflection(ray.dir, closest.hit.normal), ior: 1, bounces: ray.bounces + 1 }
    } else {
      const refracted = calculateRefraction(ray.dir, closest.hit.normal, ray.ior, closest.surface.ior)
      if (refracted) {
        ray = { start: closest.hit.point.clone().add(refracted.clone().multiplyScalar(0.01)), dir: refracted, ior: closest.surface.ior, bounces: ray.bounces + 1 }
      } else {
        ray = { start: closest.hit.point.clone().add(closest.hit.normal.clone().multiplyScalar(0.01)), dir: calculateReflection(ray.dir, closest.hit.normal), ior: ray.ior, bounces: ray.bounces + 1 }
      }
    }
  }
  return path
}

function DraggableLaser({ laser, onUpdate, onDelete }: { laser: Laser; onUpdate: (l: Laser) => void; onDelete: () => void }) {
  const meshRef = useRef<THREE.Group>(null)
  const lastPosRef = useRef(laser.position)
  const lastRotRef = useRef(laser.rotation)

  const bind = useDrag(({ offset: [ox, oy], buttons, event }) => {
    const worldX = (ox / 300) * 30 - 15
    const worldY = -(oy / 300) * 25 + 12.5

    if (buttons === 2 || (event as any)?.ctrlKey) {
      // Right-click or Ctrl: rotate
      const angle = Math.atan2(worldY - laser.position[1], worldX - laser.position[0])
      lastRotRef.current = angle
      onUpdate({ ...laser, rotation: angle })
    } else {
      // Left-click: move
      const newX = laser.position[0] + worldX
      const newY = laser.position[1] + worldY
      if (newY < -23) {
        onDelete()
      } else {
        lastPosRef.current = [newX, newY]
        onUpdate({ ...laser, position: [newX, newY] })
      }
    }
  })

  return (
    <group ref={meshRef} position={[laser.position[0], laser.position[1], 1]} rotation={[0, 0, laser.rotation]} {...(bind() as any)}>
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.4, 1.2, 8]} />
        <meshStandardMaterial color={0x333333} metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color={0xffff00} emissive={0xffff00} emissiveIntensity={5} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.6, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.35, 0.2, 8]} />
        <meshStandardMaterial color={0x222222} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

function DraggableOpticalElement({ element, onUpdate, onDelete }: { element: OpticalElement; onUpdate: (e: OpticalElement) => void; onDelete: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null)

  const bind = useDrag(({ offset: [ox, oy], buttons, event }) => {
    const worldX = (ox / 300) * 30 - 15
    const worldY = -(oy / 300) * 25 + 12.5

    if (buttons === 2 || (event as any)?.ctrlKey) {
      const angle = Math.atan2(worldY - element.position[1], worldX - element.position[0])
      onUpdate({ ...element, rotation: angle })
    } else {
      const newX = element.position[0] + worldX
      const newY = element.position[1] + worldY
      if (newY < -23) {
        onDelete()
      } else {
        onUpdate({ ...element, position: [newX, newY] })
      }
    }
  })

  let geometry: THREE.BufferGeometry | null = null
  const scale = element.radius

  if (element.type === 'flatGlass') {
    const shape = new THREE.Shape()
    shape.moveTo(-1.2 * scale / 2, -2 * scale / 2)
    shape.lineTo(1.2 * scale / 2, -2 * scale / 2)
    shape.lineTo(1.2 * scale / 2, 2 * scale / 2)
    shape.lineTo(-1.2 * scale / 2, 2 * scale / 2)
    geometry = new THREE.ExtrudeGeometry(shape, { depth: 4.0, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5, bevelSegments: 5 })
  } else if (element.type === 'convexLens') {
    const shape = new THREE.Shape()
    const r = scale * 0.9, x = -r * 0.3
    const c1 = new THREE.Vector2(x, 0), c2 = new THREE.Vector2(-x, 0)
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20) * Math.PI
      const px = c1.x + r * Math.cos(a), py = r * Math.sin(a)
      if (i === 0) shape.moveTo(px, py)
      else shape.lineTo(px, py)
    }
    for (let i = 20; i >= 0; i--) {
      const a = (i / 20) * Math.PI
      const px = c2.x - r * Math.cos(a), py = r * Math.sin(a)
      shape.lineTo(px, py)
    }
    geometry = new THREE.ExtrudeGeometry(shape, { depth: 4.0, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5, bevelSegments: 5 })
  } else if (element.type === 'concaveLens') {
    const shape = new THREE.Shape()
    const r = scale * 0.7, x = r * 0.5
    const c1 = new THREE.Vector2(x, 0), c2 = new THREE.Vector2(-x, 0)
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20) * Math.PI
      const px = c1.x - r * Math.cos(a), py = r * Math.sin(a)
      if (i === 0) shape.moveTo(px, py)
      else shape.lineTo(px, py)
    }
    for (let i = 20; i >= 0; i--) {
      const a = (i / 20) * Math.PI
      const px = c2.x + r * Math.cos(a), py = r * Math.sin(a)
      shape.lineTo(px, py)
    }
    geometry = new THREE.ExtrudeGeometry(shape, { depth: 4.0, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5, bevelSegments: 5 })
  } else if (element.type === 'prism') {
    const shape = new THREE.Shape()
    shape.moveTo(0, 2.5 * scale / 2)
    shape.lineTo(-1.5 * scale / 2, -2.5 * scale / 2)
    shape.lineTo(1.5 * scale / 2, -2.5 * scale / 2)
    geometry = new THREE.ExtrudeGeometry(shape, { depth: 4.0, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5, bevelSegments: 5 })
  }

  if (!geometry) return null

  const isMirror = element.type.includes('Mirror')

  return (
    <mesh ref={meshRef} position={[element.position[0], element.position[1], 2]} rotation={[0, 0, element.rotation]} castShadow receiveShadow {...(bind() as any)}>
      <primitive object={geometry} attach="geometry" />
      {isMirror ? <meshPhysicalMaterial color={0xf5f5f5} metalness={0.98} roughness={0.01} /> : <meshPhysicalMaterial color={0x5aa3ff} transmission={0.9} thickness={2.5} ior={1.5} roughness={0.05} />}
    </mesh>
  )
}

function OpticsScene({ objects, elements, onUpdate, onDelete }: any) {
  const { camera } = useThree()
  const laserPaths = useMemo(() => {
    const paths: THREE.Vector3[][] = []
    objects.filter(isLaser).forEach((laser: Laser) => {
      const rayCount = parseInt(laser.type.split('-')[0])
      const baseDir = new THREE.Vector2(Math.cos(laser.rotation), Math.sin(laser.rotation))
      if (rayCount === 1) {
        paths.push(traceRay(new THREE.Vector2(...laser.position), baseDir, elements))
      } else {
        const angles = rayCount === 2 ? [-0.25, 0.25] : [-0.35, 0, 0.35]
        angles.forEach(angle => {
          const cos = Math.cos(angle), sin = Math.sin(angle)
          const rotDir = new THREE.Vector2(baseDir.x * cos - baseDir.y * sin, baseDir.x * sin + baseDir.y * cos)
          paths.push(traceRay(new THREE.Vector2(...laser.position), rotDir, elements))
        })
      }
    })
    return paths
  }, [objects, elements])

  React.useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.position.z = 50
      camera.left = -30
      camera.right = 30
      camera.top = 25
      camera.bottom = -25
      camera.updateProjectionMatrix()
    }
  }, [camera])

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[60, 60, 50]} intensity={1.8} castShadow />
      <mesh position={[0, 0, -4]} receiveShadow>
        <planeGeometry args={[80, 70]} />
        <meshStandardMaterial color={0x0a0a15} />
      </mesh>
      <gridHelper args={[70, 70, 0x2a5a8a, 0x1a3a5a]} />
      {objects.filter(isLaser).map((laser: Laser) => (
        <DraggableLaser key={laser.id} laser={laser} onUpdate={(l) => onUpdate(laser.id, l)} onDelete={() => onDelete(laser.id)} />
      ))}
      {elements.map((el: OpticalElement) => (
        <DraggableOpticalElement key={el.id} element={el} onUpdate={(e) => onUpdate(el.id, e)} onDelete={() => onDelete(el.id)} />
      ))}
      {laserPaths.map((path, i) => (
        <line key={`ray-${i}`}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={path.length} array={new Float32Array(path.flatMap(p => [p.x, p.y, p.z]))} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color={0xff6666} linewidth={4} toneMapped={false} />
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
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('itemId', itemId)
  }

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('itemId')
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 60 - 30
    const y = -((e.clientY - rect.top) / rect.height) * 50 + 25
    if (['1-ray', '2-ray', '3-ray'].includes(itemId)) {
      setObjects(prev => [...prev, { id: `laser-${Date.now()}`, type: itemId as LaserType, position: [x, y], rotation: 0 }])
    } else {
      setElements(prev => [...prev, { id: `elem-${Date.now()}`, type: itemId as OpticalElementType, position: [x, y], rotation: 0, radius: 2 }])
    }
  }

  const handleUpdate = (id: string, updated: any) => {
    setObjects(prev => prev.map(obj => obj.id === id ? { ...obj, ...updated } : obj))
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updated } : el))
  }

  const handleDelete = (id: string) => {
    setObjects(prev => prev.filter(obj => obj.id !== id))
    setElements(prev => prev.filter(el => el.id !== id))
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#0a0a15', display: 'flex', flexDirection: 'column' }}>
      <div ref={canvasRef} onDragOver={e => e.preventDefault()} onDrop={handleCanvasDrop} style={{ flex: 1 }}>
        <Canvas camera={{ position: [0, 0, 50], near: 0.1, far: 1000 }} orthographic>
          <OpticsScene objects={objects} elements={elements} onUpdate={handleUpdate} onDelete={handleDelete} />
        </Canvas>
      </div>
      <div style={{ background: '#1a2332', borderTop: '1px solid #3a5a7a', padding: '12px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {[
          { id: '1-ray', label: '1-Ray Laser', icon: '→', red: true },
          { id: '2-ray', label: '2-Ray Laser', icon: '→→', red: true },
          { id: '3-ray', label: '3-Ray Laser', icon: '→→→', red: true },
          { id: 'flatGlass', label: 'Flat Glass', icon: '▭' },
          { id: 'convexLens', label: 'Convex Lens', icon: '◯' },
          { id: 'concaveLens', label: 'Concave Lens', icon: '⊘' },
          { id: 'prism', label: 'Prism', icon: '▲' },
          { id: 'concaveMirror', label: 'Concave Mirror', icon: '◡' },
          { id: 'convexMirror', label: 'Convex Mirror', icon: '⌣' }
        ].map(item => (
          <button key={item.id} draggable onDragStart={e => handleDragStart(e, item.id)} style={{ padding: '8px 12px', background: item.red ? '#ff5555' : '#4a8aba', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'grab', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {item.icon} {item.label}
          </button>
        ))}
      </div>
      <button onClick={() => navigate('/optics')} style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px 16px', background: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', zIndex: 10 }}>
        ← {t('home_button')}
      </button>
      <div style={{ position: 'absolute', bottom: '80px', left: '16px', background: 'rgba(0,0,0,0.9)', color: '#aaa', padding: '12px 16px', borderRadius: '6px', fontSize: '11px', maxWidth: '280px' }}>
        <div style={{ fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Premium Optics Lab v2.9</div>
        <div>• Drag from palette to spawn</div>
        <div>• Left-drag objects to move</div>
        <div>• Right-click/Ctrl+drag to rotate</div>
        <div>• Drag below canvas to delete</div>
      </div>
    </div>
  )
}
