// 우주 3D 에셋 리스트 - public/models/ 폴더의 .glb 파일들
export const SPACE_ASSETS = [
  'asteroid1.glb',
  'blackhole1.glb',
  'blackhole2.glb',
  'blackhole3.glb',
  'blackhole4.glb',
  'blackhole5.glb',
  'galaxy1.glb',
  'galaxy2.glb',
  'star1.glb',
] as const

export type SpaceAsset = (typeof SPACE_ASSETS)[number]

// 랜덤으로 정확히 N개의 에셋을 중복 없이 선택
export function selectRandomAssets(count: number): SpaceAsset[] {
  const shuffled = [...SPACE_ASSETS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, SPACE_ASSETS.length)) as SpaceAsset[]
}
