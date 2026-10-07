export interface GameItem {
  id: string
  title: string
  description: string
  thumbnail: string
  category: 'web_games' | 'simulation' | '3d_physics'
  icon: string
  path: string
  tags?: string[]
  play_count?: number
}

export const GAMES_DATA: GameItem[] = [
  {
    id: 'dante',
    title: 'dante',
    description: '🔮 미스터리한 Science - Web Games 실험실. dante을 통해 미지의 영역을 탐험하세요.',
    thumbnail: '🔮',
    category: 'simulation',
    icon: '🔮',
    path: '/game/dante',
    tags: ['experimental', 'classified', 'mystery', 'science_-_web_games'],
    play_count: 0,
  },
  {
    id: 'clawstrike',
    title: 'clawstrike',
    description: '🔮 미스터리한 Science - Web Games 실험실. clawstrike을 통해 미지의 영역을 탐험하세요.',
    thumbnail: '🔮',
    category: 'simulation',
    icon: '🔮',
    path: '/game/clawstrike',
    tags: ['experimental', 'classified', 'mystery', 'science_-_web_games'],
    play_count: 0,
  },
  {
    id: 'neon-platformer',
    title: 'Neon Platformer',
    description: '🎮 Premium 2D platformer - Jump through neon levels, collect coins, avoid enemies. Procedurally generated difficulty!',
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/neon-platformer',
    tags: ['platformer', 'arcade', 'phaser', 'action', 'premium'],
    play_count: 0,
  },
  {
    id: 'neon-space-shooter',
    title: 'Neon Space Shooter',
    description: '💥 Premium 2D arcade shooter - Arrow keys to move, SPACE to shoot. Destroy waves of neon enemies in a glowing void!',
    thumbnail: '💥',
    category: 'web_games',
    icon: '💥',
    path: '/game/neon-space-shooter',
    tags: ['shooter', 'arcade', 'neon', 'phaser', 'action', 'premium'],
    play_count: 0,
  },
  {
    id: 'catch-game',
    title: 'Catch Game',
    description: '떨어지는 과일을 잡으세요! 마우스를 움직여 바구니를 제어하는 클래식 아케이드 게임',
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/catch-game',
    tags: ['action', 'arcade', 'casual', 'phaser'],
    play_count: 0,
  },
]

export const getGameById = (gameId: string): GameItem | undefined => {
  return GAMES_DATA.find((game) => game.id === gameId)
}

export const getGamesByCategory = (category: string): GameItem[] => {
  return GAMES_DATA.filter((game) => game.category === category)
}
