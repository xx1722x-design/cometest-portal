import React, { Suspense, useRef, ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import * as THREE from 'three'

// Error Boundary
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('Ocean Water Error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%', height: '100vh', backgroundColor: '#001a33',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#ff4444', fontFamily: "'Courier New', monospace", fontSize: '14px',
        }}>
          <div><h2>⚠️ RENDER ERROR</h2><p>{this.state.error?.message}</p></div>
        </div>
      )
    }
    return this.props.children
  }
}

// Custom water shader with gerstner waves
const WaterShader = {
  vertexShader: `
    uniform float time;
    varying vec2 vUv;
    varying float vWave;

    vec3 gerstnerWave(vec4 wave, vec3 p) {
      float steepness = wave.z;
      float wavelength = wave.w;
      float k = 2.0 * 3.14159 / wavelength;
      float c = sqrt(9.8 / k);
      vec2 d = normalize(wave.xy);
      float f = k * (dot(d, p.xz) - c * time);
      float a = steepness / k;
      return vec3(
        d.x * (a * cos(f)),
        a * sin(f),
        d.y * (a * cos(f))
      );
    }

    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vec3 p = worldPos.xyz;

      vec3 waveSum = vec3(0.0);
      waveSum += gerstnerWave(vec4(1.0, 0.0, 0.25, 60.0), p);
      waveSum += gerstnerWave(vec4(0.2, 0.4, 0.15, 31.0), p);
      waveSum += gerstnerWave(vec4(0.2, 0.6, 0.1, 18.0), p);

      p += waveSum;

      vWave = waveSum.y;
      vUv = uv;

      gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 waterColor;
    varying vec2 vUv;
    varying float vWave;

    void main() {
      vec3 color = mix(waterColor, vec3(0.1, 0.6, 1.0), vWave * 0.5 + 0.5);
      float fresnel = pow(1.0 - dot(normalize(vec3(0, 1, 0)), normalize(vec3(vUv, 1))), 5.0);
      color = mix(color, vec3(1.0), fresnel * 0.3);
      gl_FragColor = vec4(color, 0.9);
    }
  `
}

// CRITICAL: Component with R3F hooks - MUST BE INSIDE Canvas
function WaterMesh() {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (waterRef.current) {
      const material = waterRef.current.material as THREE.ShaderMaterial
      if (material.uniforms.time) {
        material.uniforms.time.value += 0.01
      }
    }
  })

  return (
    <>
      {/* Sky with sun */}
      <Sky sunPosition={[100, 30, 100]} turbidity={2} rayleigh={0.5} mieCoefficient={0.01} mieDirectionalG={0.8} />

      {/* Ambient + directional lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[100, 30, 100]} intensity={2} />

      {/* Water plane with custom shader */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[300, 300, 256, 256]} />
        <shaderMaterial
          vertexShader={WaterShader.vertexShader}
          fragmentShader={WaterShader.fragmentShader}
          uniforms={{
            time: { value: 0 },
            waterColor: { value: new THREE.Color(0x001e3d) },
          }}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Environment reflection sphere */}
      <mesh position={[0, 60, 0]}>
        <sphereGeometry args={[120, 32, 32]} />
        <meshStandardMaterial
          color="#87ceeb"
          metalness={0.2}
          roughness={0.8}
          emissive="#c0e0ff"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Interactive orbit controls */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.5}
        enableZoom
        enablePan
        minDistance={20}
        maxDistance={150}
      />

      <color attach="background" args={['#87ceeb']} />
      <fog attach="fog" args={['#87ceeb', 100, 500]} />
    </>
  )
}

// Main Canvas component - NO R3F hooks here
function OceanScene() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 15, 30], fov: 50 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
    >
      <WaterMesh />
    </Canvas>
  )
}

export function OceanWaterSimulation() {
  return (
    <ErrorBoundary>
      <div style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#87ceeb',
      }}>
        <Suspense fallback={
          <div style={{
            width: '100%', height: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#87ceeb', color: '#0066cc', fontSize: '18px',
          }}>
            Initializing ocean simulation...
          </div>
        }>
          <OceanScene />
        </Suspense>

        {/* Info Panel */}
        <div style={{
          position: 'absolute', top: '20px', left: '20px',
          backgroundColor: 'rgba(0, 26, 51, 0.95)', border: '2px solid #0099ff',
          borderRadius: '12px', padding: '16px 24px', backdropFilter: 'blur(10px)',
          color: '#fff', fontFamily: "'Segoe UI', sans-serif", fontSize: '14px', zIndex: 100,
          boxShadow: '0 0 20px rgba(0, 153, 255, 0.3)',
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#0099ff', fontSize: '16px' }}>
            🌊 Premium Ocean Water Simulation
          </h3>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#888' }}>
            Realistic shader-based ocean with dynamic wave simulation
          </p>
          <p style={{ margin: '0', fontSize: '12px', color: '#aaa' }}>
            Sky environment • Dynamic lighting • Smooth wave physics
          </p>
        </div>
      </div>
    </ErrorBoundary>
  )
}
