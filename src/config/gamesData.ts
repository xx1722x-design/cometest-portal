export interface GameItem {
  id: string
  title: string
  description: string
  controls?: string
  storyDescription?: string
  seoKeywords?: string[]
  occultTheme?: string
  thumbnail: string
  category: 'web_games' | 'simulation' | '3d_physics'
  icon: string
  path: string
  image?: string
  tags?: string[]
  play_count?: number
}

export const GAMES_DATA: GameItem[] = [
  // ==================== PhET Interactive Simulations ====================
  // CC BY 4.0 License - University of Colorado Boulder

  {
    id: 'solar-system',
    title: 'Solar System Simulator',
    description: 'Explore the mechanics of our solar system with interactive 3D visualization.',
    thumbnail: '🌍',
    category: 'simulation',
    icon: '🌍',
    path: '/simulation/solar-system',
    tags: ['phet', 'astronomy', 'physics', '3d'],
    seoKeywords: ['solar system', 'astronomy', 'planetary motion'],
    occultTheme: 'none',
    play_count: 0,
  },
  {
    id: 'moon-phases',
    title: 'Moon Phase Simulator',
    description: 'Understand lunar phases through interactive simulation.',
    thumbnail: '🌙',
    category: 'simulation',
    icon: '🌙',
    path: '/simulation/moon-phases',
    tags: ['phet', 'astronomy', 'interactive'],
    seoKeywords: ['moon phases', 'lunar cycles', 'astronomy'],
    occultTheme: 'none',
    play_count: 0,
  },
  {
    id: 'candle-extinguishing',
    title: 'Candle Extinguishing Lab',
    description: 'Investigate gas exchange and combustion principles.',
    thumbnail: '🕯️',
    category: 'simulation',
    icon: '🕯️',
    path: '/simulation/candle-extinguishing',
    tags: ['phet', 'chemistry', 'physics'],
    seoKeywords: ['combustion', 'gas exchange', 'chemistry'],
    occultTheme: 'none',
    play_count: 0,
  },
  {
    id: 'states-of-water',
    title: 'States of Water Transformation Lab',
    description: 'Explore phase transitions and states of matter using water.',
    thumbnail: '💧',
    category: 'simulation',
    icon: '💧',
    path: '/simulation/states-of-water',
    tags: ['phet', 'chemistry', 'physics'],
    seoKeywords: ['states of matter', 'phase transitions', 'water'],
    occultTheme: 'none',
    play_count: 0,
  },
  {
    id: 'states-of-matter',
    title: 'States of Matter Physics Lab',
    description: 'Interactive exploration of solid, liquid, and gas states.',
    thumbnail: '⚛️',
    category: 'simulation',
    icon: '⚛️',
    path: '/simulation/states-of-matter',
    tags: ['phet', 'physics', 'chemistry'],
    seoKeywords: ['states of matter', 'molecular dynamics', 'physics'],
    occultTheme: 'none',
    play_count: 0,
  },
  {
    id: 'light-refraction',
    title: 'Light Refraction Lab',
    description: 'Investigate how light bends when passing through different materials.',
    thumbnail: '🌈',
    category: 'simulation',
    icon: '🌈',
    path: '/simulation/light-refraction',
    tags: ['phet', 'optics', 'physics'],
    seoKeywords: ['light refraction', 'optics', 'snells law'],
    occultTheme: 'none',
    play_count: 0,
  },
  {
    id: 'hanoi-tower',
    title: 'Tower of Hanoi Puzzle',
    description: 'Classic logic puzzle simulator with animated solution.',
    thumbnail: '🗼',
    category: 'simulation',
    icon: '🗼',
    path: '/simulation/hanoi-tower',
    tags: ['puzzle', 'logic', 'interactive'],
    seoKeywords: ['tower of hanoi', 'puzzle', 'logic game'],
    occultTheme: 'none',
    play_count: 0,
  },
  {
    id: 'room-convection',
    title: 'Room Convection Simulator',
    description: 'Visualize heat transfer and convection patterns in 3D.',
    thumbnail: '🌡️',
    category: 'simulation',
    icon: '🌡️',
    path: '/simulation/room-convection',
    tags: ['phet', 'physics', 'thermodynamics'],
    seoKeywords: ['convection', 'heat transfer', 'thermodynamics'],
    occultTheme: 'none',
    play_count: 0,
  },
  {
    id: 'physics-3d-balls',
    title: 'Physics 3D Balls Simulator',
    description: 'Interactive 3D physics simulation with colliding spheres.',
    thumbnail: '⚽',
    category: '3d_physics',
    icon: '⚽',
    path: '/simulation/physics-3d-balls',
    tags: ['3d', 'physics', 'interactive'],
    seoKeywords: ['3d physics', 'collision detection', 'dynamics'],
    occultTheme: 'none',
    play_count: 0,
  },
  {
    id: 'advanced-cloth-physics',
    title: 'Advanced Cloth Physics Simulator',
    description: 'Simulate realistic fabric behavior with physics calculations.',
    thumbnail: '🧵',
    category: '3d_physics',
    icon: '🧵',
    path: '/simulation/advanced-cloth-physics',
    tags: ['3d', 'physics', 'simulation'],
    seoKeywords: ['cloth simulation', 'physics', '3d graphics'],
    occultTheme: 'none',
    play_count: 0,
  },
  {
    id: 'fluid-particle-system',
    title: 'Fluid Particle System',
    description: 'Interactive fluid dynamics simulation with particle effects.',
    thumbnail: '💨',
    category: '3d_physics',
    icon: '💨',
    path: '/simulation/fluid-particle-system',
    tags: ['3d', 'physics', 'particles'],
    seoKeywords: ['fluid dynamics', 'particle system', 'simulation'],
    occultTheme: 'none',
    play_count: 0,
  },
  {
    id: 'ocean-water-simulation',
    title: 'Ocean Water Simulation',
    description: 'Realistic 3D ocean wave and water surface simulation.',
    thumbnail: '🌊',
    category: '3d_physics',
    icon: '🌊',
    path: '/simulation/ocean-water-simulation',
    tags: ['3d', 'physics', 'water'],
    seoKeywords: ['ocean simulation', 'water physics', '3d graphics'],
    occultTheme: 'none',
    play_count: 0,
  },
  {
    id: 'physics-blocks-simulation',
    title: 'Physics Blocks Simulation',
    description: 'Interactive stacking and physics-based block manipulation.',
    thumbnail: '🧱',
    category: '3d_physics',
    icon: '🧱',
    path: '/simulation/physics-blocks-simulation',
    tags: ['3d', 'physics', 'puzzle'],
    seoKeywords: ['block physics', 'stacking game', '3d simulation'],
    occultTheme: 'none',
    play_count: 0,
  },

  // ==================== HTML-based PhET Simulations ====================

  {
    id: 'color-vision',
    title: '🌈 시각의 왜곡',
    description: '색채의 경계를 초월하는 신비로운 광선의 장난. RGB 파장을 조종하며 인간의 시각을 왜곡시켜라.',
    storyDescription: '색채 마법사의 체험실에서 빛의 삼원색을 조종한다. 각 파장을 섞고 뒤틀 때, 새로운 색채의 영역이 열린다.',
    thumbnail: '🌈',
    category: 'simulation',
    icon: '🌈',
    path: '/game/phet-color-vision',
    tags: ['phet', 'interactive', 'light'],
    seoKeywords: ['색채 마법', '광학 현상', '빛의 성질'],
    occultTheme: 'light-manipulation',
    play_count: 0,
  },
  {
    id: 'gravity-orbits',
    title: '🌀 중력의 속박',
    description: '우주의 검은 심연 속에서 거대한 물체들이 서로를 끌어당긴다. 중력이라는 무명의 힘이 천체들을 노예처럼 묶어놓는다.',
    storyDescription: '암흑 천체 시뮬레이터에서 우주의 무명의 힘을 경험한다. 별들은 중력의 속박에서 벗어날 수 없다.',
    thumbnail: '🌀',
    category: 'simulation',
    icon: '🌀',
    path: '/game/phet-gravity-orbits',
    tags: ['phet', 'physics', 'astronomy'],
    seoKeywords: ['중력 시뮬레이션', '천체 운동', '우주 역학'],
    occultTheme: 'cosmic-forces',
    play_count: 0,
  },
  {
    id: 'waves-interference',
    title: '🌊 파동의 속삭임',
    description: '현실의 경계에서 울려 퍼지는 신비한 진동. 두 파동이 만날 때 일어나는 공명과 간섭의 마법적 현상을 목격하라.',
    storyDescription: '간섭 체험 중심에서 파동의 신비를 탐구한다. 보강간섭과 상쇄간섭의 마법적 현상이 현실을 조종한다.',
    thumbnail: '🌊',
    category: 'simulation',
    icon: '🌊',
    path: '/game/phet-waves-interference',
    tags: ['phet', 'physics', 'waves'],
    seoKeywords: ['파동 간섭', '공명 현상', '파동의 성질'],
    occultTheme: 'wave-resonance',
    play_count: 0,
  },
]

export const getGameById = (gameId: string): GameItem | undefined => {
  return GAMES_DATA.find((game) => game.id === gameId)
}

export const getGamesByCategory = (category: string): GameItem[] => {
  return GAMES_DATA.filter((game) => game.category === category)
}
