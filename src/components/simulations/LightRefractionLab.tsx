import React, { useRef, useState, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'

type ElementType = 'laser' | 'flatGlass' | 'prism' | 'convexLens' | 'concaveLens' | 'concaveMirror' | 'convexMirror'

interface SpawnedElement {
  id: string
  type: Exclude<ElementType, 'laser'>
  position: [number, number]
  rotation: number
  ior: number
}

interface Ray {
  start: THREE.Vector2
  direction: THREE.Vector2
  ior: number
  bounces: number
}

interface Segment {
  p1: THREE.Vector2
  p2: THREE.Vector2
  normal: THREE.Vector2
  elementId: string
  type: 'surface' | 'mirror'
  ior: number
}

// Calculate Snell's Law refraction
const calculateRefraction = (incidentDir: THREE.Vector2, normal: THREE.Vector2, n1: number, n2: number): THREE.Vector2 | null => {
  const cosI = -normal.dot(incidentDir)
  const ratio = n1 / n2
  const sinT2 = ratio * ratio * (1 - cosI * cosI)

  if (sinT2 > 1) return null // Total internal reflection

  const cosT = Math.sqrt(1 - sinT2)
  return new THREE.Vector2(
    ratio * incidentDir.x + (ratio * cosI - cosT) * normal.x,
    ratio * incidentDir.y + (ratio * cosI - cosT) * normal.y
  ).normalize()
}

// Calculate reflection
const calculateReflection = (incidentDir: THREE.Vector2, normal: THREE.Vector2): THREE.Vector2 => {
  return incidentDir.clone().sub(normal.clone().multiplyScalar(2 * incidentDir.dot(normal))).normalize()
}

// Find ray-segment intersection
const raySegmentIntersection = (rayStart: THREE.Vector2, rayDir: THREE.Vector2, p1: THREE.Vector2, p2: THREE.Vector2): { point: THREE.Vector2; t: number } | null => {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const denom = rayDir.x * dy - rayDir.y * dx

  if (Math.abs(denom) < 0.0001) return null

  const t = ((p1.x - rayStart.x) * dy - (p1.y - rayStart.y) * dx) / denom
  const s = ((p1.x - rayStart.x) * rayDir.y - (p1.y - rayStart.y) * rayDir.x) / denom

  if (t > 0.001 && s >= 0 && s <= 1) {
    return {
      point: rayStart.clone().add(rayDir.clone().multiplyScalar(t)),
      t,
    }
  }
  return null
}

// Build 2D segment definitions for each element
const buildSegments = (elements: SpawnedElement[]): Segment[] => {
  const segments: Segment[] = []
  const scale = 2

  elements.forEach((el) => {
    const cos = Math.cos(el.rotation)
    const sin = Math.sin(el.rotation)
    const rotate = (x: number, y: number) => new THREE.Vector2(x * cos - y * sin + el.position[0], x * sin + y * cos + el.position[1])

    switch (el.type) {
      case 'flatGlass': {
        const h = 2 * scale
        const w = 1.2 * scale
        const p1 = rotate(-w / 2, -h / 2)
        const p2 = rotate(w / 2, -h / 2)
        const p3 = rotate(w / 2, h / 2)
        const p4 = rotate(-w / 2, h / 2)

        // Front and back surfaces for refraction
        segments.push({
          p1,
          p2,
          normal: new THREE.Vector2(-sin, cos),
          elementId: el.id,
          type: 'surface',
          ior: 1.5,
        })
        segments.push({
          p1: p3,
          p2: p4,
          normal: new THREE.Vector2(sin, -cos),
          elementId: el.id,
          type: 'surface',
          ior: 1.5,
        })
        break
      }

      case 'prism': {
        const h = 2.5 * scale
        const w = 1.5 * scale
        const p1 = rotate(0, h / 2)
        const p2 = rotate(-w / 2, -h / 2)
        const p3 = rotate(w / 2, -h / 2)

        // Three surfaces of prism
        const edge1Normal = new THREE.Vector2(p2.y - p1.y, p1.x - p2.x).normalize()
        const edge2Normal = new THREE.Vector2(p3.y - p2.y, p2.x - p3.x).normalize()
        const edge3Normal = new THREE.Vector2(p1.y - p3.y, p3.x - p1.x).normalize()

        segments.push({ p1, p2, normal: edge1Normal, elementId: el.id, type: 'surface', ior: 1.5 })
        segments.push({ p1: p2, p2: p3, normal: edge2Normal, elementId: el.id, type: 'surface', ior: 1.5 })
        segments.push({ p1: p3, p2: p1, normal: edge3Normal, elementId: el.id, type: 'surface', ior: 1.5 })
        break
      }

      case 'concaveMirror':
      case 'convexMirror': {
        const r = 1.5 * scale
        // Approximate circular mirror as 8 line segments
        for (let i = 0; i < 8; i++) {
          const a1 = (i / 8) * Math.PI
          const a2 = ((i + 1) / 8) * Math.PI
          const p1 = rotate(r * Math.cos(a1), r * Math.sin(a1))
          const p2 = rotate(r * Math.cos(a2), r * Math.sin(a2))
          const midAngle = (a1 + a2) / 2
          const normal = new THREE.Vector2(Math.cos(midAngle), Math.sin(midAngle)).normalize()

          segments.push({
            p1,
            p2,
            normal: el.type === 'convexMirror' ? normal : normal.multiplyScalar(-1),
            elementId: el.id,
            type: 'mirror',
            ior: 1,
          })
        }
        break
      }

      case 'convexLens':
      case 'concaveLens': {
        const r = 1.3 * scale
        // Approximate lens as curved surface with segments
        for (let i = 0; i < 8; i++) {
          const a1 = (i / 8) * Math.PI
          const a2 = ((i + 1) / 8) * Math.PI
          const p1 = rotate(r * Math.cos(a1), r * Math.sin(a1))
          const p2 = rotate(r * Math.cos(a2), r * Math.sin(a2))
          const midAngle = (a1 + a2) / 2
          const normal = new THREE.Vector2(Math.cos(midAngle), Math.sin(midAngle)).normalize()

          segments.push({
            p1,
            p2,
            normal: el.type === 'convexLens' ? normal : normal.multiplyScalar(-1),
            elementId: el.id,
            type: 'surface',
            ior: 1.5,
          })
        }
        break
      }
    }
  })

  return segments
}

// Main raytracing function
const calculateLaserPath = (laserPos: [number, number], laserAngle: number, elements: SpawnedElement[]): THREE.Vector3[] => {
  const path: THREE.Vector3[] = []
  const segments = buildSegments(elements)

  let ray: Ray = {
    start: new THREE.Vector2(laserPos[0], laserPos[1]),
    direction: new THREE.Vector2(Math.cos(laserAngle), Math.sin(laserAngle)).normalize(),
    ior: 1,
    bounces: 0,
  }

  path.push(new THREE.Vector3(ray.start.x, ray.start.y, 0))

  const MAX_BOUNCES = 10
  while (ray.bounces < MAX_BOUNCES) {
    let closestHit: { point: THREE.Vector2; t: number; segment: Segment } | null = null
    let closestT = Infinity

    for (const seg of segments) {
      const hit = raySegmentIntersection(ray.start, ray.direction, seg.p1, seg.p2)
      if (hit && hit.t < closestT) {
        closestT = hit.t
        closestHit = { ...hit, segment: seg }
      }
    }

    if (!closestHit || closestT > 50) break

    path.push(new THREE.Vector3(closestHit.point.x, closestHit.point.y, 0))

    if (closestHit.segment.type === 'mirror') {
      const newDir = calculateReflection(ray.direction, closestHit.segment.normal)
      ray = {
        start: closestHit.point.clone().add(newDir.clone().multiplyScalar(0.01)),
        direction: newDir,
        ior: ray.ior,
        bounces: ray.bounces + 1,
      }
    } else {
      const newDir = calculateRefraction(ray.direction, closestHit.segment.normal, ray.ior, closestHit.segment.ior)
      if (newDir) {
        ray = {
          start: closestHit.point.clone().add(newDir.clone().multiplyScalar(0.01)),
          direction: newDir,
          ior: closestHit.segment.ior,
          bounces: ray.bounces + 1,
        }
      } else {
        // Total internal reflection
        const reflectedDir = calculateReflection(ray.direction, closestHit.segment.normal)
        ray = {
          start: closestHit.point.clone().add(reflectedDir.clone().multiplyScalar(0.01)),
          direction: reflectedDir,
          ior: ray.ior,
          bounces: ray.bounces + 1,
        }
      }
    }
  }

  // Extend final ray
  if (path.length > 1) {
    const lastPoint = path[path.length - 1]
    const lastVec = new THREE.Vector2(ray.direction.x, ray.direction.y).multiplyScalar(50)
    path.push(new THREE.Vector3(lastPoint.x + lastVec.x, lastPoint.y + lastVec.y, 0))
  }

  return path
}

function OpticsScene({ elements, laserAngle }: { elements: SpawnedElement[]; laserAngle: number }) {
  const { camera } = useThree()
  const laserPath = useMemo(() => calculateLaserPath([0, 0], laserAngle, elements), [elements, laserAngle])

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

      {/* Background */}
      <mesh position={[0, 0, -1]} receiveShadow>
        <planeGeometry args={[60, 50]} />
        <meshStandardMaterial color={0x0d1b2a} />
      </mesh>

      <gridHelper args={[50, 50, 0x2a4a6a, 0x1a3a5a]} />

      {/* Laser emitter */}
      <group position={[0, 0, 0.8]} rotation={[0, 0, laserAngle]} castShadow>
        <mesh castShadow>
          <boxGeometry args={[1.5, 0.6, 0.5]} />
          <meshStandardMaterial color={0xff3333} emissive={0xff0000} emissiveIntensity={3} />
        </mesh>
        <mesh position={[1, 0, 0]} castShadow>
          <sphereGeometry args={[0.4, 20, 20]} />
          <meshStandardMaterial color={0xffdd00} emissive={0xffaa00} emissiveIntensity={5} toneMapped={false} />
        </mesh>
      </group>

      {/* Optical elements (2.5D using ExtrudeGeometry) */}
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

        return (
          <mesh key={el.id} position={[el.position[0], el.position[1], 0.3]} rotation={[0, 0, el.rotation]} castShadow receiveShadow>
            <extrudeGeometry args={[shape, { depth: 1, bevelEnabled: false }]} />
            <meshStandardMaterial
              color={el.type.includes('Mirror') ? 0xcccccc : 0x4a9eff}
              metalness={el.type.includes('Mirror') ? 0.95 : 0.3}
              roughness={el.type.includes('Mirror') ? 0.05 : 0.4}
              transparent
              opacity={el.type.includes('Mirror') ? 1 : 0.7}
            />
          </mesh>
        )
      })}

      {/* Laser path */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={laserPath.length}
            array={new Float32Array(laserPath.flatMap((p) => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xff0000} linewidth={4} toneMapped={false} />
      </line>
    </>
  )
}

export function LightRefractionLab() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [elements, setElements] = useState<SpawnedElement[]>([])
  const [laserAngle, setLaserAngle] = useState(0)

  const opticalTools = [
    { id: 'flatGlass', label: t('optical_flat_glass'), icon: '📦' },
    { id: 'prism', label: t('optical_prism'), icon: '🔺' },
    { id: 'convexLens', label: t('optical_convex_lens'), icon: '◯' },
    { id: 'concaveLens', label: t('optical_concave_lens'), icon: '⊘' },
    { id: 'concaveMirror', label: t('optical_concave_mirror'), icon: '⌢' },
    { id: 'convexMirror', label: t('optical_convex_mirror'), icon: '⌣' },
  ]

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('elementType', type)
  }

  const handleDrop = (e: React.DragEvent, canvasRef: HTMLDivElement) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('elementType') as Exclude<ElementType, 'laser'>
    const rect = canvasRef.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 50 - 25
    const y = -((e.clientY - rect.top) / rect.height) * 40 + 20

    const newElement: SpawnedElement = {
      id: `${type}-${Date.now()}`,
      type,
      position: [x, y],
      rotation: Math.random() * Math.PI * 2,
      ior: 1.5,
    }
    setElements((prev) => [...prev, newElement])
  }

  const canvasRef = useRef<HTMLDivElement>(null)

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#0a0a1a', display: 'flex', flexDirection: 'column' }}>
      <div
        ref={canvasRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, canvasRef.current!)}
        style={{ flex: 1 }}
      >
        <Canvas orthographic camera={{ position: [0, 0, 40], zoom: 1 }} style={{ width: '100%', height: '100%' }}>
          <OpticsScene elements={elements} laserAngle={laserAngle} />
        </Canvas>

        <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(10, 10, 26, 0.97)', border: '2px solid #4a9eff', borderRadius: '12px', padding: '1.5rem', color: '#fff', maxWidth: '340px', fontSize: '13px', backdropFilter: 'blur(12px)', zIndex: 100 }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '16px', color: '#66ccff', fontWeight: '700' }}>💡 Laser Physics</h2>
          <p style={{ margin: '0 0 1rem 0', fontSize: '12px', color: '#aaa' }}>Drag optical elements onto canvas. Laser bends with Snell's Law.</p>
          <div style={{ fontSize: '11px', color: '#888', lineHeight: '1.8' }}>
            <div>🎯 Drag elements from palette</div>
            <div>🔄 Laser reflects and refracts</div>
            <div>🌊 Snell's Law: n₁sin(θ₁) = n₂sin(θ₂)</div>
          </div>
        </div>

        <button onClick={() => navigate('/optics')} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 100, padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
          {t('back_button')}
        </button>
      </div>

      <div style={{ background: 'rgba(10, 10, 26, 0.98)', border: '2px solid #4a9eff', borderBottom: 'none', borderRadius: '16px 16px 0 0', padding: '1rem', display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap', zIndex: 50 }}>
        {opticalTools.map((tool) => (
          <div key={tool.id} draggable onDragStart={(e) => handleDragStart(e, tool.id)} style={{ padding: '0.7rem 1rem', background: '#1a2a3a', border: '2px solid #4a9eff', borderRadius: '8px', color: '#fff', cursor: 'grab', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem', userSelect: 'none' }}>
            <span style={{ fontSize: '16px' }}>{tool.icon}</span>
            {tool.label}
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: '6rem', left: '1rem', background: 'rgba(10, 10, 26, 0.97)', border: '2px solid #4a9eff', borderRadius: '12px', padding: '1rem', zIndex: 100, maxWidth: '250px' }}>
        <label style={{ color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Laser Angle: {(laserAngle * 180 / Math.PI).toFixed(0)}°
          <input type="range" min="0" max={Math.PI * 2} step="0.01" value={laserAngle} onChange={(e) => setLaserAngle(parseFloat(e.target.value))} style={{ width: '100px' }} />
        </label>
      </div>
    </div>
  )
}
