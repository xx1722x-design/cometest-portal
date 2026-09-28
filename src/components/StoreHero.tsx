import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { playPanelBeep } from '../lib/sciFiFx'
import { withLang } from '../i18n/languages'

const STORE_URL = 'https://store.cometest.com/'

// 뫼비우스 띠 (Möbius Strip) - 텍스처 포함
function MoebiusStrip() {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!groupRef.current) return

    const geometry = new THREE.BufferGeometry()
    const vertices: number[] = []
    const colors: number[] = []
    const indices: number[] = []

    const width = 12
    const depth = 60

    for (let i = 0; i <= depth; i++) {
      const u = (i / depth) * Math.PI * 2
      for (let j = 0; j <= width; j++) {
        const v = (j / width - 0.5) * 0.5
        const x = (1 + v * Math.cos(u / 2)) * Math.cos(u)
        const y = (1 + v * Math.cos(u / 2)) * Math.sin(u)
        const z = v * Math.sin(u / 2)

        vertices.push(x * 2, y * 2, z * 2)

        // 그래디언트 색상
        const hue = (i / depth) * 360
        const saturation = 100 - Math.abs(v) * 100
        const lightness = 40 + Math.abs(v) * 20
        const rgb = hslToRgb(hue, saturation, lightness)
        colors.push(rgb.r / 255, rgb.g / 255, rgb.b / 255)
      }
    }

    for (let i = 0; i < depth; i++) {
      for (let j = 0; j < width; j++) {
        const a = i * (width + 1) + j
        const b = a + width + 1

        indices.push(a, b, a + 1)
        indices.push(b, b + 1, a + 1)
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      emissive: 0x333333,
      emissiveIntensity: 0.3,
      metalness: 0.4,
      roughness: 0.4,
      wireframe: false,
      side: THREE.DoubleSide,
    })

    const mesh = new THREE.Mesh(geometry, material)
    groupRef.current.add(mesh)
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.001
      groupRef.current.rotation.y += 0.003
    }
  })

  return <group ref={groupRef} position={[0, 0, 0]} scale={0.8} />
}

// HSL to RGB 변환
function hslToRgb(h: number, s: number, l: number) {
  s = s / 100
  l = l / 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(235.5 * color)
  }
  return { r: f(0), g: f(8), b: f(4) }
}

// 무한 루프 (8자 모양)
function InfinityLoop() {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!groupRef.current) return

    const points: THREE.Vector3[] = []
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * Math.PI * 2
      const a = 2
      const x = (a * Math.cos(t)) / (1 + Math.sin(t) ** 2)
      const y = (a * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) ** 2)
      points.push(new THREE.Vector3(x * 2, y * 2, 0))
    }

    const curve = new THREE.CatmullRomCurve3(points)
    const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.25, 8, false)

    const material = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      metalness: 0.6,
      roughness: 0.2,
    })

    const mesh = new THREE.Mesh(tubeGeometry, material)
    groupRef.current.add(mesh)
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.004
    }
  })

  return <group ref={groupRef} position={[0, 0, 0]} scale={0.9} />
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
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      dpr={[1, 2]}
      style={{ cursor: 'grab' }}
      onPointerDown={() => {
        const canvas = document.querySelector('canvas')
        if (canvas) canvas.style.cursor = 'grabbing'
      }}
      onPointerUp={() => {
        const canvas = document.querySelector('canvas')
        if (canvas) canvas.style.cursor = 'grab'
      }}
    >
      <color attach="background" args={['#0d1117']} />

      {/* 다중 조명으로 복잡한 그림자 효과 */}
      <ambientLight intensity={0.7} color="#ffffff" />
      <pointLight position={[10, 10, 5]} intensity={1.4} color="#d946ef" />
      <pointLight position={[-10, -10, 5]} intensity={1.2} color="#06b6d4" />
      <pointLight position={[0, 0, 8]} intensity={0.8} color="#fbbf24" />
      <pointLight position={[5, -5, -5]} intensity={0.9} color="#a855f7" />

      {/* 2개 에셋 - 서로 겹치지 않게 배치 */}
      <group position={[-2.5, 0, 0]}>
        <MoebiusStrip />
      </group>
      <group position={[2.5, 0, 1]}>
        <InfinityLoop />
      </group>
      <ParticleField />

      {/* 드래그 가능하게 */}
      <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={1} />
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
