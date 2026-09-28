// 전체 포털에서 검색 가능한 항목들
export interface SearchItem {
  id: string
  type: 'category' | 'simulation'
  title: string
  description?: string
  keywords: string[]
  icon: string
  path: string
}

export const SEARCH_DATA: SearchItem[] = [
  // 카테고리들
  { id: 'cat-measurement', type: 'category', title: 'Measurement', description: 'Measurement and calculation simulations', keywords: ['measure', 'measurement', 'basics', '측정'], icon: '📏', path: '/category/measurement' },
  { id: 'cat-force', type: 'category', title: 'Force & Motion', description: 'Physics mechanics simulations', keywords: ['force', 'motion', 'mechanics', 'mechanics', '힘', '운동'], icon: '🎯', path: '/category/force_motion' },
  { id: 'cat-wave', type: 'category', title: 'Optics & Waves', description: 'Light and wave simulations', keywords: ['light', 'wave', 'optics', 'light_wave', '파동', '빛'], icon: '🌊', path: '/category/light_wave' },
  { id: 'cat-electricity', type: 'category', title: 'Electromagnetics', description: 'Electric and magnetic phenomena', keywords: ['electric', 'electricity', 'electric', 'electromagnetic', '전기'], icon: '⚡', path: '/category/electricity' },
  { id: 'cat-energy', type: 'category', title: 'Energy Systems', description: 'Energy and power simulations', keywords: ['energy', 'power', 'renewable', '에너지'], icon: '⚛️', path: '/category/energy' },
  { id: 'cat-chemistry', type: 'category', title: 'Chemistry', description: 'Chemical reactions and molecules', keywords: ['chemi', 'chemistry', 'molecule', 'reaction', '화학'], icon: '🧪', path: '/category/chemistry' },
  { id: 'cat-earth', type: 'category', title: 'Earth', description: 'Earth science and geology', keywords: ['earth', 'geology', 'geo', 'planet', '지구'], icon: '🌍', path: '/category/earth' },
  { id: 'cat-astronomy', type: 'category', title: 'Space & Universe', description: 'Astronomy and space simulations', keywords: ['space', 'astro', 'astronomy', 'star', 'cosmos', 'universe', '우주'], icon: '🌌', path: '/category/astronomy' },
  { id: 'cat-biology', type: 'category', title: 'Life Sciences', description: 'Biology and life simulations', keywords: ['biology', 'bio', 'life', 'cell', 'organism', '생물'], icon: '🧬', path: '/category/biology' },
  { id: 'cat-mathematics', type: 'category', title: 'Mathematics', description: 'Mathematical visualizations', keywords: ['math', 'mathematics', 'geometry', 'algebra', '수학'], icon: '📐', path: '/category/mathematics' },
  { id: 'cat-technology', type: 'category', title: 'Tech Lab', description: 'Technology and engineering', keywords: ['tech', 'technology', 'engineering', 'robot', '기술'], icon: '🤖', path: '/category/technology' },
  { id: 'cat-others', type: 'category', title: 'Experimental', description: 'Experimental simulations', keywords: ['other', 'experimental', 'misc', '실험'], icon: '📚', path: '/category/others' },
  { id: 'cat-game', type: 'category', title: 'Web Games', description: 'Interactive games', keywords: ['game', 'games', 'play', 'interactive', '게임'], icon: '🍔', path: '/game' },

  // 인기 시뮬레이션들
  { id: 'sim-physics', type: 'simulation', title: '3D Physics', description: 'Advanced 3D physics engine', keywords: ['physics', '3d', 'physics_3d'], icon: '⚙️', path: '/' },
  { id: 'sim-magic', type: 'simulation', title: 'Magic & Alchemy', description: 'Magical circle effects', keywords: ['magic', 'alchemy', 'magic'], icon: '✨', path: '/' },
]

export function searchPortal(query: string): SearchItem[] {
  if (!query.trim()) return []

  const lowerQuery = query.toLowerCase()

  return SEARCH_DATA.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(lowerQuery)
    const descMatch = item.description?.toLowerCase().includes(lowerQuery)
    const keywordMatch = item.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery))

    return titleMatch || descMatch || keywordMatch
  }).slice(0, 10) // 최대 10개 결과
}
