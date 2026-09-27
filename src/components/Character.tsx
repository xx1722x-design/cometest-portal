import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import { Mesh } from 'three'

interface CharacterProps {
  modelPath: string
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export function Character({ modelPath, position = [0, 0, 0], rotation = [0, 0, 0] }: CharacterProps) {
  const { scene } = useGLTF(modelPath)

  const processedScene = useMemo(() => {
    const clonedScene = scene.clone()
    clonedScene.traverse((child) => {
      if ('isMesh' in child && child.isMesh) {
        const mesh = child as Mesh
        if (mesh.geometry) {
          mesh.geometry.computeVertexNormals()
        }
        if (mesh.material) {
          const mat = mesh.material as any
          mat.flatShading = false
        }
      }
    })
    return clonedScene
  }, [scene])

  return (
    <primitive object={processedScene} position={position} rotation={rotation} />
  )
}

// Preload 모든 에셋 (1~10) - 모듈 로드 시 한 번만 실행
;(() => {
  for (let i = 1; i <= 10; i++) {
    useGLTF.preload(`/3000polygon/${i}.glb`)
  }
})()
