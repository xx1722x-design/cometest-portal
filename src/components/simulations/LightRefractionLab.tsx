import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'

type ElementType = 'laser' | 'flatGlass' | 'prism' | 'convexLens' | 'concaveLens' | 'concaveMirror' | 'convexMirror'
type LaserMode = 'single' | 'triple'

interface WorkspaceElement {
  id: string
  type: ElementType
  position: [number, number]
  rotation: number
  scale: number
}

interface LaserEmitter extends WorkspaceElement {
  type: 'laser'
  mode: LaserMode
}

function Workbench({ laser }: { laser: LaserEmitter }) {
  const { camera } = useThree()
  const raysRef = useRef<THREE.LineSegments>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.position.z = 40
      const width = 40
      const height = 30
      camera.left = -width / 2
      camera.right = width / 2
      camera.top = height / 2
      camera.bottom = -height / 2
      camera.updateProjectionMatrix()
    }
  }, [camera])

  const calculateRays = useCallback(() => {
    const rays: { start: THREE.Vector3; direction: THREE.Vector3; color: number }[] = []
    const laserDir = new THREE.Vector3(Math.cos(laser.rotation), Math.sin(laser.rotation), 0)
    const laserPos = new THREE.Vector3(laser.position[0], laser.position[1], 0)

    const beamCount = laser.mode === 'single' ? 1 : 3
    const beamOffsets = laser.mode === 'single' ? [0] : [-0.5, 0, 0.5]

    beamOffsets.forEach((offset) => {
      const perpOffset = new THREE.Vector3(-Math.sin(laser.rotation), Math.cos(laser.rotation), 0).multiplyScalar(offset * 0.3)
      const start = laserPos.clone().add(perpOffset)
      const dir = laserDir.clone()
      rays.push({ start, direction: dir, color: 0xff0000 })
    })

    return rays
  }, [laser])

  useFrame(() => {
    const rays = calculateRays()
    if (raysRef.current) {
      const positions: number[] = []
      rays.forEach((ray) => {
        positions.push(ray.start.x, ray.start.y, ray.start.z)
        const endPoint = ray.start.clone().add(ray.direction.clone().multiplyScalar(20))
        positions.push(endPoint.x, endPoint.y, endPoint.z)
      })

      const geometry = raysRef.current.geometry as THREE.BufferGeometry
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
      if (geometry.attributes.position) {
        geometry.attributes.position.needsUpdate = true
      }
    }
  })

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[20, 20, 15]} intensity={1.5} />

      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color={0x0d1b2a} roughness={0.8} metalness={0.1} />
      </mesh>

      <gridHelper args={[40, 40, 0x2a4a6a, 0x1a3a5a]} position={[0, 0, 0.01]} />

      <group position={[laser.position[0], laser.position[1], 0.1]} rotation={[0, 0, laser.rotation]}>
        <mesh>
          <boxGeometry args={[1, 0.4, 0.2]} />
          <meshStandardMaterial color={0xff6b6b} emissive={0xff3333} emissiveIntensity={0.8} metalness={0.6} />
        </mesh>
        <mesh position={[0.7, 0, 0]}>
          <sphereGeometry args={[0.25, 12, 12]} />
          <meshStandardMaterial color={0xffcc00} emissive={0xff8800} emissiveIntensity={1} />
        </mesh>
      </group>

      <lineSegments ref={raysRef} position={[0, 0, 0.05]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={0} array={new Float32Array(0)} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color={0xff4444} linewidth={2} />
      </lineSegments>
    </>
  )
}

export function LightRefractionLab() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [laser, setLaser] = useState<LaserEmitter>({
    id: 'laser-1',
    type: 'laser',
    position: [-15, 0],
    rotation: 0,
    scale: 1,
    mode: 'single',
  })
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    dragStartRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStartRef.current || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top
    const deltaX = currentX - dragStartRef.current.x
    const deltaY = currentY - dragStartRef.current.y

    if ((e.buttons & 1) === 1) {
      // Left button down - move laser
      setLaser((prev) => ({
        ...prev,
        position: [prev.position[0] + deltaX * 0.01, prev.position[1] - deltaY * 0.01],
      }))
    } else if ((e.buttons & 2) === 2) {
      // Right button down - rotate laser
      setLaser((prev) => ({
        ...prev,
        rotation: prev.rotation + deltaX * 0.01,
      }))
    }

    dragStartRef.current = { x: currentX, y: currentY }
  }

  const handleMouseUp = () => {
    dragStartRef.current = null
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
      <div
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{ flex: 1, position: 'relative', cursor: 'grab' }}
      >
        <Canvas orthographic camera={{ position: [0, 0, 40], zoom: 1 }} style={{ width: '100%', height: '100%' }}>
          <Workbench laser={laser} />
        </Canvas>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          background: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #4a9eff',
          borderRadius: '12px',
          padding: '1.5rem',
          color: '#fff',
          fontFamily: "'Segoe UI', sans-serif",
          maxWidth: '320px',
          fontSize: '13px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(74, 158, 255, 0.2)',
          zIndex: 100,
        }}
      >
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '16px', color: '#66ccff', fontWeight: '700' }}>💡 {t('light_refraction_title')}</h2>
        <p style={{ margin: '0 0 0.75rem 0', fontSize: '12px', color: '#aaa' }}>{t('light_refraction_content')}</p>
        <div style={{ marginTop: '1rem', fontSize: '11px', color: '#888', lineHeight: '1.8' }}>
          <div>🖱️ {t('left_drag')}</div>
          <div>🔄 {t('right_drag')}</div>
          <div>📦 {t('optical_elements')}</div>
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
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(74, 158, 255, 0.3)',
          zIndex: 100,
          maxWidth: '90vw',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {opticalTools.map((tool) => (
            <button
              key={tool.id}
              style={{
                padding: '0.6rem 1rem',
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
                e.currentTarget.style.boxShadow = `0 0 12px ${tool.color}80`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a2a3a'
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.boxShadow = 'none'
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
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'
        }}
      >
        {t('back_button')}
      </button>
    </div>
  )
}
