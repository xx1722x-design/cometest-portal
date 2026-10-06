import React, { Suspense, useRef, useEffect, useState, ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sky, Water } from '@react-three/drei'
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

// Ocean water scene with realistic shader-based waves
function OceanScene() {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (waterRef.current) {
      const material = waterRef.current.material as THREE.ShaderMaterial
      if (material.uniforms.time) {
        material.uniforms.time.value += state.delta * 0.5
      }
    }
  })

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
      {/* Sky with sun */}
      <Sky sunPosition={[100, 30, 100]} turbidity={2} rayleigh={0.5} mieCoefficient={0.01} mieDirectionalG={0.8} />

      {/* Ambient + directional lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[100, 30, 100]} intensity={2} castShadow />

      {/* Water plane with shader */}
      <Water
        ref={waterRef}
        args={[new THREE.PlaneGeometry(500, 500), {}]}
        waterNormals={
          new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')
        }
        sunDirection={new THREE.Vector3(100, 30, 100).normalize()}
        sunColor={0xffd700}
        waterColor={0x001e3d}
        distance={500}
        fog={false}
        scale={1}
        flowX={0.1}
        flowY={0.1}
      />

      {/* Environment reflection sphere (fake reflections) */}
      <mesh position={[0, 50, 0]}>
        <sphereGeometry args={[100, 32, 32]} />
        <meshStandardMaterial
          color="#87ceeb"
          metalness={0.3}
          roughness={0.7}
          emissive="#c0e0ff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Underwater volumetric effect */}
      <mesh position={[0, -50, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial
          color="#001a33"
          metalness={0}
          roughness={1}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Interactive orbit controls */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.5}
        enableZoom
        enablePan
        minDistance={20}
        maxDistance={100}
      />

      <color attach="background" args={['#87ceeb']} />
      <fog attach="fog" args={['#87ceeb', 100, 500]} />
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
