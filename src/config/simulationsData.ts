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
    description: '🎯 Destroy a colossal tower of glowing blocks using realistic 3D physics. Drag blocks and launch the magenta ball to shatter the neon structure and test your strategy.',
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
    description: '🌊 Experience a breathtaking shader-based ocean with dynamic waves, realistic sky, and advanced lighting. Pure Three.js water physics rendering.',
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
    description: '✨ Control 5000+ glowing particles in premium 3D fluid simulation. React to your mouse movement with additive blending for stunning natural glow effects.',
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
    description: '🧵 Advanced cloth simulation using Verlet integration and post-processing effects. Watch realistic fabric movement with interactive physics objects.',
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
    description: '🌍 Explore our Solar System in 3D. Zoom in and out, observe planetary orbits, and learn about each celestial body in an interactive educational experience.',
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
    description: '🌙 Visualize lunar phases in an interactive simulation. Understand the monthly cycle of the Moon and discover the science behind its changing appearance.',
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
    description: '🔥 Explore combustion and extinction principles through interactive chemistry simulation. Discover different ways to extinguish flames and observe reactions.',
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
    title: 'States of Water Transformation Lab',
    description: '💧 Observe water transitioning between solid, liquid, and gas states. Experiment with temperature and pressure effects in this interactive lab.',
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
    title: 'States of Matter Physics Lab',
    description: '⚛️ Visualize the three states of matter in 3D. Understand atomic behavior and state changes from a molecular perspective in this physics education simulation.',
    category: 'physics_chemistry',
    icon: '⚛️',
    path: '/simulation/states-of-matter',
    component: 'StatesOfMatter',
    image: '/thumbnails/states-of-matter.png',
    tags: ['physics', 'chemistry', 'science', 'matter', 'education'],
    play_count: 1650,
  },
  {
    id: 'room-convection',
    title: 'Room Convection Simulator',
    description: '🌬️ Visualize heat flow and convection patterns in a room. Observe how thermal energy circulates and creates convection currents in this physics simulation.',
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
    description: '🎱 Interactive 3D physics simulation with falling colorful balls. Rotate the view, explore gravity effects, and observe realistic collision physics.',
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
