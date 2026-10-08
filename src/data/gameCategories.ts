// Main game category tabs
export interface GameCategory {
  id: string
  icon: string
  name: string
}

// Primary game categories
export const PRIMARY_CATEGORIES: GameCategory[] = [
  { id: 'all', icon: '🎮', name: 'All' },
  { id: 'web_games', icon: '🕹️', name: 'Web Games' },
  { id: 'space_universe', icon: '🌌', name: 'Space & Universe' },
  { id: 'physics_chemistry', icon: '🧪', name: 'Physics & Chemistry' },
  { id: 'optics_waves', icon: '💡', name: 'Optics & Waves' },
  { id: 'puzzle', icon: '🧩', name: 'Puzzle' },
]

// Secondary occult theme categories
export const SECONDARY_CATEGORIES: GameCategory[] = [
  { id: 'abyssal-frequencies', icon: '🔮', name: 'Abyssal Frequencies' },
  { id: 'alchemy-dark-magic', icon: '⚗️', name: 'Alchemy & Dark Magic' },
  { id: 'anomalous-physics', icon: '⚡', name: 'Anomalous Physics' },
  { id: 'breach-anomalies', icon: '🌌', name: 'Breach & Anomalies' },
  { id: 'cosmic-horror', icon: '👁️', name: 'Cosmic Horror' },
  { id: 'forbidden-specimens', icon: '🧬', name: 'Forbidden Specimens' },
  { id: 'illusions-hallucinations', icon: '🎭', name: 'Illusions & Hallucinations' },
  { id: 'necromancy-spirits', icon: '💀', name: 'Necromancy & Spirits' },
  { id: 'sacred-geometry', icon: '✨', name: 'Sacred Geometry' },
  { id: 'unidentified-artifacts', icon: '📿', name: 'Unidentified Artifacts' },
]
