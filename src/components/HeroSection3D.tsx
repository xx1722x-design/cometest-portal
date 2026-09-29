import { useEffect, useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { Group, Box3, Vector3 } from 'three'
import { selectRandomAssets, SpaceAsset } from '../config/spaceAssets'
import { playPanelBeep } from '../lib/sciFiFx'
import WebGLErrorBoundary from './WebGLErrorBoundary'

interface Model3DProps {
  modelPath: string
  targetPosition: [number, number, number]
  rotationSpeed: number
}

function Model3D({ modelPath, targetPosition, rotationSpeed }: Model3DProps) {
  const gltf = useGLTF(modelPath)
  const groupRef = useRef<Group>(null)
  const [adjustedScale, setAdjustedScale] = useState(1)

  useEffect(() => {
    if (!gltf.scene) return

    const box = new Box3().setFromObject(gltf.scene)
    const size = box.getSize(new Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = maxDim > 0 ? 3 / maxDim : 1

    setAdjustedScale(scale)

    // 원점 중심으로 정렬
    const center = box.getCenter(new Vector3())
    gltf.scene.position.sub(center)
  }, [gltf])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += rotationSpeed * 0.5
      groupRef.current.rotation.y += rotationSpeed
      groupRef.current.position.y = targetPosition[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.3
    }
  })

  if (!gltf.scene) return null

  return (
    <group ref={groupRef} position={targetPosition} scale={adjustedScale}>
      <primitive object={gltf.scene} />
    </group>
  )
}

interface HeroSection3DContentProps {
  assets: SpaceAsset[]
}

function HeroSection3DContent({ assets }: HeroSection3DContentProps) {
  return (
    <>
      {/* 강화된 조명 시스템 */}
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight position={[10, 15, 10]} intensity={1.5} color="#fff9e6" castShadow />
      <pointLight position={[5, 8, 5]} intensity={1.2} color="#ffccff" distance={30} />
      <pointLight position={[-8, 6, -8]} intensity={1} color="#ccffff" distance={30} />
      <pointLight position={[0, 3, 10]} intensity={0.8} color="#ffdddd" distance={25} />

      {/* 첫 번째 에셋 - 좌측 */}
      <Suspense fallback={null}>
        <Model3D
          modelPath={`/models/${assets[0]}`}
          targetPosition={[-2.5, 0.2, 0]}
          rotationSpeed={0.01}
        />
      </Suspense>

      {/* 두 번째 에셋 - 우측 */}
      <Suspense fallback={null}>
        <Model3D
          modelPath={`/models/${assets[1]}`}
          targetPosition={[2.5, 0.2, -0.5]}
          rotationSpeed={0.008}
        />
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
    </>
  )
}

interface HeroSection3DProps {
  isDarkMode: boolean
}

export function HeroSection3D({ isDarkMode }: HeroSection3DProps) {
  const [selectedAssets, setSelectedAssets] = useState<SpaceAsset[]>([])

  useEffect(() => {
    const assets = selectRandomAssets(2)
    setSelectedAssets(assets)
  }, [])

  if (selectedAssets.length === 0) {
    return null
  }

  const bgColor = isDarkMode ? '#0a0a0a' : '#f5f5f5'
  const canvasBgColor = isDarkMode ? '#0d1117' : '#f9f9f9'

  return (
    <div
      style={{
        backgroundColor: bgColor,
        borderBottom: isDarkMode ? '1px solid #1a1a1a' : '1px solid #e0e0e0',
        padding: '3rem 2rem',
        transition: 'all 0.3s ease',
      }}
    >
      {/* 텍스트 섹션 */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '2.5rem',
          color: isDarkMode ? '#ffffff' : '#1a1a1a',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: isDarkMode ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.1)',
            border: '1px solid #7c3aed',
            borderRadius: '24px',
            marginBottom: '1.5rem',
          }}
        >
          <span style={{ color: '#7c3aed', fontSize: '14px', fontWeight: '600' }}>
            ✨ Educational Content Platform
          </span>
        </div>
        <h2
          style={{
            margin: '0 0 1rem 0',
            fontSize: '48px',
            fontWeight: '800',
            background: isDarkMode
              ? 'linear-gradient(135deg, #ffffff 0%, #a0aec0 100%)'
              : 'linear-gradient(135deg, #1a1a1a 0%, #4a5568 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          Explore the Universe of Learning
        </h2>
        <p
          style={{
            fontSize: '18px',
            color: isDarkMode ? '#c0c0c0' : '#555555',
            maxWidth: '700px',
            margin: '0 auto 2.5rem',
            lineHeight: '1.7',
          }}
        >
          Discover interactive simulations, 3D visualizations, and educational games
        </p>
      </div>

      {/* 3D Canvas */}
      <div
        style={{
          width: '100%',
          height: '450px',
          backgroundColor: canvasBgColor,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: isDarkMode
            ? '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 20px 60px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
          marginBottom: '2rem',
        }}
      >
        <WebGLErrorBoundary>
          <Canvas camera={{ position: [0, 1.5, 7], fov: 55 }} dpr={[1, 2]}>
            <color attach="background" args={[canvasBgColor]} />
            <HeroSection3DContent assets={selectedAssets} />
          </Canvas>
        </WebGLErrorBoundary>
      </div>

      {/* CTA 및 Store 링크 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <a
          href="https://store.cometest.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playPanelBeep()}
          style={{
            padding: '0.875rem 2rem',
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '15px',
            transition: 'all 0.3s ease',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#6d28d9'
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(124,58,237,0.6)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#7c3aed'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(124,58,237,0.4)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          🛒 Visit Asset Store
        </a>
      </div>

      {/* 에셋 정보 */}
      <div
        style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '13px',
          color: isDarkMode ? '#666666' : '#999999',
        }}
      >
        <p style={{ margin: 0 }}>Today's featured assets: {selectedAssets.join(', ')}</p>
      </div>
    </div>
  )
}
