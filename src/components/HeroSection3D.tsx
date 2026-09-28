import { useEffect, useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { Group } from 'three'
import { selectRandomAssets, SpaceAsset } from '../config/spaceAssets'

// 3D 모델 컴포넌트
interface Model3DProps {
  modelPath: string
  position: [number, number, number]
  scale: number
  rotationSpeed: number
}

function Model3D({ modelPath, position, scale, rotationSpeed }: Model3DProps) {
  const gltf = useGLTF(modelPath)
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += rotationSpeed * 0.5
      groupRef.current.rotation.y += rotationSpeed
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.3
    }
  })

  if (!gltf) return null

  return (
    <group ref={groupRef} position={position} scale={scale}>
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
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, 5, -10]} intensity={0.4} />

      {/* 첫 번째 에셋 - 좌측 */}
      <Suspense fallback={null}>
        <Model3D
          modelPath={`/models/${assets[0]}`}
          position={[-3, 0, 0]}
          scale={1.2}
          rotationSpeed={0.01}
        />
      </Suspense>

      {/* 두 번째 에셋 - 우측 */}
      <Suspense fallback={null}>
        <Model3D
          modelPath={`/models/${assets[1]}`}
          position={[3, 0.5, 0]}
          scale={1}
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
    // 페이지 마운트 시 랜덤으로 2개 에셋 선택
    const assets = selectRandomAssets(2)
    setSelectedAssets(assets)
  }, [])

  if (selectedAssets.length === 0) {
    return null
  }

  const bgColor = isDarkMode ? '#0a0a0a' : '#f5f5f5'
  const canvasBgColor = isDarkMode ? '#1a1a1a' : '#ffffff'

  return (
    <div
      style={{
        backgroundColor: bgColor,
        borderBottom: isDarkMode ? '1px solid #1a1a1a' : '1px solid #e0e0e0',
        padding: '2rem',
        transition: 'all 0.3s ease',
      }}
    >
      {/* 텍스트 섹션 */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '2rem',
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
            fontSize: '42px',
            fontWeight: '700',
            color: isDarkMode ? '#ffffff' : '#1a1a1a',
          }}
        >
          Explore the Universe of Learning
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: isDarkMode ? '#aaaaaa' : '#666666',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}
        >
          Discover interactive simulations, 3D visualizations, and educational games
        </p>
      </div>

      {/* 3D Canvas */}
      <div
        style={{
          width: '100%',
          height: '400px',
          backgroundColor: canvasBgColor,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Canvas camera={{ position: [0, 2, 8], fov: 50 }} dpr={[1, 2]}>
          <color attach="background" args={[canvasBgColor]} />
          <HeroSection3DContent assets={selectedAssets} />
        </Canvas>
      </div>

      {/* 에셋 정보 */}
      <div
        style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '12px',
          color: isDarkMode ? '#666666' : '#999999',
        }}
      >
        <p>Randomly loaded assets: {selectedAssets.join(', ')}</p>
      </div>
    </div>
  )
}
