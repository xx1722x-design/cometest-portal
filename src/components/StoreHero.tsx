import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { playPanelBeep } from '../lib/sciFiFx'
import { withLang } from '../i18n/languages'

const STORE_URL = 'https://store.cometest.com/'

// 미스테리한 3D 객체들
function MysteryObject1() {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (!meshRef.current) return
    // 회전하는 정이십면체
    const geometry = new THREE.IcosahedronGeometry(1.5, 4)
    const material = new THREE.MeshPhongMaterial({
      color: 0x6b21a8,
      emissive: 0xd946ef,
      emissiveIntensity: 0.5,
      shininess: 100,
    })
    meshRef.current.geometry = geometry
    meshRef.current.material = material
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.005
      groupRef.current.rotation.y += 0.008
    }
  })

  return (
    <group ref={groupRef} position={[-1.5, 0, 0]}>
      <mesh ref={meshRef} />
    </group>
  )
}

function MysteryObject2() {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (!meshRef.current) return
    // 반짝이는 원환체
    const geometry = new THREE.TorusGeometry(1.2, 0.4, 16, 100)
    const material = new THREE.MeshStandardMaterial({
      color: 0x0891b2,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.2,
    })
    meshRef.current.geometry = geometry
    meshRef.current.material = material
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.003
      groupRef.current.rotation.y += 0.006
      groupRef.current.rotation.z += 0.004
    }
  })

  return (
    <group ref={groupRef} position={[1.5, 0, 0]}>
      <mesh ref={meshRef} />
    </group>
  )
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null)

  useEffect(() => {
    if (!particlesRef.current) return

    const particleCount = 500
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8
      positions[i + 1] = (Math.random() - 0.5) * 8
      positions[i + 2] = (Math.random() - 0.5) * 8
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0x7c3aed,
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.4,
    })

    particlesRef.current.geometry = geometry
    particlesRef.current.material = material
  }, [])

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0005
    }
  })

  return <points ref={particlesRef} />
}

function MysteryCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
      <color attach="background" args={['#0d1117']} />

      {/* 조명 */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#d946ef" />
      <pointLight position={[-5, -5, 5]} intensity={0.8} color="#06b6d4" />
      <pointLight position={[0, 0, 3]} intensity={0.6} color="#7c3aed" />

      {/* 미스테리한 객체들 */}
      <MysteryObject1 />
      <MysteryObject2 />
      <ParticleField />
    </Canvas>
  )
}

export function StoreHero() {
  const { t, i18n } = useTranslation()

  return (
    <section className="hero" aria-labelledby="hero-title">
      {/* 배경: 우주 그라데이션 + 미스테리한 3D 객체 */}
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
          <div style={{ width: '100%', height: '100%' }}>
            <MysteryCanvas />
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
