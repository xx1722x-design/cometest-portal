export interface GameItem {
  id: string
  title: string
  description: string
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
    id: 'ninja_vs_evilcorp',
    title: 'ninja-vs-evilcorp',
    description: '🎮 Engaging web-based game featuring interactive gameplay. Enjoy addictive mechanics and challenging levels.',
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/ninja_vs_evilcorp',
    image: "/thumbnails/ninja_vs_evilcorp.png",
    tags: ['auto-classified', 'web_games'],
    play_count: 0,
  },
  {
    id: 'dante',
    title: 'Dante - Dimensional Puzzle',
    description: '🔮 A gripping puzzle adventure through mysterious dimensions. Navigate surreal environments, solve cryptic puzzles, and uncover the secrets of forgotten realms.',
    thumbnail: '🔮',
    category: 'simulation',
    icon: '🔮',
    path: '/game/dante',
    image: '/thumbnails/dante.png',
    tags: ['experimental', 'classified', 'mystery', 'puzzle', 'adventure'],
    play_count: 0,
  },
  {
    id: 'clawstrike',
    title: 'Clawstrike - Battle Arena',
    description: '⚔️ Intense combat against mysterious entities. Master intuitive controls, dodge deadly attacks, and emerge victorious in this action-packed arena battle.',
    thumbnail: '⚔️',
    category: 'simulation',
    icon: '⚔️',
    path: '/game/clawstrike',
    image: '/thumbnails/clawstrike.png',
    tags: ['experimental', 'classified', 'mystery', 'action', 'combat'],
    play_count: 0,
  },
  {
    id: 'neon-platformer',
    title: 'Neon Platformer - Premium Edition',
    description: '🎮 Jump through neon-lit maze levels in this premium 2D platformer. Collect coins, dodge enemies, and master progressively challenging stages with addictive gameplay.',
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/neon-platformer',
    image: '/thumbnails/neon-platformer.png',
    tags: ['platformer', 'arcade', 'phaser', 'action', 'premium', 'neon'],
    play_count: 0,
  },
  {
    id: 'neon-space-shooter',
    title: 'Neon Space Shooter',
    description: '💥 Battle through neon-glowing space in this arcade shooter. Navigate with arrow keys, fire with SPACE, and destroy waves of enemies in a glowing void.',
    thumbnail: '💥',
    category: 'web_games',
    icon: '💥',
    path: '/game/neon-space-shooter',
    image: '/thumbnails/neon-space-shooter.png',
    tags: ['shooter', 'arcade', 'neon', 'phaser', 'action', 'premium', 'space'],
    play_count: 0,
  },
  {
    id: 'catch-game',
    title: 'Fruit Catch - Classic Arcade',
    description: '🎮 Catch falling fruits in this classic arcade game. Move your basket with precision, test your reflexes, and rack up high scores in addictive casual gameplay.',
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/catch-game',
    image: '/thumbnails/catch-game.png',
    tags: ['action', 'arcade', 'casual', 'phaser', 'reflex'],
    play_count: 0,
  },
]

export const getGameById = (gameId: string): GameItem | undefined => {
  return GAMES_DATA.find((game) => game.id === gameId)
}

export const getGamesByCategory = (category: string): GameItem[] => {
  return GAMES_DATA.filter((game) => game.category === category)
}
