import { useEffect, useState, useRef, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { Group, Box3, Vector3 } from 'three'
import { playPanelBeep } from '../lib/sciFiFx'
import { withLang } from '../i18n/languages'
import { selectRandomAssets, SpaceAsset } from '../config/spaceAssets'

const STORE_URL = 'https://store.cometest.com/'

interface Model3DProps {
  modelPath: string
  position: [number, number, number]
  rotationSpeed: number
}

function Model3D({ modelPath, position, rotationSpeed }: Model3DProps) {
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
    const center = box.getCenter(new Vector3())
    gltf.scene.position.sub(center)

    // 에셋에 랜덤 컬러풀한 material 추가
    const colors = [
      0xff6b9d, // Pink
      0x4d96ff, // Blue
      0x6bcf7f, // Green
      0xffd700, // Gold
      0xff6b35, // Orange
      0xc74b50, // Red
      0x9d4edd, // Purple
      0x00f5ff, // Cyan
    ]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]

    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material.color.setHex(randomColor)
        child.material.metalness = 0.3
        child.material.roughness = 0.4
        child.material.emissive.setHex(randomColor)
        child.material.emissiveIntensity = 0.3
      }
    })
  }, [gltf])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += rotationSpeed * 0.5
      groupRef.current.rotation.y += rotationSpeed
    }
  })

  if (!gltf.scene) return null

  return (
    <group ref={groupRef} position={position} scale={adjustedScale}>
      <primitive object={gltf.scene} />
    </group>
  )
}

interface AssetCanvasProps {
  assets: SpaceAsset[]
}

function AssetCanvas({ assets }: AssetCanvasProps) {
  return (
    <Canvas camera={{ position: [0, 0.5, 5], fov: 50 }} dpr={[1, 2]}>
      <color attach="background" args={['#0d1117']} />
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight position={[10, 15, 10]} intensity={1.5} color="#fff9e6" />
      <pointLight position={[5, 8, 5]} intensity={1.2} color="#ffccff" distance={30} />
      <pointLight position={[-8, 6, -8]} intensity={1} color="#ccffff" distance={30} />

      <Suspense fallback={null}>
        <Model3D modelPath={`/models/${assets[0]}`} position={[-1.5, 0, 0]} rotationSpeed={0.01} />
      </Suspense>

      <Suspense fallback={null}>
        <Model3D modelPath={`/models/${assets[1]}`} position={[1.5, 0, 0]} rotationSpeed={0.008} />
      </Suspense>
    </Canvas>
  )
}

export function StoreHero() {
  const { t, i18n } = useTranslation()
  const [selectedAssets, setSelectedAssets] = useState<SpaceAsset[]>([])

  useEffect(() => {
    const assets = selectRandomAssets(2)
    setSelectedAssets(assets)
  }, [])

  if (selectedAssets.length === 0) {
    return null
  }

  return (
    <section className="hero" aria-labelledby="hero-title">
      {/* 배경: 우주 그라데이션 + 3D 에셋 캔버스 */}
      <div
        className="hero__backdrop"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="hero__stars" />
        <div className="hero__grid-floor" />
        <div className="hero__halo" />
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <div style={{ width: '400px', height: '400px' }}>
            <AssetCanvas assets={selectedAssets} />
          </div>
        </div>
        <div className="hero__vignette" />
      </div>

      <div className="hero__content" style={{ position: 'relative', zIndex: 10 }}>
        <span className="hero__eyebrow">
          <span className="hero__dot" aria-hidden="true" />
          {t('market')} · store.cometest.com
        </span>
        <h1 className="hero__title" id="hero-title">
          {t('original_asset_store')}
        </h1>
        <p className="hero__desc">{t('asset_store_description')}</p>
        <div className="hero__actions">
          <a
            className="hero__cta"
            href={withLang(STORE_URL, i18n.language)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playPanelBeep()}
          >
            {t('store_cta')}
            <span className="hero__cta-arrow" aria-hidden="true">
              ➔
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
