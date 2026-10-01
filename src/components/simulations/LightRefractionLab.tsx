import React, { useRef, useState, useMemo } from 'react'
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

// ===== PURE 2D ALGEBRAIC PHYSICS ENGINE =====
// Ray = start point + direction * t
// This is completely independent of Three.js

interface RayHit {
  point: [number, number]
  normal: [number, number]
  t: number
  ior: number
  surfaceType: 'refract' | 'reflect'
}

// Ray-circle intersection (algebraic, 2D only)
const rayCircleIntersect = (
  rayStart: [number, number],
  rayDir: [number, number],
  circleCenter: [number, number],
  radius: number
): RayHit | null => {
  const ox = rayStart[0] - circleCenter[0]
  const oy = rayStart[1] - circleCenter[1]
  const a = rayDir[0] * rayDir[0] + rayDir[1] * rayDir[1]
  const b = 2 * (ox * rayDir[0] + oy * rayDir[1])
  const c = ox * ox + oy * oy - radius * radius
  const disc = b * b - 4 * a * c
  if (disc < 0) return null
  const t1 = (-b - Math.sqrt(disc)) / (2 * a)
  const t2 = (-b + Math.sqrt(disc)) / (2 * a)
  const t = t1 > 0.001 ? t1 : t2 > 0.001 ? t2 : null
  if (t === null) return null
  const point: [number, number] = [rayStart[0] + rayDir[0] * t, rayStart[1] + rayDir[1] * t]
  const nx = point[0] - circleCenter[0]
  const ny = point[1] - circleCenter[1]
  const len = Math.sqrt(nx * nx + ny * ny)
  return { point, normal: [nx / len, ny / len], t, ior: 1.5, surfaceType: 'refract' }
}

// Ray-line segment intersection (algebraic, 2D only)
const rayLineIntersect = (
  rayStart: [number, number],
  rayDir: [number, number],
  p1: [number, number],
  p2: [number, number]
): RayHit | null => {
  const ex = p2[0] - p1[0]
  const ey = p2[1] - p1[1]
  const denom = rayDir[0] * ey - rayDir[1] * ex
  if (Math.abs(denom) < 0.0001) return null
  const ox = p1[0] - rayStart[0]
  const oy = p1[1] - rayStart[1]
  const t = (ox * ey - oy * ex) / denom
  const s = (ox * rayDir[1] - oy * rayDir[0]) / denom
  if (t > 0.001 && s >= 0 && s <= 1) {
    const point: [number, number] = [rayStart[0] + rayDir[0] * t, rayStart[1] + rayDir[1] * t]
    const len = Math.sqrt(ex * ex + ey * ey)
    return { point, normal: [-ey / len, ex / len], t, ior: 1.5, surfaceType: 'refract' }
  }
  return null
}

// Snell's Law (pure math, 2D)
const snellRefract = (rayDir: [number, number], normal: [number, number], n1: number, n2: number): [number, number] | null => {
  const cosI = Math.abs(rayDir[0] * normal[0] + rayDir[1] * normal[1])
  const ratio = n1 / n2
  const sinT2 = ratio * ratio * (1 - cosI * cosI)
  if (sinT2 > 1) return null
  const cosT = Math.sqrt(1 - sinT2)
  const sign = (rayDir[0] * normal[0] + rayDir[1] * normal[1] > 0) ? -1 : 1
  return [
    ratio * rayDir[0] + sign * (ratio * cosI - cosT) * normal[0],
    ratio * rayDir[1] + sign * (ratio * cosI - cosT) * normal[1]
  ]
}

// Reflection (pure math, 2D)
const reflect = (rayDir: [number, number], normal: [number, number]): [number, number] => {
  const dot = rayDir[0] * normal[0] + rayDir[1] * normal[1]
  return [rayDir[0] - 2 * dot * normal[0], rayDir[1] - 2 * dot * normal[1]]
}

// Normalize vector
const normalize = (v: [number, number]): [number, number] => {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1])
  return [v[0] / len, v[1] / len]
}

// Build 2D surfaces from elements
interface Surface {
  type: 'circle' | 'line'
  center?: [number, number]
  radius?: number
  p1?: [number, number]
  p2?: [number, number]
  ior: number
  surfaceType: 'refract' | 'reflect'
  id: string
}

const buildSurfaces = (elements: OpticalElement[]): Surface[] => {
  const surfaces: Surface[] = []
  const scale = 2

  elements.forEach((el) => {
    const cos = Math.cos(el.rotation)
    const sin = Math.sin(el.rotation)
    const rotatePoint = (x: number, y: number): [number, number] => [
      el.position[0] + x * cos - y * sin,
      el.position[1] + x * sin + y * cos
    ]

    if (el.type === 'flatGlass') {
      const h = 2 * scale, w = 1.2 * scale
      const p1 = rotatePoint(-w / 2, -h / 2)
      const p2 = rotatePoint(w / 2, -h / 2)
      const p3 = rotatePoint(w / 2, h / 2)
      const p4 = rotatePoint(-w / 2, h / 2)
      surfaces.push({ type: 'line', p1, p2: p3, ior: 1.5, surfaceType: 'refract', id: el.id })
      surfaces.push({ type: 'line', p1: p4, p2, ior: 1.5, surfaceType: 'refract', id: el.id })
    } else if (el.type === 'prism') {
      const h = 2.5 * scale, w = 1.5 * scale
      const p1 = rotatePoint(0, h / 2)
      const p2 = rotatePoint(-w / 2, -h / 2)
      const p3 = rotatePoint(w / 2, -h / 2)
      surfaces.push({ type: 'line', p1, p2, ior: 1.5, surfaceType: 'refract', id: el.id })
      surfaces.push({ type: 'line', p1: p2, p2: p3, ior: 1.5, surfaceType: 'refract', id: el.id })
      surfaces.push({ type: 'line', p1: p3, p2: p1, ior: 1.5, surfaceType: 'refract', id: el.id })
    } else if (el.type === 'convexLens' || el.type === 'concaveLens') {
      const r = scale * 0.9
      const offset = scale * 0.3 * (el.type === 'concaveLens' ? -1 : 1)
      const c1 = rotatePoint(-offset, 0)
      const c2 = rotatePoint(offset, 0)
      surfaces.push({ type: 'circle', center: c1, radius: r, ior: 1.5, surfaceType: 'refract', id: el.id })
      surfaces.push({ type: 'circle', center: c2, radius: r, ior: 1.5, surfaceType: 'refract', id: el.id })
    } else if (el.type.includes('Mirror')) {
      const r = scale * 1.5
      surfaces.push({ type: 'circle', center: el.position, radius: r, ior: 1, surfaceType: 'reflect', id: el.id })
    }
  })

  return surfaces
}

// Pure 2D ray tracing - returns coordinate path
const traceRay2D = (start: [number, number], dir: [number, number], surfaces: Surface[]): [number, number][] => {
  const path: [number, number][] = [start]
  let ray = { start, dir: normalize(dir), ior: 1, bounces: 0 }

  while (ray.bounces < 10) {
    let closest: { surf: Surface; hit: RayHit } | null = null
    let closestT = Infinity

    for (const surf of surfaces) {
      let hit: RayHit | null = null
      if (surf.type === 'circle' && surf.center && surf.radius) {
        hit = rayCircleIntersect(ray.start, ray.dir, surf.center, surf.radius)
      } else if (surf.type === 'line' && surf.p1 && surf.p2) {
        hit = rayLineIntersect(ray.start, ray.dir, surf.p1, surf.p2)
      }
      if (hit && hit.t < closestT) {
        closestT = hit.t
        closest = { surf, hit }
      }
    }

    if (!closest || closestT > 200) {
      const endPoint: [number, number] = [ray.start[0] + ray.dir[0] * 200, ray.start[1] + ray.dir[1] * 200]
      path.push(endPoint)
      break
    }

    path.push(closest.hit.point)

    if (closest.surf.surfaceType === 'reflect') {
      const newDir = reflect(ray.dir, closest.hit.normal)
      ray = { start: [closest.hit.point[0] + newDir[0] * 0.01, closest.hit.point[1] + newDir[1] * 0.01], dir: newDir, ior: 1, bounces: ray.bounces + 1 }
    } else {
      const refracted = snellRefract(ray.dir, closest.hit.normal, ray.ior, closest.surf.ior)
      if (refracted) {
        ray = {
          start: [closest.hit.point[0] + refracted[0] * 0.01, closest.hit.point[1] + refracted[1] * 0.01],
          dir: normalize(refracted),
          ior: closest.surf.ior,
          bounces: ray.bounces + 1
        }
      } else {
        const newDir = reflect(ray.dir, closest.hit.normal)
        ray = { start: [closest.hit.point[0] + newDir[0] * 0.01, closest.hit.point[1] + newDir[1] * 0.01], dir: newDir, ior: ray.ior, bounces: ray.bounces + 1 }
      }
    }
  }

  return path
}

// ===== 3D RENDERING (uses 2D physics output) =====

function DraggableLaser({ laser, onUpdate, onDelete }: any) {
  const ref = useRef<THREE.Group>(null)
  const bind = useDrag(({ offset: [ox, oy], buttons }) => {
    const dx = (ox / 300) * 30
    const dy = -(oy / 300) * 25
    if (buttons === 2) {
      const ang = Math.atan2(dy, dx)
      onUpdate({ ...laser, rotation: ang })
    } else {
      const nx = laser.position[0] + dx
      const ny = laser.position[1] + dy
      if (ny < -23) onDelete()
      else onUpdate({ ...laser, position: [nx, ny] })
    }
  })
  return (
    <group ref={ref} position={[laser.position[0], laser.position[1], 1]} rotation={[0, 0, laser.rotation]} {...(bind() as any)}>
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.4, 0.3]} />
        <meshStandardMaterial color={0x1a1a1a} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.65, 0, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={0xff3333} emissive={0xff1111} emissiveIntensity={4} toneMapped={false} />
      </mesh>
    </group>
  )
}

function DraggableOpticalElement({ element, onUpdate, onDelete }: any) {
  const ref = useRef<THREE.Mesh>(null)
  const bind = useDrag(({ offset: [ox, oy], buttons }) => {
    const dx = (ox / 300) * 30
    const dy = -(oy / 300) * 25
    if (buttons === 2) {
      const ang = Math.atan2(dy, dx)
      onUpdate({ ...element, rotation: ang })
    } else {
      const nx = element.position[0] + dx
      const ny = element.position[1] + dy
      if (ny < -23) onDelete()
      else onUpdate({ ...element, position: [nx, ny] })
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
    geometry = new THREE.ExtrudeGeometry(shape, { depth: 3.5, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.4, bevelSegments: 4 })
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
    geometry = new THREE.ExtrudeGeometry(shape, { depth: 3.5, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.4, bevelSegments: 4 })
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
    geometry = new THREE.ExtrudeGeometry(shape, { depth: 3.5, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.4, bevelSegments: 4 })
  } else if (element.type === 'prism') {
    const shape = new THREE.Shape()
    shape.moveTo(0, 2.5 * scale / 2)
    shape.lineTo(-1.5 * scale / 2, -2.5 * scale / 2)
    shape.lineTo(1.5 * scale / 2, -2.5 * scale / 2)
    geometry = new THREE.ExtrudeGeometry(shape, { depth: 3.5, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.4, bevelSegments: 4 })
  }

  if (!geometry) return null
  const isMirror = element.type.includes('Mirror')

  return (
    <mesh ref={ref} position={[element.position[0], element.position[1], 1.75]} rotation={[0, 0, element.rotation]} castShadow receiveShadow {...(bind() as any)}>
      <primitive object={geometry} attach="geometry" />
      {isMirror ? (
        <meshPhysicalMaterial color={0xe0e0e0} metalness={0.98} roughness={0.01} />
      ) : (
        <meshPhysicalMaterial color={0x88ccff} transmission={0.92} thickness={2} ior={1.5} roughness={0.04} />
      )}
    </mesh>
  )
}

function OpticsScene({ objects, elements, onUpdate, onDelete }: any) {
  const { camera } = useThree()
  const laserPaths = useMemo(() => {
    const surfaces = buildSurfaces(elements)
    const paths: [number, number][][] = []

    objects.filter(isLaser).forEach((laser: Laser) => {
      const rayCount = parseInt(laser.type.split('-')[0])
      const cos = Math.cos(laser.rotation)
      const sin = Math.sin(laser.rotation)
      const baseDir: [number, number] = [cos, sin]

      if (rayCount === 1) {
        paths.push(traceRay2D(laser.position, baseDir, surfaces))
      } else {
        const spacing = 0.3
        const offsets = rayCount === 2 ? [-spacing / 2, spacing / 2] : [-spacing, 0, spacing]
        offsets.forEach((offset) => {
          const rayStart: [number, number] = [laser.position[0] - offset * sin, laser.position[1] + offset * cos]
          paths.push(traceRay2D(rayStart, baseDir, surfaces))
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
      <ambientLight intensity={1.2} />
      <directionalLight position={[60, 60, 50]} intensity={2} castShadow />
      <mesh position={[0, 0, -5]} receiveShadow>
        <planeGeometry args={[100, 80]} />
        <meshStandardMaterial color={0xffffff} />
      </mesh>
      <gridHelper args={[80, 80, 0xcccccc, 0xeeeeee]} />
      {objects.filter(isLaser).map((laser: Laser) => (
        <DraggableLaser key={laser.id} laser={laser} onUpdate={(l: any) => onUpdate(laser.id, l)} onDelete={() => onDelete(laser.id)} />
      ))}
      {elements.map((el: OpticalElement) => (
        <DraggableOpticalElement key={el.id} element={el} onUpdate={(e: any) => onUpdate(el.id, e)} onDelete={() => onDelete(el.id)} />
      ))}
      {laserPaths.map((path, i) => {
        const points = path.map((p) => new THREE.Vector3(p[0], p[1], 0))
        return (
          <line key={`ray-${i}`}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={points.length} array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))} itemSize={3} />
            </bufferGeometry>
            <lineBasicMaterial color={0xff1a4d} linewidth={5} toneMapped={false} />
          </line>
        )
      })}
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
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div ref={canvasRef} onDragOver={e => e.preventDefault()} onDrop={handleCanvasDrop} style={{ flex: 1 }}>
        <Canvas camera={{ position: [0, 0, 50], near: 0.1, far: 1000 }} orthographic>
          <OpticsScene objects={objects} elements={elements} onUpdate={handleUpdate} onDelete={handleDelete} />
        </Canvas>
      </div>
      <div style={{ background: '#333', borderTop: '1px solid #555', padding: '12px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {[
          { id: '1-ray', label: '1-Ray', icon: '→', red: true },
          { id: '2-ray', label: '2-Ray', icon: '→→', red: true },
          { id: '3-ray', label: '3-Ray', icon: '→→→', red: true },
          { id: 'flatGlass', label: 'Glass', icon: '▭' },
          { id: 'convexLens', label: 'Convex', icon: '◯' },
          { id: 'concaveLens', label: 'Concave', icon: '⊘' },
          { id: 'prism', label: 'Prism', icon: '▲' },
          { id: 'concaveMirror', label: 'Mirror◡', icon: '◡' },
          { id: 'convexMirror', label: 'Mirror◠', icon: '⌣' }
        ].map(item => (
          <button key={item.id} draggable onDragStart={e => handleDragStart(e, item.id)} style={{ padding: '8px 12px', background: item.red ? '#ff1a4d' : '#4a8acc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'grab', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {item.icon} {item.label}
          </button>
        ))}
      </div>
      <button onClick={() => navigate('/optics')} style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', zIndex: 10 }}>
        ← Back
      </button>
      <div style={{ position: 'absolute', bottom: '80px', left: '16px', background: 'rgba(0,0,0,0.7)', color: '#aaa', padding: '12px 16px', borderRadius: '4px', fontSize: '11px', maxWidth: '280px' }}>
        <div style={{ fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Optics Lab: Pure 2D Physics</div>
        <div>• Drag palette items to spawn</div>
        <div>• Left-drag to move, right-click to rotate</div>
        <div>• Drag below canvas to delete</div>
      </div>
    </div>
  )
}
