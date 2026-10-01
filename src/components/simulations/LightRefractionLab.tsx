import React, { useRef, useState, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'

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

// Ray-circle intersection for lens surfaces
const rayCircleIntersection = (rayStart: THREE.Vector2, rayDir: THREE.Vector2, circleCenter: THREE.Vector2, radius: number): { point: THREE.Vector2; t: number; normal: THREE.Vector2 } | null => {
  const oc = rayStart.clone().sub(circleCenter)
  const a = rayDir.dot(rayDir)
  const b = 2 * oc.dot(rayDir)
  const c = oc.dot(oc) - radius * radius
  const discriminant = b * b - 4 * a * c

  if (discriminant < 0) return null

  const t1 = (-b - Math.sqrt(discriminant)) / (2 * a)
  const t2 = (-b + Math.sqrt(discriminant)) / (2 * a)
  const t = t1 > 0.001 ? t1 : (t2 > 0.001 ? t2 : null)

  if (t === null) return null

  const point = rayStart.clone().add(rayDir.clone().multiplyScalar(t))
  const normal = point.clone().sub(circleCenter).normalize()

  return { point, t, normal }
}

// Snell's Law refraction
const calculateRefraction = (incidentDir: THREE.Vector2, normal: THREE.Vector2, n1: number, n2: number): THREE.Vector2 | null => {
  const cosI = Math.abs(normal.dot(incidentDir))
  const ratio = n1 / n2
  const sinT2 = ratio * ratio * (1 - cosI * cosI)
  if (sinT2 > 1) return null
  const cosT = Math.sqrt(1 - sinT2)
  const sign = normal.dot(incidentDir) < 0 ? 1 : -1
  return new THREE.Vector2(
    ratio * incidentDir.x + (ratio * cosI - cosT) * normal.x * sign,
    ratio * incidentDir.y + (ratio * cosI - cosT) * normal.y * sign
  ).normalize()
}

// Reflection
const calculateReflection = (incidentDir: THREE.Vector2, normal: THREE.Vector2): THREE.Vector2 => {
  return incidentDir.clone().sub(normal.clone().multiplyScalar(2 * incidentDir.dot(normal))).normalize()
}

interface TracingObject {
  type: 'lens' | 'mirror' | 'glass'
  center: THREE.Vector2
  radius: number
  rotation: number
  ior: number
  id: string
}

// Trace a single ray
const traceRay = (start: THREE.Vector2, dir: THREE.Vector2, elements: OpticalElement[]): THREE.Vector3[] => {
  const path: THREE.Vector3[] = [new THREE.Vector3(start.x, start.y, 0)]
  const objects: TracingObject[] = elements.map(el => ({
    type: el.type.includes('Lens') ? 'lens' : el.type.includes('Mirror') ? 'mirror' : 'glass',
    center: new THREE.Vector2(el.position[0], el.position[1]),
    radius: el.radius,
    rotation: el.rotation,
    ior: el.type.includes('Mirror') ? 1 : 1.5,
    id: el.id
  }))

  let ray = { start, dir: dir.normalize(), ior: 1, bounces: 0 }

  while (ray.bounces < 10) {
    let closest: { obj: TracingObject; hit: ReturnType<typeof rayCircleIntersection> } | null = null
    let closestT = Infinity

    for (const obj of objects) {
      const hit = rayCircleIntersection(ray.start, ray.dir, obj.center, obj.radius)
      if (hit && hit.t < closestT) {
        closestT = hit.t
        closest = { obj, hit }
      }
    }

    if (!closest || closestT > 200) {
      // Extend ray to infinity
      const extend = ray.dir.multiplyScalar(200)
      path.push(new THREE.Vector3(ray.start.x + extend.x, ray.start.y + extend.y, 0))
      break
    }

    path.push(new THREE.Vector3(closest.hit.point.x, closest.hit.point.y, 0))

    if (closest.obj.type === 'mirror') {
      ray = {
        start: closest.hit.point.clone().add(closest.hit.normal.clone().multiplyScalar(0.01)),
        dir: calculateReflection(ray.dir, closest.hit.normal),
        ior: 1,
        bounces: ray.bounces + 1
      }
    } else {
      const refracted = calculateRefraction(ray.dir, closest.hit.normal, ray.ior, closest.obj.ior)
      if (refracted) {
        ray = {
          start: closest.hit.point.clone().add(refracted.clone().multiplyScalar(0.01)),
          dir: refracted,
          ior: closest.obj.ior,
          bounces: ray.bounces + 1
        }
      } else {
        // Total internal reflection
        ray = {
          start: closest.hit.point.clone().add(closest.hit.normal.clone().multiplyScalar(0.01)),
          dir: calculateReflection(ray.dir, closest.hit.normal),
          ior: ray.ior,
          bounces: ray.bounces + 1
        }
      }
    }
  }

  return path
}

function OpticsScene({ objects, elements }: { objects: SpawnedObject[]; elements: OpticalElement[] }) {
  const { camera } = useThree()

  const laserPaths = useMemo(() => {
    const paths: THREE.Vector3[][] = []
    const lasers = objects.filter(isLaser)

    for (const laser of lasers) {
      const rayCount = parseInt(laser.type.split('-')[0])
      const baseDir = new THREE.Vector2(Math.cos(laser.rotation), Math.sin(laser.rotation))

      if (rayCount === 1) {
        paths.push(traceRay(new THREE.Vector2(...laser.position), baseDir, elements))
      } else {
        const angles = rayCount === 2 ? [-0.2, 0.2] : [-0.3, 0, 0.3]
        for (const angle of angles) {
          const cos = Math.cos(angle)
          const sin = Math.sin(angle)
          const rotDir = new THREE.Vector2(baseDir.x * cos - baseDir.y * sin, baseDir.x * sin + baseDir.y * cos)
          paths.push(traceRay(new THREE.Vector2(...laser.position), rotDir, elements))
        }
      }
    }
    return paths
  }, [objects, elements])

  React.useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.position.z = 40
      camera.left = -30
      camera.right = 30
      camera.top = 25
      camera.bottom = -25
      camera.updateProjectionMatrix()
    }
  }, [camera])

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[40, 40, 30]} intensity={1.2} castShadow />

      <mesh position={[0, 0, -2]} receiveShadow>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color={0x0a0a15} />
      </mesh>

      <gridHelper args={[60, 60, 0x2a4a6a, 0x1a2a4a]} />

      {/* Lasers */}
      {objects.filter(isLaser).map((laser) => (
        <group key={laser.id} position={[laser.position[0], laser.position[1], 1]} rotation={[0, 0, laser.rotation]}>
          <mesh castShadow>
            <boxGeometry args={[1.2, 0.5, 0.4]} />
            <meshStandardMaterial color={0xff2222} emissive={0xff0000} emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[0.7, 0, 0]} castShadow>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial color={0xffcc00} emissive={0xffaa00} emissiveIntensity={3.5} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Optical Elements */}
      {elements.map((el) => {
        let geometry: THREE.BufferGeometry | null = null
        const scale = el.radius

        if (el.type === 'flatGlass') {
          const shape = new THREE.Shape()
          const w = scale * 0.8, h = scale * 1.6
          shape.moveTo(-w, -h)
          shape.lineTo(w, -h)
          shape.lineTo(w, h)
          shape.lineTo(-w, h)
          const extrudeSettings = { depth: 1.5, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.1, bevelSegments: 3 }
          geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
        } else if (el.type === 'convexLens') {
          const shape = new THREE.Shape()
          const r = scale * 0.9
          const x = -r * 0.3
          const c1 = new THREE.Vector2(x, 0)
          const c2 = new THREE.Vector2(-x, 0)
          for (let i = 0; i <= 20; i++) {
            const a = (i / 20) * Math.PI
            const px = c1.x + r * Math.cos(a)
            const py = r * Math.sin(a)
            if (i === 0) shape.moveTo(px, py)
            else shape.lineTo(px, py)
          }
          for (let i = 20; i >= 0; i--) {
            const a = (i / 20) * Math.PI
            const px = c2.x - r * Math.cos(a)
            const py = r * Math.sin(a)
            shape.lineTo(px, py)
          }
          const extrudeSettings = { depth: 1.8, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.08, bevelSegments: 3 }
          geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
        } else if (el.type === 'concaveLens') {
          const shape = new THREE.Shape()
          const r = scale * 0.7
          const x = r * 0.5
          const c1 = new THREE.Vector2(x, 0)
          const c2 = new THREE.Vector2(-x, 0)
          for (let i = 0; i <= 20; i++) {
            const a = (i / 20) * Math.PI
            const px = c1.x - r * Math.cos(a)
            const py = r * Math.sin(a)
            if (i === 0) shape.moveTo(px, py)
            else shape.lineTo(px, py)
          }
          for (let i = 20; i >= 0; i--) {
            const a = (i / 20) * Math.PI
            const px = c2.x + r * Math.cos(a)
            const py = r * Math.sin(a)
            shape.lineTo(px, py)
          }
          const extrudeSettings = { depth: 1.5, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.08, bevelSegments: 3 }
          geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
        } else if (el.type === 'prism') {
          const shape = new THREE.Shape()
          const h = scale * 1.3, w = scale * 1.2
          shape.moveTo(0, h)
          shape.lineTo(-w, -h)
          shape.lineTo(w, -h)
          const extrudeSettings = { depth: 1.6, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.09, bevelSegments: 3 }
          geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
        }

        if (!geometry) return null

        const isMirror = el.type.includes('Mirror')
        return (
          <mesh key={el.id} position={[el.position[0], el.position[1], 0.5]} rotation={[0, 0, el.rotation]} castShadow receiveShadow>
            {geometry && <primitive object={geometry} attach="geometry" />}
            {isMirror ? (
              <meshPhysicalMaterial color={0xe8e8e8} metalness={0.98} roughness={0.02} />
            ) : (
              <meshPhysicalMaterial color={0x4a9eff} transmission={0.8} thickness={1.5} ior={1.5} roughness={0.08} />
            )}
          </mesh>
        )
      })}

      {/* Laser Rays */}
      {laserPaths.map((path, i) => (
        <line key={`ray-${i}`}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={path.length} array={new Float32Array(path.flatMap(p => [p.x, p.y, p.z]))} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color={0xff4444} linewidth={2} toneMapped={false} />
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
      setObjects(prev => [...prev, {
        id: `laser-${Date.now()}`,
        type: itemId as LaserType,
        position: [x, y],
        rotation: 0
      }])
    } else {
      setElements(prev => [...prev, {
        id: `elem-${Date.now()}`,
        type: itemId as OpticalElementType,
        position: [x, y],
        rotation: Math.random() * Math.PI * 2,
        radius: 2
      }])
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 60 - 30
    const y = -((e.clientY - rect.top) / rect.height) * 50 + 25
    const clickPt = new THREE.Vector2(x, y)
    const radius = 1.2

    for (const obj of objects) {
      if (new THREE.Vector2(...obj.position).distanceTo(clickPt) < radius) {
        setRotating(obj.id)
        return
      }
    }
    for (const el of elements) {
      if (new THREE.Vector2(...el.position).distanceTo(clickPt) < radius * 1.5) {
        setRotating(el.id)
        return
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!rotating || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 60 - 30
    const y = -((e.clientY - rect.top) / rect.height) * 50 + 25

    setObjects(prev => prev.map(obj => {
      if (obj.id === rotating && isLaser(obj)) {
        const dx = x - obj.position[0], dy = y - obj.position[1]
        return { ...obj, rotation: Math.atan2(dy, dx) }
      }
      return obj
    }))

    setElements(prev => prev.map(el => {
      if (el.id === rotating) {
        const dx = x - el.position[0], dy = y - el.position[1]
        return { ...el, rotation: Math.atan2(dy, dx) }
      }
      return el
    }))
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#0a0a15', display: 'flex', flexDirection: 'column' }}>
      <div ref={canvasRef} onDragOver={e => e.preventDefault()} onDrop={handleCanvasDrop} onContextMenu={handleContextMenu} onMouseMove={handleMouseMove} onMouseUp={() => setRotating(null)} onMouseLeave={() => setRotating(null)} style={{ flex: 1, cursor: rotating ? 'grabbing' : 'grab' }}>
        <Canvas camera={{ position: [0, 0, 40], near: 0.1, far: 1000 }} orthographic>
          <OpticsScene objects={objects} elements={elements} />
        </Canvas>
      </div>

      <div style={{ background: '#1a2332', borderTop: '1px solid #3a5a7a', padding: '12px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {[
          { id: '1-ray', label: t('optical_laser_1_ray') || '1-Ray', icon: '→', red: true },
          { id: '2-ray', label: t('optical_laser_2_ray') || '2-Ray', icon: '→→', red: true },
          { id: '3-ray', label: t('optical_laser_3_ray') || '3-Ray', icon: '→→→', red: true },
          { id: 'flatGlass', label: t('optical_flat_glass') || 'Glass', icon: '▭' },
          { id: 'convexLens', label: t('optical_convex_lens') || 'Convex Lens', icon: '◯' },
          { id: 'concaveLens', label: t('optical_concave_lens') || 'Concave Lens', icon: '⊘' },
          { id: 'prism', label: t('optical_prism') || 'Prism', icon: '▲' },
          { id: 'concaveMirror', label: t('optical_concave_mirror') || 'Concave Mirror', icon: '◡' },
          { id: 'convexMirror', label: t('optical_convex_mirror') || 'Convex Mirror', icon: '⌣' }
        ].map(item => (
          <button key={item.id} draggable onDragStart={e => handleDragStart(e, item.id)} style={{ padding: '8px 12px', background: item.red ? '#ff4444' : '#4a7aaa', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'grab', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      <button onClick={() => navigate('/optics')} style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px 16px', background: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', zIndex: 10 }}>
        ← {t('home_button')}
      </button>

      <div style={{ position: 'absolute', bottom: '80px', left: '16px', background: 'rgba(0,0,0,0.8)', color: '#aaa', padding: '12px 16px', borderRadius: '6px', fontSize: '11px', maxWidth: '280px' }}>
        <div style={{ fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Optics Lab</div>
        <div>• Drag lasers/optics to spawn</div>
        <div>• Right-click + drag to rotate</div>
        <div>• Light refracts through glass</div>
        <div>• Reflects off mirrors</div>
      </div>
    </div>
  )
}
