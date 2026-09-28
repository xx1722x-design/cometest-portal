import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { playPanelBeep } from '../lib/sciFiFx'
import { withLang } from '../i18n/languages'

const STORE_URL = 'https://store.cometest.com/'

// 3D 별 모양
function StarObject() {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!groupRef.current) return

    const geometry = new THREE.IcosahedronGeometry(1, 2)
    geometry.scale(1.5, 1, 1.5)

    const material = new THREE.MeshStandardMaterial({
      color: 0xff6b9d,
      emissive: 0xff1493,
      emissiveIntensity: 0.6,
      metalness: 0.6,
      roughness: 0.2,
    })

    const mesh = new THREE.Mesh(geometry, material)
    groupRef.current.add(mesh)
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.004
      groupRef.current.rotation.y += 0.007
    }
  })

  return <group ref={groupRef} position={[-3, 1, -2]} />
}

// 결정체 (크리스탈)
function CrystalObject() {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!groupRef.current) return

    const geometry = new THREE.OctahedronGeometry(1.2, 2)
    const material = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x0099cc,
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.1,
    })

    const mesh = new THREE.Mesh(geometry, material)
    groupRef.current.add(mesh)
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.006
      groupRef.current.rotation.z += 0.008
    }
  })

  return <group ref={groupRef} position={[3, -1, -2]} />
}

// 회전하는 Wireframe 구
function WireframeOrb() {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!groupRef.current) return

    const geometry = new THREE.IcosahedronGeometry(1.5, 5)
    const material = new THREE.MeshPhongMaterial({
      color: 0x7c3aed,
      emissive: 0xa855f7,
      emissiveIntensity: 0.7,
      wireframe: false,
      shininess: 100,
    })

    const mesh = new THREE.Mesh(geometry, material)

    // Wireframe 선 추가
    const wireframeGeometry = new THREE.WireframeGeometry(geometry)
    const line = new THREE.LineSegments(
      wireframeGeometry,
      new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 2 })
    )
    mesh.add(line)

    groupRef.current.add(mesh)
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005
    }
  })

  return <group ref={groupRef} position={[0, 0, 0]} />
}

// 다층 원환체 (복잡한 토러스)
function ComplexTorus() {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!groupRef.current) return

    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.TorusGeometry(1.5 - i * 0.4, 0.3, 20, 200)
      const colors = [0xd946ef, 0x06b6d4, 0x8b5cf6]
      const material = new THREE.MeshStandardMaterial({
        color: colors[i],
        emissive: colors[i],
        emissiveIntensity: 0.4,
        metalness: 0.4,
        roughness: 0.3,
      })

      const mesh = new THREE.Mesh(geometry, material)
      groupRef.current.add(mesh)
    }
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.rotation.x += 0.002 * (i + 1)
        child.rotation.z += 0.003 * (i + 1)
      })
    }
  })

  return <group ref={groupRef} position={[0, 2, 1]} />
}

// 입자 필드
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)

  useEffect(() => {
    if (!pointsRef.current) return

    const count = 1000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 15
      positions[i + 1] = (Math.random() - 0.5) * 12
      positions[i + 2] = (Math.random() - 0.5) * 10
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.04,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
    })

    pointsRef.current.geometry = geometry
    pointsRef.current.material = material
  }, [])

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0002
    }
  })

  return <points ref={pointsRef} />
}

function MysteryCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
      <color attach="background" args={['#0d1117']} />

      {/* 다중 조명으로 복잡한 그림자 효과 */}
      <ambientLight intensity={0.7} color="#ffffff" />
      <pointLight position={[10, 10, 5]} intensity={1.4} color="#d946ef" />
      <pointLight position={[-10, -10, 5]} intensity={1.2} color="#06b6d4" />
      <pointLight position={[0, 0, 8]} intensity={0.8} color="#fbbf24" />
      <pointLight position={[5, -5, -5]} intensity={0.9} color="#a855f7" />

      {/* 복잡한 미스테리한 객체들 */}
      <StarObject />
      <CrystalObject />
      <WireframeOrb />
      <ComplexTorus />
      <ParticleField />
    </Canvas>
  )
}

export function StoreHero() {
  const { t, i18n } = useTranslation()

  return (
    <section className="hero" aria-labelledby="hero-title">
      {/* 배경: 우주 그라데이션 + 3D 캔버스 (전체 채움) */}
      <div
        className="hero__backdrop"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <div className="hero__stars" />
        <div className="hero__grid-floor" />
        <div className="hero__halo" />

        {/* 3D Canvas - 전체 배경 채움 */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        >
          <MysteryCanvas />
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
