export interface SimulationItem {
  id: string
  title: string
  description: string
  category: string
  icon: string
  path: string
  component: string
  isTranslationKey?: boolean
  tags?: string[]
  play_count?: number
}

export const SIMULATIONS_DATA: SimulationItem[] = [
  {
    id: 'ocean-water-simulation',
    title: 'Premium Ocean Water Simulation',
    description: '🌊 Realistic shader-based ocean with dynamic waves, sky environment, and advanced lighting. Pure Three.js water physics rendering.',
    category: 'physics_chemistry',
    icon: '🌊',
    path: '/simulation/ocean-water-simulation',
    component: 'OceanWaterSimulation',
    tags: ['3d', 'water', 'physics', 'shaders', 'interactive', 'premium', 'ocean'],
    play_count: 0,
  },
  {
    id: 'fluid-particle-system',
    title: 'Interactive Fluid Particle System',
    description: '✨ Premium 3D particle fluid with 5000+ glowing particles reacting to mouse movement. Features additive blending for native glow effect.',
    category: 'physics_chemistry',
    icon: '✨',
    path: '/simulation/fluid-particle-system',
    component: 'FluidParticleSystem',
    tags: ['3d', 'particles', 'fluid', 'physics', 'interactive', 'premium'],
    play_count: 0,
  },
  {
    id: 'advanced-cloth-physics',
    title: 'Advanced Cloth Physics',
    description: 'Premium 3D cloth simulation with Verlet integration, post-processing effects, and interactive physics objects',
    category: 'physics_chemistry',
    icon: '🧵',
    path: '/simulation/advanced-cloth-physics',
    component: 'AdvancedClothPhysicsSimulator',
    tags: ['physics', '3d', 'cloth', 'advanced', 'premium', 'interactive'],
    play_count: 0,
  },
  {
    id: 'solar-system',
    title: 'Solar System Explorer',
    description: '3D Solar System with zoom interaction - Learn about planets and their orbits',
    category: 'space_universe',
    icon: '🌍',
    path: '/simulation/solar-system',
    component: 'SolarSystemSimulator',
    tags: ['space', 'astronomy', '3d', 'interactive'],
    play_count: 5200,
  },
  {
    id: 'moon-phases',
    title: 'Moon Phases Simulator',
    description: 'Interactive lunar phases - Understand the monthly cycle of the Moon',
    category: 'space_universe',
    icon: '🌙',
    path: '/simulation/moon-phases',
    component: 'MoonPhaseSimulator',
    tags: ['space', 'astronomy', 'lunar', 'science'],
    play_count: 3400,
  },
  {
    id: 'candle-extinguishing',
    title: 'Candle Extinguishing Methods',
    description: 'Combustion & Extinction - Explore different ways to extinguish a flame',
    category: 'physics_chemistry',
    icon: '🔥',
    path: '/simulation/candle-extinguishing',
    component: 'CandleExtinguishingSimulator',
    tags: ['chemistry', 'physics', 'combustion', 'science'],
    play_count: 1950,
  },
  {
    id: 'states-of-water',
    title: 'states_of_water_title',
    description: 'states_of_water_desc',
    category: 'physics_chemistry',
    icon: '💧',
    path: '/simulation/states-of-water',
    component: 'StatesOfWaterSimulator',
    isTranslationKey: true,
    tags: ['chemistry', 'physics', 'states', 'water'],
    play_count: 2100,
  },
  {
    id: 'states-of-matter',
    title: 'states_of_matter_title',
    description: 'states_of_matter_desc',
    category: 'physics_chemistry',
    icon: '⚛️',
    path: '/simulation/states-of-matter',
    component: 'StatesOfMatter',
    isTranslationKey: true,
    tags: ['physics', 'chemistry', 'science', 'matter'],
    play_count: 1650,
  },
  {
    id: 'light-refraction',
    title: 'light_refraction_title',
    description: 'light_refraction_desc',
    category: 'optics_waves',
    icon: '💡',
    path: '/simulation/light-refraction',
    component: 'LightRefractionLab',
    isTranslationKey: true,
    tags: ['optics', 'physics', 'light', 'science'],
    play_count: 2800,
  },
  {
    id: 'hanoi-tower',
    title: 'Hanoi Tower Puzzle',
    description: 'Move all disks from one peg to another following the rules - A 3D interactive puzzle',
    category: 'puzzle',
    icon: '🗼',
    path: '/simulation/hanoi-tower',
    component: 'HanoiTower',
    tags: ['puzzle', 'game', 'logic', 'brain'],
    play_count: 4100,
  },
  {
    id: 'room-convection',
    title: 'room_convection_title',
    description: 'room_convection_desc',
    category: 'physics_chemistry',
    icon: '🌬️',
    path: '/simulation/room-convection',
    component: 'RoomConvectionSimulator',
    isTranslationKey: true,
    tags: ['physics', 'convection', 'thermodynamics', 'science'],
    play_count: 0,
  },
  {
    id: 'physics-3d-balls',
    title: '3D Physics Balls',
    description: 'Interactive 3D physics simulation with falling colorful balls - Drag to rotate, explore gravity and collisions',
    category: 'physics_chemistry',
    icon: '🎱',
    path: '/simulation/physics-3d-balls',
    component: 'Physics3DBallsSimulator',
    tags: ['physics', '3d', 'interactive', 'gravity', 'simulation'],
    play_count: 0,
  },
]

export const getSimulationById = (simulationId: string): SimulationItem | undefined => {
  return SIMULATIONS_DATA.find((sim) => sim.id === simulationId)
}

export const getSimulationsByCategory = (category: string): SimulationItem[] => {
  return SIMULATIONS_DATA.filter((sim) => sim.category === category)
}
