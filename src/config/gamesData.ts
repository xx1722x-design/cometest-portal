export interface GameItem {
  id: string
  title: string
  description: string
  englishTitle?: string
  englishDescription?: string
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
  originalAuthor?: string
  sourceUrl?: string
}

export const GAMES_DATA: GameItem[] = [
  // [AUTO_INSERT_ANCHOR]
]

// ==================== HTML-based PhET Simulations (Awaiting AI Reprocessing) ====================
// These will be populated with English metadata after script re-run

export const getGameById = (gameId: string): GameItem | undefined => {
  return GAMES_DATA.find((game) => game.id === gameId)
}

export const getGamesByCategory = (category: string): GameItem[] => {
  return GAMES_DATA.filter((game) => game.category === category)
}
