import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { GameScene } from '../components/GameScene'
import { PCDashboardHUD } from '../components/PCDashboardHUD'
import { MenuHUD } from '../components/MenuHUD'
import { useGameStore } from '../hooks/useGameStore'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function CameraRotationController() {
  const cameraRotation = useGameStore((s) => s?.cameraRotation) ?? 0
  const cameraDistance = useGameStore((s) => s?.cameraDistance) ?? Math.sqrt(20 * 20 + 25 * 25)
  const updateCameraRotation = useGameStore((s) => s?.updateCameraRotation) || (() => {})
  const updateCameraZoom = useGameStore((s) => s?.updateCameraZoom) || (() => {})

  useFrame(({ camera }, delta) => {
    updateCameraRotation(delta)
    updateCameraZoom(delta)

    const angle = (cameraRotation * Math.PI) / 180
    const targetX = 0
    const targetZ = 5

    const xRatio = 20 / Math.sqrt(20 * 20 + 25 * 25)
    const zRatio = 25 / Math.sqrt(20 * 20 + 25 * 25)

    const rotatedX = targetX + Math.sin(angle) * cameraDistance * xRatio
    const rotatedZ = targetZ + Math.cos(angle) * cameraDistance * zRatio
    const height = (20 / Math.sqrt(20 * 20 + 25 * 25)) * cameraDistance

    camera.position.set(rotatedX, height, rotatedZ)
    camera.lookAt(targetX, 1.0, targetZ)
  })

  return null
}

export function Game() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const money = useGameStore((s) => s?.money) ?? 0
  const burgerCount = useGameStore((s) => s?.burgerCount) ?? 0

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        fontFamily: "'Arial', sans-serif",
        backgroundColor: '#1a1a1a',
        position: 'relative',
      }}
    >
      {/* 홈 버튼 */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          zIndex: 100,
          padding: '0.75rem 1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {t('home_button')}
      </button>

      {/* 풀스크린 Canvas */}
      <Canvas
        style={{ width: '100%', height: '100%' }}
        shadows
        dpr={window.devicePixelRatio}
      >
        <PerspectiveCamera
          makeDefault
          position={[20, 20, 25]}
          fov={55}
          near={0.1}
          far={500}
        />
        <OrbitControls
          target={[0, 1.0, 5]}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={15}
          maxDistance={80}
          enablePan={true}
          panSpeed={1.0}
          rotateSpeed={1.2}
          zoomSpeed={1.5}
          enableDamping={true}
          dampingFactor={0.05}
          autoRotate={false}
          enableZoom={true}
          autoRotateSpeed={0}
        />
        <CameraRotationController />
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>

      {/* 메뉴 HUD */}
      <MenuHUD />

      {/* PC 웹 대시보드 HUD */}
      <PCDashboardHUD money={money} burgerCount={burgerCount} />
    </div>
  )
}
