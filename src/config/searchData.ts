import { GAMES_DATA } from './gamesData'
import { SIMULATIONS_DATA } from './simulationsData'

export interface SearchItem {
  id: string
  type: 'game' | 'simulation' | 'category' | 'theme'
  title: string
  description?: string
  keywords: string[]
  icon: string
  path: string
  category?: string
  matchType?: 'title' | 'description' | 'id' | 'keyword' | 'theme' | 'tag' | 'controls'
}

// Category definitions with themes
const CATEGORIES = [
  { id: 'web_games', title: 'Web Games', icon: '🍔', path: '/game', keywords: ['game', 'games', 'play', 'interactive', 'web'] },
  { id: 'physics_chemistry', title: 'Physics & Chemistry', icon: '⚗️', path: '/chemistry', keywords: ['physics', 'chemistry', 'science', 'lab', 'experiment'] },
  { id: 'space_universe', title: 'Space & Universe', icon: '🌌', path: '/category/astronomy', keywords: ['space', 'astronomy', 'universe', 'cosmos', 'planet'] },
]

// Occult theme definitions
const OCCULT_THEMES = {
  'cosmic-horror': { name: 'Cosmic Horror', keywords: ['cosmic', 'horror', 'void', 'entity', 'dimension', 'eldritch'] },
  'necromancy-spirits': { name: 'Necromancy & Spirits', keywords: ['necromancy', 'spirit', 'ghost', 'death', 'spectral'] },
  'alchemy-dark-magic': { name: 'Alchemy & Dark Magic', keywords: ['alchemy', 'dark', 'magic', 'potion', 'transmutation'] },
  'anomalous-physics': { name: 'Anomalous Physics', keywords: ['anomaly', 'physics', 'impossible', 'gravity', 'paradox'] },
  'sacred-geometry': { name: 'Sacred Geometry', keywords: ['sacred', 'geometry', 'pattern', 'mathematical', 'harmony'] },
  'abyssal-frequencies': { name: 'Abyssal Frequencies', keywords: ['abyss', 'frequency', 'signal', 'void', 'dimension'] },
  'forbidden-specimens': { name: 'Forbidden Specimens', keywords: ['specimen', 'forbidden', 'biology', 'genetic', 'research'] },
  'illusions-hallucinations': { name: 'Illusions & Hallucinations', keywords: ['illusion', 'hallucination', 'mind', 'perception', 'reality'] },
  'breach-anomalies': { name: 'Breach & Anomalies', keywords: ['breach', 'anomaly', 'rift', 'reality', 'rupture'] },
  'unidentified-artifacts': { name: 'Unidentified Artifacts', keywords: ['artifact', 'ancient', 'mystery', 'unidentified', 'civilization'] },
}

function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = []

  // Index all games
  for (const game of GAMES_DATA) {
    const gameKeywords: string[] = [
      game.id,
      game.title,
      game.description,
      game.storyDescription || '',
      ...(game.seoKeywords || []),
      game.controls || '',
      game.occultTheme || '',
      ...(game.tags || []),
    ]
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter((k) => k.length > 0)

    items.push({
      id: game.id,
      type: 'game',
      title: `${game.thumbnail} ${game.title}`,
      description: game.description,
      keywords: gameKeywords,
      icon: game.icon,
      path: `/game/${game.id}`,
      category: game.category,
    })
  }

  // Index all simulations
  for (const sim of SIMULATIONS_DATA) {
    const simKeywords: string[] = [
      sim.id,
      sim.title,
      sim.description,
      sim.category,
      ...(sim.tags || []),
    ]
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter((k) => k.length > 0)

    items.push({
      id: sim.id,
      type: 'simulation',
      title: `${sim.icon} ${sim.title}`,
      description: sim.description,
      keywords: simKeywords,
      icon: sim.icon,
      path: `/simulation/${sim.id}`,
      category: sim.category,
    })
  }

  // Index categories
  for (const cat of CATEGORIES) {
    items.push({
      id: `cat-${cat.id}`,
      type: 'category',
      title: cat.title,
      description: `Browse ${cat.title} collection`,
      keywords: cat.keywords,
      icon: cat.icon,
      path: cat.path,
    })
  }

  // Index occult themes
  for (const [themeId, theme] of Object.entries(OCCULT_THEMES)) {
    items.push({
      id: `theme-${themeId}`,
      type: 'theme',
      title: theme.name,
      description: `Discover ${theme.name} mysteries`,
      keywords: theme.keywords,
      icon: '✨',
      path: '#',
    })
  }

  return items
}

const SEARCH_INDEX = buildSearchIndex()

export function searchPortal(query: string): SearchItem[] {
  if (!query.trim()) return []

  const lowerQuery = query.toLowerCase()
  const queryTerms = lowerQuery.split(/\s+/).filter((t) => t.length > 0)

  const results = SEARCH_INDEX.filter((item) => {
    // Check each query term
    for (const term of queryTerms) {
      const matchesKeyword = item.keywords.some((k) => k.includes(term))
      const matchesTitle = item.title.toLowerCase().includes(term)
      const matchesDesc = item.description?.toLowerCase().includes(term)
      const matchesId = item.id.toLowerCase().includes(term)

      if (matchesKeyword || matchesTitle || matchesDesc || matchesId) {
        return true
      }
    }
    return false
  })

  // Sort by relevance: exact matches first, then partial matches
  results.sort((a, b) => {
    const aExact = a.keywords.some((k) => k === lowerQuery)
    const bExact = b.keywords.some((k) => k === lowerQuery)

    if (aExact && !bExact) return -1
    if (!aExact && bExact) return 1

    // Games and simulations before categories and themes
    const typeOrder = { game: 0, simulation: 1, category: 2, theme: 3 }
    return typeOrder[a.type] - typeOrder[b.type]
  })

  return results.slice(0, 15) // Show up to 15 results
}
