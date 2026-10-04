import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type OpticalType = 'convex' | 'concave' | 'flat' | 'circle' | 'triangle'

interface Laser {
  id: string
  x: number
  y: number
  angle: number
  type?: never
}

interface OpticalElement {
  id: string
  type: OpticalType
  x: number
  y: number
  angle: number
}

type DrawableObject = Laser | OpticalElement

export function LightRefractionLab() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [objects, setObjects] = useState<DrawableObject[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const rayPathsRef = useRef<Record<string, [number, number][]>>({})
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const isLaser = (obj: DrawableObject): obj is Laser => !('type' in obj)

  // ===== PURE 2D PHYSICS =====
  const dot = (a: [number, number], b: [number, number]) => a[0] * b[0] + a[1] * b[1]

  const normalize = (v: [number, number]): [number, number] => {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1])
    return len === 0 ? [0, 0] : [v[0] / len, v[1] / len]
  }

  const rayCircleIntersections = (
    rayStart: [number, number],
    rayDir: [number, number],
    circleCenter: [number, number],
    radius: number
  ): Array<{ point: [number, number]; normal: [number, number]; t: number }> => {
    try {
      const dx = rayStart[0] - circleCenter[0]
      const dy = rayStart[1] - circleCenter[1]
      const a = rayDir[0] * rayDir[0] + rayDir[1] * rayDir[1]
      const b = 2 * (dx * rayDir[0] + dy * rayDir[1])
      const c = dx * dx + dy * dy - radius * radius
      const disc = b * b - 4 * a * c

      if (disc < 0) return []

      const sqrtDisc = Math.sqrt(disc)
      const t1 = (-b - sqrtDisc) / (2 * a)
      const t2 = (-b + sqrtDisc) / (2 * a)

      const results = []

      if (t1 > 0.001) {
        const point: [number, number] = [rayStart[0] + rayDir[0] * t1, rayStart[1] + rayDir[1] * t1]
        const nx = point[0] - circleCenter[0]
        const ny = point[1] - circleCenter[1]
        const len = Math.sqrt(nx * nx + ny * ny)
        if (len > 0) {
          const normal: [number, number] = [nx / len, ny / len]
          results.push({ point, normal, t: t1 })
        }
      }

      if (t2 > 0.001 && Math.abs(t2 - t1) > 0.001) {
        const point: [number, number] = [rayStart[0] + rayDir[0] * t2, rayStart[1] + rayDir[1] * t2]
        const nx = point[0] - circleCenter[0]
        const ny = point[1] - circleCenter[1]
        const len = Math.sqrt(nx * nx + ny * ny)
        if (len > 0) {
          const normal: [number, number] = [nx / len, ny / len]
          results.push({ point, normal, t: t2 })
        }
      }

      return results.sort((a, b) => a.t - b.t)
    } catch (e) {
      return []
    }
  }

  const snellRefract = (rayDir: [number, number], surfaceNormal: [number, number], n1: number, n2: number): [number, number] | null => {
    try {
      const dotProd = dot(rayDir, surfaceNormal)
      let normal = surfaceNormal
      let cosTheta1 = -dotProd

      if (cosTheta1 < 0) {
        normal = [-surfaceNormal[0], -surfaceNormal[1]]
        cosTheta1 = -cosTheta1
      }

      const ratio = n1 / n2
      const sinTheta1Sq = 1 - cosTheta1 * cosTheta1
      const sinTheta2Sq = ratio * ratio * sinTheta1Sq

      if (sinTheta2Sq > 1) return null

      const cosTheta2 = Math.sqrt(1 - sinTheta2Sq)
      const t = ratio * cosTheta1 - cosTheta2
      return [ratio * rayDir[0] + t * normal[0], ratio * rayDir[1] + t * normal[1]]
    } catch (e) {
      return null
    }
  }

  const traceRay2D = (start: [number, number], dir: [number, number], elements: OpticalElement[]): [number, number][] => {
    try {
      const EPSILON = 0.0001
      const MAX_BOUNCES = 6
      const MAX_DISTANCE = 800

      const path: [number, number][] = [start]
      let currentRay = { pos: start, dir: normalize(dir), ior: 1, bounces: 0, lastElemId: '' }

      for (let bounceCount = 0; bounceCount < MAX_BOUNCES; bounceCount++) {
        let closestHit: { point: [number, number]; normal: [number, number]; t: number; elemId: string } | null = null
        let closestT = MAX_DISTANCE

        for (const elem of elements) {
          if (elem.id === currentRay.lastElemId) continue

          if (elem.type === 'convex' || elem.type === 'concave') {
            const offset = elem.type === 'convex' ? 8 : -8
            const c1: [number, number] = [elem.x - offset, elem.y]
            const c2: [number, number] = [elem.x + offset, elem.y]

            const hits1 = rayCircleIntersections(currentRay.pos, currentRay.dir, c1, 20)
            if (hits1.length > 0 && hits1[0].t < closestT && hits1[0].t > 0.0001) {
              closestT = hits1[0].t
              closestHit = { ...hits1[0], elemId: elem.id }
            }

            const hits2 = rayCircleIntersections(currentRay.pos, currentRay.dir, c2, 20)
            if (hits2.length > 0 && hits2[0].t < closestT && hits2[0].t > 0.0001) {
              closestT = hits2[0].t
              closestHit = { ...hits2[0], elemId: elem.id }
            }
          } else if (elem.type === 'circle') {
            const c: [number, number] = [elem.x, elem.y]
            const hits = rayCircleIntersections(currentRay.pos, currentRay.dir, c, 15)
            if (hits.length > 0 && hits[0].t < closestT && hits[0].t > 0.0001) {
              closestT = hits[0].t
              closestHit = { ...hits[0], elemId: elem.id }
            }
          }
        }

        if (!closestHit || closestT >= MAX_DISTANCE) {
          const endPoint: [number, number] = [
            currentRay.pos[0] + currentRay.dir[0] * 3000,
            currentRay.pos[1] + currentRay.dir[1] * 3000
          ]
          path.push(endPoint)
          break
        }

        path.push(closestHit.point)

        let newPos: [number, number]
        let newDir: [number, number]
        let newIor: number
        let refracted: [number, number] | null = null

        if (currentRay.ior === 1) {
          refracted = snellRefract(currentRay.dir, closestHit.normal, 1, 1.5)
          if (refracted) {
            newDir = normalize(refracted)
            newPos = [closestHit.point[0] + newDir[0] * EPSILON, closestHit.point[1] + newDir[1] * EPSILON]
            newIor = 1.5
          } else {
            newDir = normalize([
              currentRay.dir[0] - 2 * dot(currentRay.dir, closestHit.normal) * closestHit.normal[0],
              currentRay.dir[1] - 2 * dot(currentRay.dir, closestHit.normal) * closestHit.normal[1]
            ])
            newPos = [closestHit.point[0] + newDir[0] * EPSILON, closestHit.point[1] + newDir[1] * EPSILON]
            newIor = 1
          }
        } else {
          refracted = snellRefract(currentRay.dir, closestHit.normal, 1.5, 1)
          if (refracted) {
            newDir = normalize(refracted)
            newPos = [closestHit.point[0] + newDir[0] * EPSILON, closestHit.point[1] + newDir[1] * EPSILON]
            newIor = 1
          } else {
            newDir = normalize([
              currentRay.dir[0] - 2 * dot(currentRay.dir, closestHit.normal) * closestHit.normal[0],
              currentRay.dir[1] - 2 * dot(currentRay.dir, closestHit.normal) * closestHit.normal[1]
            ])
            newPos = [closestHit.point[0] + newDir[0] * EPSILON, closestHit.point[1] + newDir[1] * EPSILON]
            newIor = 1.5
          }
        }

        currentRay = {
          pos: newPos,
          dir: newDir,
          ior: newIor,
          bounces: currentRay.bounces + 1,
          lastElemId: currentRay.ior === 1 ? closestHit.elemId : ''
        }
      }

      return path
    } catch (e) {
      return [start, [start[0] + dir[0] * 3000, start[1] + dir[1] * 3000]]
    }
  }

  // Physics calculation - update ref
  useEffect(() => {
    const timer = setTimeout(() => {
      const opticalElements = objects.filter(obj => !isLaser(obj)) as OpticalElement[]
      const newPaths: Record<string, [number, number][]> = {}

      for (const obj of objects) {
        if (isLaser(obj)) {
          const rayDir: [number, number] = [Math.cos(obj.angle), Math.sin(obj.angle)]
          const rayStart: [number, number] = [obj.x + 20, obj.y]
          newPaths[obj.id] = traceRay2D(rayStart, rayDir, opticalElements)
        }
      }

      rayPathsRef.current = newPaths
    }, 0)
    return () => clearTimeout(timer)
  }, [objects])

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    try {
      ctx.fillStyle = '#f5ede4'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = '#e0d5c8'
      ctx.lineWidth = 0.5
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      for (const obj of objects) {
        if (isLaser(obj)) {
          ctx.fillStyle = '#333'
          ctx.fillRect(obj.x - 12, obj.y - 8, 24, 16)
          ctx.fillStyle = '#ff3333'
          ctx.beginPath()
          ctx.arc(obj.x + 15, obj.y, 5, 0, Math.PI * 2)
          ctx.fill()

          const rayPath = rayPathsRef.current[obj.id]
          if (rayPath && rayPath.length > 0) {
            ctx.strokeStyle = '#ff1a4d'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(rayPath[0][0], rayPath[0][1])
            for (let i = 1; i < rayPath.length; i++) {
              ctx.lineTo(rayPath[i][0], rayPath[i][1])
            }
            ctx.stroke()
          }
        } else {
          ctx.save()
          ctx.translate(obj.x, obj.y)
          ctx.rotate(obj.angle)

          ctx.fillStyle = '#4db8cc'

          if (obj.type === 'convex') {
            ctx.beginPath()
            ctx.arc(-8, 0, 20, 0, Math.PI * 2)
            ctx.arc(8, 0, 20, 0, Math.PI * 2)
            ctx.fill()
          } else if (obj.type === 'concave') {
            ctx.fillStyle = '#999'
            ctx.fillRect(-20, -25, 40, 50)
            ctx.fillStyle = '#f5ede4'
            ctx.beginPath()
            ctx.arc(-15, 0, 18, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(15, 0, 18, 0, Math.PI * 2)
            ctx.fill()
          } else if (obj.type === 'flat') {
            ctx.fillRect(-8, -30, 16, 60)
          } else if (obj.type === 'circle') {
            ctx.beginPath()
            ctx.arc(0, 0, 15, 0, Math.PI * 2)
            ctx.fill()
          } else if (obj.type === 'triangle') {
            ctx.beginPath()
            ctx.moveTo(0, -25)
            ctx.lineTo(-20, 20)
            ctx.lineTo(20, 20)
            ctx.closePath()
            ctx.fill()
          }

          ctx.restore()
        }

        if (selectedId === obj.id) {
          ctx.strokeStyle = '#ff6600'
          ctx.lineWidth = 2
          ctx.strokeRect(obj.x - 25, obj.y - 25, 50, 50)
        }
      }
    } catch (err) {
      console.error('Canvas error:', err)
    }
  }, [objects, selectedId])

  const handleDragStart = (e: React.DragEvent, itemType: string) => {
    e.dataTransfer!.effectAllowed = 'copy'
    e.dataTransfer!.setData('itemType', itemType)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const itemType = e.dataTransfer?.getData('itemType')
    if (!itemType || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (itemType === 'Laser') {
      const laser: Laser = { id: `laser-${Date.now()}`, x, y, angle: 0 }
      setObjects(prev => [...prev, laser])
    } else {
      const elem: OpticalElement = { id: `elem-${Date.now()}`, type: itemType.toLowerCase() as OpticalType, x, y, angle: 0 }
      setObjects(prev => [...prev, elem])
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    for (const obj of objects) {
      if (Math.hypot(obj.x - x, obj.y - y) < 30) {
        setDraggingId(obj.id)
        setSelectedId(obj.id)
        dragOffsetRef.current = { x: obj.x - x, y: obj.y - y }
        return
      }
    }
    setSelectedId(null)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setObjects(prev =>
      prev.map(obj =>
        obj.id === draggingId ? { ...obj, x: x + dragOffsetRef.current.x, y: y + dragOffsetRef.current.y } : obj
      )
    )
  }

  const handleMouseUp = () => {
    setDraggingId(null)
  }

  const handleDelete = () => {
    setObjects(prev => prev.filter(obj => obj.id !== selectedId))
    setSelectedId(null)
  }

  const handleRotate = () => {
    setObjects(prev =>
      prev.map(obj => (obj.id === selectedId ? { ...obj, angle: obj.angle + Math.PI / 6 } : obj))
    )
  }

  const selectedObj = selectedId ? objects.find(obj => obj.id === selectedId) : null

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', position: 'relative' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <canvas
          ref={canvasRef}
          width={1400}
          height={650}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ flex: 1, border: '1px solid #ddd', cursor: draggingId ? 'grabbing' : 'pointer' }}
        />
      </div>

      <div style={{ background: '#f5ede4', padding: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap', borderTop: '1px solid #ddd' }}>
        {['Laser', 'Convex', 'Concave', 'Flat', 'Circle', 'Triangle'].map(type => (
          <button
            key={type}
            draggable
            onDragStart={e => handleDragStart(e, type)}
            style={{ padding: '8px 12px', background: type === 'Laser' ? '#333' : '#4db8cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'grab' }}
          >
            {type}
          </button>
        ))}
      </div>

      {selectedObj && (
        <div
          style={{
            position: 'absolute',
            left: `${selectedObj.x + 30}px`,
            top: `${selectedObj.y - 20}px`,
            display: 'flex',
            gap: '4px',
            zIndex: 100
          }}
        >
          <button onClick={handleRotate} style={{ padding: '6px 10px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            ↻ Rotate
          </button>
          <button onClick={handleDelete} style={{ padding: '6px 10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            🗑 Delete
          </button>
        </div>
      )}

      <button
        onClick={() => navigate('/optics')}
        style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', zIndex: 10 }}
      >
        ← Back
      </button>
    </div>
  )
}
