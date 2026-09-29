import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { PrismRushGameContent } from './PrismRushGameContent'
import { PrismRushUI } from './PrismRushUI'
import { usePrismRushStore } from './prismRushState'
import WebGLErrorBoundary from '../../WebGLErrorBoundary'

export function PrismRush() {
  const resetGame = usePrismRushStore((s) => s.resetGame)

  useEffect(() => {
    resetGame()
  }, [])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#0a0a1a',
        overflow: 'hidden',
      }}
    >
      {/* Canvas 게임 렌더링 */}
      <WebGLErrorBoundary>
        <Canvas
          camera={{ position: [0, 5, 8], fov: 60 }}
          dpr={[1, 2]}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <PrismRushGameContent />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>

      {/* UI 오버레이 */}
      <PrismRushUI />
    </div>
  )
}
