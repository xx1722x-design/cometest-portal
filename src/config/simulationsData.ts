export interface SimulationItem {
  id: string
  title: string
  description: string
  category: string
  icon: string
  path: string
  component: string
}

export const SIMULATIONS_DATA: SimulationItem[] = [
  {
    id: 'solar-system',
    title: 'Solar System Explorer',
    description: '3D Solar System with zoom interaction - Learn about planets and their orbits',
    category: 'space_universe',
    icon: '🌍',
    path: '/simulation/solar-system',
    component: 'SolarSystemSimulator',
  },
  {
    id: 'moon-phases',
    title: 'Moon Phases Simulator',
    description: 'Interactive lunar phases - Understand the monthly cycle of the Moon',
    category: 'space_universe',
    icon: '🌙',
    path: '/simulation/moon-phases',
    component: 'MoonPhaseSimulator',
  },
  {
    id: 'candle-extinguishing',
    title: 'Candle Extinguishing Methods',
    description: 'Combustion & Extinction - Explore different ways to extinguish a flame',
    category: 'physics_chemistry',
    icon: '🔥',
    path: '/simulation/candle-extinguishing',
    component: 'CandleExtinguishingSimulator',
  },
  {
    id: 'states-of-water',
    title: 'States of Water (물의 상태)',
    description: '3D H2O molecules - Visualize transitions between solid, liquid, and gas states',
    category: 'physics_chemistry',
    icon: '💧',
    path: '/simulation/states-of-water',
    component: 'StatesOfWaterSimulator',
  },
  {
    id: 'states-of-matter',
    title: 'States of Matter (물질의 상태)',
    description: 'Interactive 3D particle simulation - Explore solid, liquid, and gas phases',
    category: 'physics_chemistry',
    icon: '⚛️',
    path: '/simulation/states-of-matter',
    component: 'StatesOfMatter',
  },
]

export const getSimulationById = (simulationId: string): SimulationItem | undefined => {
  return SIMULATIONS_DATA.find((sim) => sim.id === simulationId)
}

export const getSimulationsByCategory = (category: string): SimulationItem[] => {
  return SIMULATIONS_DATA.filter((sim) => sim.category === category)
}
