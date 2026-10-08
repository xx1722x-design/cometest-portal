export interface GameItem {
  id: string
  title: string
  description: string
  storyDescription?: string
  seoKeywords?: string[]
  thumbnail: string
  category: 'web_games' | 'simulation' | '3d_physics'
  icon: string
  path: string
  image?: string
  tags?: string[]
  play_count?: number
}

export const GAMES_DATA: GameItem[] = [
  {
    id: '13th-floor',
    title: '13th-floor',
    description: '🎮 Engaging web-based game featuring interactive gameplay. Enjoy addictive mechanics and challenging levels.',
    storyDescription: 'An anomalous energy signature detected on floor 13 of the classified research facility. Traverse through mysterious corridors where reality bends and time loops collapse. Uncover the truth hidden between dimensions.',
    seoKeywords: ['13th floor mystery', 'dimensional anomaly game', 'classified facility simulator', 'reality bending puzzle'],
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/13th-floor',
    image: '/thumbnails/13th-floor.png',
    tags: ['auto-classified', 'web_games', 'mystery', 'dimensional'],
    play_count: 0,
  },
  {
    id: 'ninja-vs-evilcorp',
    title: 'ninja-vs-evilcorp',
    description: '🎮 Engaging web-based game featuring interactive gameplay. Enjoy addictive mechanics and challenging levels.',
    storyDescription: 'A classified operative infiltrates the darkest corners of EvilCorp headquarters. Armed with ancient ninja techniques and experimental weapons, navigate through shadowy corridors. Every shadow conceals a secret. Every corner holds a trap.',
    seoKeywords: ['ninja stealth game', 'espionage action game', 'classified operative mission', 'dark corporate infiltration'],
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/ninja-vs-evilcorp',
    image: '/thumbnails/ninja-vs-evilcorp.png',
    tags: ['auto-classified', 'web_games', 'action', 'stealth'],
    play_count: 0,
  },
  {
    id: 'dante',
    title: 'Dante - Dimensional Puzzle',
    description: '🔮 A gripping puzzle adventure through mysterious dimensions. Navigate surreal environments, solve cryptic puzzles, and uncover the secrets of forgotten realms.',
    storyDescription: 'Dante awakens in a labyrinth of fractured realities. Each room defies the laws of physics, each puzzle whispers of a forgotten civilization. Solve dimensional anomalies to escape the ever-shifting depths of parallel existence.',
    seoKeywords: ['dimensional puzzle game', 'surreal reality simulator', 'quantum maze adventure', 'metaphysical puzzle solver'],
    thumbnail: '🔮',
    category: 'simulation',
    icon: '🔮',
    path: '/game/dante',
    image: '/thumbnails/dante.png',
    tags: ['experimental', 'classified', 'mystery', 'puzzle', 'adventure', 'dimensional'],
    play_count: 0,
  },
  {
    id: 'clawstrike',
    title: 'Clawstrike - Battle Arena',
    description: '⚔️ Intense combat against mysterious entities. Master intuitive controls, dodge deadly attacks, and emerge victorious in this action-packed arena battle.',
    storyDescription: 'Face unknown entities in an interdimensional battle arena. Their claws crackle with exotic energy. Your reflexes are your only defense. Survive the gauntlet and discover the source of their power.',
    seoKeywords: ['interdimensional combat', 'exotic entity battle game', 'arena action simulator', 'alien creature fighter'],
    thumbnail: '⚔️',
    category: 'simulation',
    icon: '⚔️',
    path: '/game/clawstrike',
    image: '/thumbnails/clawstrike.png',
    tags: ['experimental', 'classified', 'mystery', 'action', 'combat', 'entity'],
    play_count: 0,
  },
  {
    id: 'neon-platformer',
    title: 'Neon Platformer - Premium Edition',
    description: '🎮 Jump through neon-lit maze levels in this premium 2D platformer. Collect coins, dodge enemies, and master progressively challenging stages with addictive gameplay.',
    storyDescription: 'Venture into a cyberpunk maze where neon highways twist through digital canyons. Electrified platforms await. Collect the scattered data nodes before the system collapse spreads further. Your journey through the neon void begins now.',
    seoKeywords: ['cyberpunk platformer game', 'neon maze adventure', 'digital arcade challenge', 'glitch world platformer'],
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/neon-platformer',
    image: '/thumbnails/neon-platformer.png',
    tags: ['platformer', 'arcade', 'phaser', 'action', 'premium', 'neon', 'cyberpunk'],
    play_count: 0,
  },
  {
    id: 'neon-space-shooter',
    title: 'Neon Space Shooter',
    description: '💥 Battle through neon-glowing space in this arcade shooter. Navigate with arrow keys, fire with SPACE, and destroy waves of enemies in a glowing void.',
    storyDescription: 'Your starfighter pierces through an anomalous neon nebula. Hostile signatures surround you—manifestations of an electromagnetic storm made conscious. Evade. Fire. Survive the cosmic convergence.',
    seoKeywords: ['space shooter game', 'neon space arcade', 'electromagnetic anomaly game', 'cosmic encounter shooter'],
    thumbnail: '💥',
    category: 'web_games',
    icon: '💥',
    path: '/game/neon-space-shooter',
    image: '/thumbnails/neon-space-shooter.png',
    tags: ['shooter', 'arcade', 'neon', 'phaser', 'action', 'premium', 'space', 'cosmic'],
    play_count: 0,
  },
  {
    id: 'catch-game',
    title: 'Fruit Catch - Classic Arcade',
    description: '🎮 Catch falling fruits in this classic arcade game. Move your basket with precision, test your reflexes, and rack up high scores in addictive casual gameplay.',
    storyDescription: 'A mysterious orchard glitches in and out of reality, raining fruits through dimensional fissures. Catch what falls before it vanishes. Time your reflexes perfectly as the harvest accelerates toward cosmic convergence.',
    seoKeywords: ['fruit catch arcade', 'reflex challenge game', 'casual arcade classic', 'dimensional harvest simulator'],
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/catch-game',
    image: '/thumbnails/catch-game.png',
    tags: ['action', 'arcade', 'casual', 'phaser', 'reflex', 'dimensional'],
    play_count: 0,
  },
]

export const getGameById = (gameId: string): GameItem | undefined => {
  return GAMES_DATA.find((game) => game.id === gameId)
}

export const getGamesByCategory = (category: string): GameItem[] => {
  return GAMES_DATA.filter((game) => game.category === category)
}
