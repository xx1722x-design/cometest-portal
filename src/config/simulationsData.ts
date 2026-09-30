export interface SimulationItem {
  id: string
  title: string
  description: string
  category: string
  icon: string
  path: string
  component: string
  isTranslationKey?: boolean
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
    title: 'states_of_water_title',
    description: 'states_of_water_desc',
    category: 'physics_chemistry',
    icon: '💧',
    path: '/simulation/states-of-water',
    component: 'StatesOfWaterSimulator',
    isTranslationKey: true,
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
  },
]

export const getSimulationById = (simulationId: string): SimulationItem | undefined => {
  return SIMULATIONS_DATA.find((sim) => sim.id === simulationId)
}

export const getSimulationsByCategory = (category: string): SimulationItem[] => {
  return SIMULATIONS_DATA.filter((sim) => sim.category === category)
}
