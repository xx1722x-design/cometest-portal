import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { playPanelBeep } from '../lib/sciFiFx'
import { withLang } from '../i18n/languages'

const STORE_URL = 'https://store.cometest.com/'

type AssetType = 'mobius' | 'infinity' | 'klein' | 'torus' | 'knot' | 'helix' | 'hyperboloid' | 'enneper' | 'dini' | 'seashell' | 'boys' | 'rhodonea'

const ASSET_NAMES: Record<AssetType, string> = {
  mobius: 'Möbius Strip',
  infinity: 'Infinity Loop',
  klein: 'Klein Bottle',
  torus: 'Torus',
  knot: 'Trefoil Knot',
  helix: 'Helix',
  hyperboloid: 'Hyperboloid',
  enneper: 'Enneper Surface',
  dini: 'Dini Surface',
  seashell: 'Conch Shell',
  boys: "Boy's Surface",
  rhodonea: 'Rose Curve',
}

interface DynamicAssetProps {
  type: AssetType
  position: [number, number, number]
  baseColor: number
  emissiveColor: number
  speed: number
}

function hslToRgb(h: number, s: number, l: number) {
  s = s / 100; l = l / 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(235.5 * color)
  }
  return { r: f(0), g: f(8), b: f(4) }
}

function createGeometry(type: AssetType): THREE.BufferGeometry {
  let geometry: THREE.BufferGeometry | null = null

  switch (type) {
    case 'mobius': {
      geometry = new THREE.BufferGeometry()
      const vertices: number[] = []
      const colors: number[] = []
      const indices: number[] = []
      const width = 50, depth = 300
      for (let i = 0; i <= depth; i++) {
        const u = (i / depth) * Math.PI * 2
        for (let j = 0; j <= width; j++) {
          const v = (j / width - 0.5) * 0.5
          const x = (1 + v * Math.cos(u / 2)) * Math.cos(u)
          const y = (1 + v * Math.cos(u / 2)) * Math.sin(u)
          const z = v * Math.sin(u / 2)
          vertices.push(x * 2, y * 2, z * 2)
          const hue = (i / depth) * 360
          const rgb = hslToRgb(hue, 100 - Math.abs(v) * 100, 40 + Math.abs(v) * 20)
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
      break
    }
    case 'klein': {
      geometry = new THREE.BufferGeometry()
      const vertices: number[] = []
      const colors: number[] = []
      const indices: number[] = []
      for (let u = 0; u <= 200; u++) {
        for (let v = 0; v <= 200; v++) {
          const uu = (u / 200) * 2 * Math.PI
          const vv = (v / 200) * 2 * Math.PI
          const r = 4 * (1 - Math.cos(uu) / 2)
          const x = 6 * Math.cos(uu) * (1 + Math.sin(uu)) + r * Math.cos(uu) * Math.cos(vv)
          const y = 16 * Math.sin(uu) + r * Math.sin(uu) * Math.cos(vv)
          const z = r * Math.sin(vv)
          vertices.push(x * 0.1, y * 0.1, z * 0.1)
          colors.push((u / 200), (v / 200), 0.7)
        }
      }
      for (let u = 0; u < 200; u++) {
        for (let v = 0; v < 200; v++) {
          const a = u * 201 + v
          const b = a + 51
          indices.push(a, b, a + 1)
          indices.push(b, b + 1, a + 1)
        }
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
      geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
      geometry.computeVertexNormals()
      break
    }
    case 'torus':
      geometry = new THREE.TorusGeometry(1.2, 0.5, 256, 512)
      break
    case 'knot': {
      const points: THREE.Vector3[] = []
      for (let i = 0; i < 2000; i++) {
        const t = (i / 2000) * 20 * Math.PI
        const x = Math.cos(t) * (2 + Math.cos(t * 1.5))
        const y = Math.sin(t) * (2 + Math.cos(t * 1.5))
        const z = Math.sin(t * 1.5)
        points.push(new THREE.Vector3(x * 0.5, y * 0.5, z * 0.5))
      }
      const knotCurve = new THREE.CatmullRomCurve3(points, true)
      geometry = new THREE.TubeGeometry(knotCurve, 1200, 0.2, 512, false)
      break
    }
    case 'helix': {
      const points: THREE.Vector3[] = []
      for (let i = 0; i < 1000; i++) {
        const t = (i / 1000) * 8 * Math.PI
        const x = Math.cos(t) * 1.5
        const y = t * 0.3
        const z = Math.sin(t) * 1.5
        points.push(new THREE.Vector3(x, y, z))
      }
      const helixCurve = new THREE.CatmullRomCurve3(points)
      geometry = new THREE.TubeGeometry(helixCurve, 600, 0.18, 512, false)
      break
    }
    case 'hyperboloid': {
      geometry = new THREE.BufferGeometry()
      const vertices: number[] = []
      const colors: number[] = []
      const indices: number[] = []
      for (let u = 0; u <= 200; u++) {
        for (let v = 0; v <= 200; v++) {
          const uu = (u / 150) * 2 * Math.PI
          const vv = (v / 150 - 0.5) * 3
          const x = Math.cosh(vv) * Math.cos(uu)
          const y = Math.cosh(vv) * Math.sin(uu)
          const z = Math.sinh(vv)
          vertices.push(x * 0.4, y * 0.4, z * 0.4)
          colors.push((u / 150), 0.5, (v / 150))
        }
      }
      for (let u = 0; u < 200; u++) {
        for (let v = 0; v < 200; v++) {
          const a = u * 201 + v
          const b = a + 41
          indices.push(a, b, a + 1)
          indices.push(b, b + 1, a + 1)
        }
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
      geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
      geometry.computeVertexNormals()
      break
    }
    case 'enneper': {
      geometry = new THREE.BufferGeometry()
      const vertices: number[] = []
      const colors: number[] = []
      const indices: number[] = []
      for (let u = 0; u <= 200; u++) {
        for (let v = 0; v <= 200; v++) {
          const uu = (u / 150) * 4 - 2
          const vv = (v / 150) * 4 - 2
          const x = uu - (uu ** 3) / 3 + uu * (vv ** 2)
          const y = vv - (vv ** 3) / 3 + vv * (uu ** 2)
          const z = (uu ** 2) - (vv ** 2)
          vertices.push(x * 0.15, y * 0.15, z * 0.15)
          colors.push((u / 150), (v / 150), 0.8)
        }
      }
      for (let u = 0; u < 200; u++) {
        for (let v = 0; v < 200; v++) {
          const a = u * 201 + v
          const b = a + 31
          indices.push(a, b, a + 1)
          indices.push(b, b + 1, a + 1)
        }
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
      geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
      geometry.computeVertexNormals()
      break
    }
    case 'dini': {
      geometry = new THREE.BufferGeometry()
      const vertices: number[] = []
      const colors: number[] = []
      const indices: number[] = []
      for (let u = 0; u <= 300; u++) {
        for (let v = 0; v <= 300; v++) {
          const uu = (u / 300) * 4 * Math.PI
          const vv = (v / 300) * 2 + 0.1
          const x = Math.cos(uu) * Math.sinh(vv)
          const y = Math.sin(uu) * Math.sinh(vv)
          const z = uu + Math.cosh(vv) * Math.cos(Math.PI / 8)
          vertices.push(x * 0.3, y * 0.3, z * 0.1)
          colors.push(1.0, 1.0, 1.0)
        }
      }
      for (let u = 0; u < 300; u++) {
        for (let v = 0; v < 300; v++) {
          const a = u * 301 + v
          const b = a + 301
          indices.push(a, b, a + 1)
          indices.push(b, b + 1, a + 1)
        }
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
      geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
      geometry.computeVertexNormals()
      break
    }
    case 'seashell': {
      geometry = new THREE.BufferGeometry()
      const vertices: number[] = []
      const colors: number[] = []
      for (let u = 0; u < 400; u++) {
        for (let v = 0; v < 300; v++) {
          const uu = (u / 400) * 6 * Math.PI
          const vv = (v / 300) * Math.PI
          const x = 0.5 * (1 - uu / (6 * Math.PI)) * Math.cos(uu) * Math.sin(vv)
          const y = 0.5 * (1 - uu / (6 * Math.PI)) * Math.sin(uu) * Math.sin(vv)
          const z = 0.5 * (1 - uu / (6 * Math.PI)) * Math.cos(vv) + uu / (2 * Math.PI)
          vertices.push(x, y, z * 0.3)
          colors.push((u / 400), (v / 300), 0.6)
        }
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
      break
    }
    case 'boys':
      geometry = new THREE.IcosahedronGeometry(1.2, 8)
      break
    case 'rhodonea': {
      geometry = new THREE.BufferGeometry()
      const vertices: number[] = []
      const colors: number[] = []
      for (let u = 0; u < 600; u++) {
        for (let v = 0; v < 300; v++) {
          const uu = (u / 600) * 4 * Math.PI
          const vv = (v / 300) * Math.PI
          const k = 5
          const r = Math.cos(k * uu)
          const x = r * Math.sin(vv) * Math.cos(uu)
          const y = r * Math.sin(vv) * Math.sin(uu)
          const z = r * Math.cos(vv)
          vertices.push(x * 0.8, y * 0.8, z * 0.8)
          colors.push((u / 600), 0.5, (v / 300))
        }
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
      break
    }
    case 'infinity': {
      geometry = new THREE.BufferGeometry()
      const points: THREE.Vector3[] = []
      for (let i = 0; i < 1000; i++) {
        const t = (i / 1000) * Math.PI * 2
        const a = 2
        const x = (a * Math.cos(t)) / (1 + Math.sin(t) ** 2)
        const y = (a * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) ** 2)
        points.push(new THREE.Vector3(x * 2, y * 2, 0))
      }
      const curve = new THREE.CatmullRomCurve3(points, true)
      const tubeGeometry = new THREE.TubeGeometry(curve, 600, 0.3, 512, false)
      geometry = tubeGeometry
      break
    }
    default:
      geometry = new THREE.BoxGeometry(1, 1, 1)
  }

  return geometry
}

function DynamicAsset({ type, position, baseColor, emissiveColor, speed }: DynamicAssetProps) {
  const groupRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)
  const [geometry] = useState(() => createGeometry(type))

  useFrame(() => {
    if (groupRef.current) {
      timeRef.current += 0.01 * speed
      groupRef.current.rotation.x += 0.002 * speed
      groupRef.current.rotation.y += 0.003 * speed
      groupRef.current.rotation.z += 0.001 * speed
      groupRef.current.position.y += Math.sin(timeRef.current * 0.8) * 0.008
      groupRef.current.position.x += Math.cos(timeRef.current * 0.6) * 0.005
      groupRef.current.position.z += Math.sin(timeRef.current * 0.5) * 0.003
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={2.0}
          metalness={0.4}
          roughness={0.4}
          vertexColors={true}
          side={THREE.DoubleSide}
          toneMapped={true}
        />
      </mesh>
    </group>
  )
}

function createParticleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!

  // 그래디언트 원형 텍스처 생성 (중심이 밝고 가장자리가 어두움)
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(32, 32, 32, 0, Math.PI * 2)
  ctx.fill()

  return new THREE.CanvasTexture(canvas)
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)

  useEffect(() => {
    if (!pointsRef.current) return

    const count = 1500
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    // 실제 우주의 별과 성운 색상
    const spaceColors = [
      // 별 색상 (주계열)
      [1.0, 1.0, 1.0],       // 흰 별 (A 타입)
      [1.0, 0.95, 0.8],      // 노란 별 (G 타입, 태양)
      [1.0, 0.7, 0.3],       // 주황 별 (K 타입)
      [1.0, 0.2, 0.1],       // 빨간 별 (M 타입)
      [0.6, 0.8, 1.0],       // 푸른 별 (B 타입)
      [0.3, 0.5, 1.0],       // 짙은 파란 별 (O 타입)
      // 성운 색상
      [1.0, 0.2, 0.8],       // 분홍 성운 (H-알파, 이온화 수소)
      [0.8, 0.2, 1.0],       // 보라 성운
      [0.2, 1.0, 0.8],       // 청록 성운 (산소)
      [1.0, 0.6, 0.2],       // 황금빛 성운
      [1.0, 0.3, 0.3],       // 적색 성운
      [0.9, 0.9, 1.0],       // 밝은 별
    ]

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12

      const colorIdx = Math.floor(Math.random() * spaceColors.length)
      const color = spaceColors[colorIdx]
      colors[i * 3] = color[0]
      colors[i * 3 + 1] = color[1]
      colors[i * 3 + 2] = color[2]

      // 크기: 작은 별(80%) ~ 큰 별(20%)
      sizes[i] = Math.random() < 0.8 ? Math.random() * 0.03 + 0.01 : Math.random() * 0.08 + 0.04
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    pointsRef.current.geometry = geometry
  }, [])

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0001
      pointsRef.current.rotation.x += 0.00005
    }
  })

  return (
    <points ref={pointsRef}>
      <pointsMaterial
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.6}
        vertexColors
        fog={false}
        map={createParticleTexture()}
        alphaTest={0.1}
      />
    </points>
  )
}

interface MysteryCanvasProps {
  selectedAssets: AssetType[]
}

function MysteryCanvas({ selectedAssets }: MysteryCanvasProps) {

  // 12개 도형별 고유 색상
  const assetColors: Record<AssetType, { base: number; emissive: number }> = {
    mobius: { base: 0xff6b9d, emissive: 0xff1493 },      // 분홍색
    infinity: { base: 0x06b6d4, emissive: 0x0891b2 },    // 파란색
    klein: { base: 0xa855f7, emissive: 0xd946ef },       // 보라색
    torus: { base: 0xfbbf24, emissive: 0xfcd34d },       // 노란색
    knot: { base: 0xec4899, emissive: 0xf472b6 },        // 장미색
    helix: { base: 0x34d399, emissive: 0x6ee7b7 },       // 밝은 녹색
    hyperboloid: { base: 0xf59e0b, emissive: 0xfbbf24 }, // 주황색
    enneper: { base: 0x06b6d4, emissive: 0x22d3ee },     // 청록색
    dini: { base: 0xffffff, emissive: 0xffffff },        // 완전 흰색
    seashell: { base: 0xffaa00, emissive: 0xffdd00 },    // 밝은 오렌지 황색
    boys: { base: 0x14b8a6, emissive: 0x2dd4bf },        // 하늘색
    rhodonea: { base: 0xffffff, emissive: 0xffffff },    // 순수 흰색
  }

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

      <ambientLight intensity={0.7} color="#ffffff" />
      <pointLight position={[10, 10, 5]} intensity={1.4} color="#d946ef" />
      <pointLight position={[-10, -10, 5]} intensity={1.2} color="#06b6d4" />
      <pointLight position={[0, 0, 8]} intensity={0.8} color="#fbbf24" />
      <pointLight position={[5, -5, -5]} intensity={0.9} color="#a855f7" />

      {selectedAssets.length === 2 && (
        <>
          <DynamicAsset
            type={selectedAssets[0]}
            position={[-2.5, 0, 0]}
            baseColor={assetColors[selectedAssets[0]].base}
            emissiveColor={assetColors[selectedAssets[0]].emissive}
            speed={1}
          />
          <DynamicAsset
            type={selectedAssets[1]}
            position={[2.5, 0, 1]}
            baseColor={assetColors[selectedAssets[1]].base}
            emissiveColor={assetColors[selectedAssets[1]].emissive}
            speed={0.9}
          />
        </>
      )}
      <ParticleField />

      <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={1} />
    </Canvas>
  )
}

export function StoreHero() {
  const { t, i18n } = useTranslation()

  // 초기에 2개 에셋을 미리 선택해서 시작
  const [selectedAssets] = useState<AssetType[]>(() => {
    const allAssets: AssetType[] = ['mobius', 'infinity', 'klein', 'torus', 'knot', 'helix', 'hyperboloid', 'enneper', 'dini', 'seashell', 'boys', 'rhodonea']
    const shuffled = [...allAssets].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 2)
  })

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__backdrop" aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <div className="hero__stars" />
        <div className="hero__grid-floor" />
        <div className="hero__halo" />

        <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: 1 }}>
          <MysteryCanvas selectedAssets={selectedAssets} />
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
            <span className="hero__cta-arrow" aria-hidden="true">➔</span>
          </a>
        </div>

        {/* 현재 표시되는 도형의 이름 */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)', opacity: 0.8 }}>
          ✨ Featured: {selectedAssets.length === 2 ? `${ASSET_NAMES[selectedAssets[0]]} & ${ASSET_NAMES[selectedAssets[1]]}` : ''}
        </div>
      </div>
    </section>
  )
}
