export interface SimulationItem {
  id: string
  title: string
  description: string
  category: string
  icon: string
  path: string
  component: string
  image?: string
  isTranslationKey?: boolean
  tags?: string[]
  play_count?: number
}

export const SIMULATIONS_DATA: SimulationItem[] = [
  {
    id: 'physics-blocks-simulation',
    title: 'Interactive Physics Blocks Tower',
    description: '🎯 형광색 블록으로 만들어진 거대한 탑을 파괴하는 3D 물리 시뮬레이션. 블록을 끌어서 던지고 마젠타 공을 발사하여 구조물을 무너뜨리세요!',
    category: 'physics_chemistry',
    icon: '🎯',
    path: '/simulation/physics-blocks-simulation',
    component: 'PhysicsBlocksSimulation',
    image: '/thumbnails/physics-blocks-simulation.png',
    tags: ['3d', 'physics', 'interactive', 'destruction', 'premium', 'cannon'],
    play_count: 0,
  },
  {
    id: 'ocean-water-simulation',
    title: 'Premium Ocean Water Simulation',
    description: '🌊 셰이더 기반의 사실적인 해양 환경. 동적 파도, 하늘 환경, 고급 조명을 갖춘 Three.js 물리 렌더링으로 살아있는 바다를 경험하세요.',
    category: 'physics_chemistry',
    icon: '🌊',
    path: '/simulation/ocean-water-simulation',
    component: 'OceanWaterSimulation',
    image: '/thumbnails/ocean-water-simulation.png',
    tags: ['3d', 'water', 'physics', 'shaders', 'interactive', 'premium', 'ocean'],
    play_count: 0,
  },
  {
    id: 'fluid-particle-system',
    title: 'Interactive Fluid Particle System',
    description: '✨ 5000개 이상의 형광 입자로 이루어진 프리미엄 3D 유체 시뮬레이션. 마우스 움직임에 반응하며 가산 블렌딩으로 자연스러운 빛 효과를 제공합니다.',
    category: 'physics_chemistry',
    icon: '✨',
    path: '/simulation/fluid-particle-system',
    component: 'FluidParticleSystem',
    image: '/thumbnails/fluid-particle-system.png',
    tags: ['3d', 'particles', 'fluid', 'physics', 'interactive', 'premium'],
    play_count: 0,
  },
  {
    id: 'advanced-cloth-physics',
    title: 'Advanced Cloth Physics',
    description: '🧵 Verlet 적분 기반의 고급 천 물리 시뮬레이션. 후처리 효과와 상호작용 가능한 물리 객체로 현실감 있는 천의 움직임을 관찰하세요.',
    category: 'physics_chemistry',
    icon: '🧵',
    path: '/simulation/advanced-cloth-physics',
    component: 'AdvancedClothPhysicsSimulator',
    image: '/thumbnails/advanced-cloth-physics.png',
    tags: ['physics', '3d', 'cloth', 'advanced', 'premium', 'interactive'],
    play_count: 0,
  },
  {
    id: 'solar-system',
    title: 'Solar System Explorer',
    description: '🌍 우리 태양계의 3D 모델. 마우스로 줌 인/아웃하며 행성의 궤도와 특성을 학습하는 인터랙티브 천문학 시뮬레이션.',
    category: 'space_universe',
    icon: '🌍',
    path: '/simulation/solar-system',
    component: 'SolarSystemSimulator',
    image: '/thumbnails/solar-system.png',
    tags: ['space', 'astronomy', '3d', 'interactive', 'planets', 'education'],
    play_count: 5200,
  },
  {
    id: 'moon-phases',
    title: 'Moon Phases Simulator',
    description: '🌙 달의 위상 변화를 시각화하는 인터랙티브 시뮬레이션. 한 달 주기의 달 변화를 직관적으로 이해하세요.',
    category: 'space_universe',
    icon: '🌙',
    path: '/simulation/moon-phases',
    component: 'MoonPhaseSimulator',
    image: '/thumbnails/moon-phases.png',
    tags: ['space', 'astronomy', 'lunar', 'science', 'education'],
    play_count: 3400,
  },
  {
    id: 'candle-extinguishing',
    title: 'Candle Extinguishing Methods',
    description: '🔥 촛불의 연소와 소화 원리를 탐험하는 화학 시뮬레이션. 다양한 방법으로 불을 끄고 화학 반응을 관찰하세요.',
    category: 'physics_chemistry',
    icon: '🔥',
    path: '/simulation/candle-extinguishing',
    component: 'CandleExtinguishingSimulator',
    image: '/thumbnails/candle-extinguishing.png',
    tags: ['chemistry', 'physics', 'combustion', 'science', 'education'],
    play_count: 1950,
  },
  {
    id: 'states-of-water',
    title: 'States of Water - Transformation Lab',
    description: '💧 물의 세 가지 상태(고체, 액체, 기체) 변화를 관찰하는 시뮬레이션. 온도와 압력의 영향을 직접 경험해보세요.',
    category: 'physics_chemistry',
    icon: '💧',
    path: '/simulation/states-of-water',
    component: 'StatesOfWaterSimulator',
    image: '/thumbnails/states-of-water.png',
    tags: ['chemistry', 'physics', 'states', 'water', 'education'],
    play_count: 2100,
  },
  {
    id: 'states-of-matter',
    title: 'States of Matter - Physics Basics',
    description: '⚛️ 물질의 세 가지 상태를 3D로 시각화한 물리 교육 시뮬레이션. 원자 수준에서 상태 변화를 이해하세요.',
    category: 'physics_chemistry',
    icon: '⚛️',
    path: '/simulation/states-of-matter',
    component: 'StatesOfMatter',
    image: '/thumbnails/states-of-matter.png',
    tags: ['physics', 'chemistry', 'science', 'matter', 'education'],
    play_count: 1650,
  },
  {
    id: 'light-refraction',
    title: 'Light Refraction Lab',
    description: '💡 광학의 핵심인 빛의 굴절 현상을 실험하는 대화형 랩. 다양한 매질에서 광선의 경로 변화를 관찰하고 스넬의 법칙을 체험하세요.',
    category: 'optics_waves',
    icon: '💡',
    path: '/simulation/light-refraction',
    component: 'LightRefractionLab',
    image: '/thumbnails/light-refraction.png',
    tags: ['optics', 'physics', 'light', 'science', 'education', 'waves'],
    play_count: 2800,
  },
  {
    id: 'hanoi-tower',
    title: 'Hanoi Tower Puzzle',
    description: '🗼 고전적인 하노이 탑 퍼즐을 3D로 경험하세요. 규칙에 따라 모든 원판을 한 기둥에서 다른 기둥으로 옮기고 논리 능력을 테스트해보세요.',
    category: 'puzzle',
    icon: '🗼',
    path: '/simulation/hanoi-tower',
    component: 'HanoiTower',
    image: '/thumbnails/hanoi-tower.png',
    tags: ['puzzle', 'game', 'logic', 'brain', 'strategy'],
    play_count: 4100,
  },
  {
    id: 'room-convection',
    title: 'Room Convection Simulator',
    description: '🌬️ 방 안의 대류 현상을 시각화하는 물리 시뮬레이션. 열이 공간에서 어떻게 흐르고 순환하는지 관찰하세요.',
    category: 'physics_chemistry',
    icon: '🌬️',
    path: '/simulation/room-convection',
    component: 'RoomConvectionSimulator',
    image: '/thumbnails/room-convection.png',
    tags: ['physics', 'convection', 'thermodynamics', 'science', 'education'],
    play_count: 0,
  },
  {
    id: 'physics-3d-balls',
    title: '3D Physics Balls',
    description: '🎱 낙하하는 컬러풀한 공의 3D 물리 시뮬레이션. 마우스로 드래그하여 뷰를 회전하고 중력과 충돌을 탐험하세요.',
    category: 'physics_chemistry',
    icon: '🎱',
    path: '/simulation/physics-3d-balls',
    component: 'Physics3DBallsSimulator',
    image: '/thumbnails/physics-3d-balls.png',
    tags: ['physics', '3d', 'interactive', 'gravity', 'simulation', 'education'],
    play_count: 0,
  },
]

export const getSimulationById = (simulationId: string): SimulationItem | undefined => {
  return SIMULATIONS_DATA.find((sim) => sim.id === simulationId)
}

export const getSimulationsByCategory = (category: string): SimulationItem[] => {
  return SIMULATIONS_DATA.filter((sim) => sim.category === category)
}
