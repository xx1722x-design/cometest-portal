import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { SpaceRacerGameContent } from './SpaceRacerGameContent'
import { SpaceRacerUI } from './SpaceRacerUI'
import { useSpaceRacerStore } from './spaceRacerState'
import WebGLErrorBoundary from '../../WebGLErrorBoundary'

export function SpaceRacer() {
  const resetGame = useSpaceRacerStore((s) => s.resetGame)
  const loadRankings = useSpaceRacerStore((s) => s.loadRankings)

  useEffect(() => {
    resetGame()
    loadRankings()
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
          camera={{ position: [0, 3, -8], fov: 60 }}
          dpr={[1, 2]}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <SpaceRacerGameContent />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>

      {/* UI 오버레이 */}
      <SpaceRacerUI />
    </div>
  )
}
