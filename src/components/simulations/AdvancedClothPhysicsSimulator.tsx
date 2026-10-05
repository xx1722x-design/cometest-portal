import React, { Suspense, useRef, useState, ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Box } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// Error Boundary Component
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

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('3D Simulation Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: '100%',
            height: '100vh',
            backgroundColor: '#0b0f19',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#ff0000',
            fontFamily: "'Courier New', monospace",
            fontSize: '14px',
            padding: '20px',
            overflow: 'auto',
          }}
        >
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ color: '#ff4444', marginBottom: '16px', fontSize: '20px' }}>
              ⚠️ SIMULATION RENDER ERROR
            </h2>
            <p style={{ color: '#ffaaaa', marginBottom: '12px' }}>
              {this.state.error?.message || 'Unknown error'}
            </p>
            <pre
              style={{
                backgroundColor: '#1a1f2e',
                padding: '12px',
                borderRadius: '8px',
                overflow: 'auto',
                color: '#0f0',
                fontSize: '11px',
                marginBottom: '16px',
              }}
            >
              {this.state.error?.stack || 'No stack trace'}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff4444',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Ultra-Simple Rotating Cube
function RotatingCube() {
  const cubeRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x += 0.005
      cubeRef.current.rotation.y += 0.008
    }
  })

  return (
    <Box ref={cubeRef} args={[2, 2, 2]} position={[0, 0, 0]} castShadow>
      <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.8} />
    </Box>
  )
}

// Minimal 3D Scene - No Complex Physics
function MinimalScene() {
  return (
    <Canvas
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
      camera={{ position: [3, 3, 3], fov: 50 }}
      gl={{
        antialias: true,
        preserveDrawingBuffer: true,
        alpha: false,
      }}
    >
      {/* Simple Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={0.8} color="#ff00ff" />

      {/* Single Rotating Object */}
      <RotatingCube />

      {/* Basic Controls */}
      <OrbitControls autoRotate autoRotateSpeed={2} />

      {/* Minimal Post-Processing */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={1.2} />
      </EffectComposer>

      {/* Background Color */}
      <color attach="background" args={['#0b0f19']} />
    </Canvas>
  )
}

export function AdvancedClothPhysicsSimulator() {
  const [renderError, setRenderError] = useState(false)

  if (renderError) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#0b0f19',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ff4444',
          fontFamily: "'Courier New', monospace",
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2>Render Error Detected</h2>
          <button
            onClick={() => {
              setRenderError(false)
              window.location.reload()
            }}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              backgroundColor: '#ff4444',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div
        style={{
          width: '100%',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#0b0f19',
        }}
      >
        <Suspense
          fallback={
            <div
              style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0b0f19',
                color: '#00ff88',
                fontSize: '18px',
                fontFamily: "'Segoe UI', sans-serif",
              }}
            >
              Loading...
            </div>
          }
        >
          <MinimalScene />
        </Suspense>

        {/* Info Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            backgroundColor: 'rgba(11, 15, 25, 0.95)',
            border: '2px solid #00ff88',
            borderRadius: '12px',
            padding: '16px 24px',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            fontFamily: "'Segoe UI', sans-serif",
            fontSize: '14px',
            zIndex: 100,
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', color: '#00ff88', fontSize: '16px' }}>
            ✨ Neon Cube
          </h3>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#888' }}>
            Rotating Glowing Cube • Bloom Effect
          </p>
          <p style={{ margin: '0', fontSize: '12px', color: '#aaa' }}>
            Orbit with mouse • Scroll to zoom
          </p>
        </div>
      </div>
    </ErrorBoundary>
  )
}
