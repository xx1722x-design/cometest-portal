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
    id: 'match3-puzzle',
    title: 'Match-3 Puzzle',
    description: '💎 Classical Match-3 puzzle gameplay - Click to select, swap adjacent tiles, match 3+ candies for big scores!',
    thumbnail: '💎',
    category: 'web_games',
    icon: '💎',
    path: '/game/match3-puzzle',
    tags: ['puzzle', 'match3', 'arcade', 'phaser', 'casual'],
    play_count: 0,
  },
  {
    id: 'snake-game',
    title: 'Snake Game',
    description: '클래식 뱀 게임 - 화살표 키로 방향을 조종하고 음식을 먹으세요! Arrow keys or WASD to control',
    thumbnail: '🐍',
    category: 'web_games',
    icon: '🐍',
    path: '/game/snake-game',
    tags: ['puzzle', 'arcade', 'classic', 'phaser'],
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
  {
    id: 'space-racer',
    title: 'Infinite Space Racer',
    description: '무한 우주선 레이싱 - 장애물을 피하고 최고 거리를 기록하세요!',
    thumbnail: '🚀',
    category: 'web_games',
    icon: '🚀',
    path: '/game/space-racer',
    tags: ['action', 'arcade', 'racing'],
    play_count: 2450,
  },
  {
    id: 'all-you-can-tycoon',
    title: 'All You Can Tycoon',
    description: '3D 경영 시뮬레이션 게임 - 음식점을 운영하고 부를 축적하세요!',
    thumbnail: '🏪',
    category: 'web_games',
    icon: '🏪',
    path: '/game/all-you-can-tycoon',
    tags: ['strategy', 'simulation', 'business'],
    play_count: 1800,
  },
  {
    id: 'prism-rush',
    title: 'Prism Rush',
    description: '3D 프리즘을 피해 나아가는 스릴 넘치는 게임',
    thumbnail: '✨',
    category: 'web_games',
    icon: '✨',
    path: '/game/prism-rush',
    tags: ['action', 'puzzle', 'arcade'],
    play_count: 3200,
  },
  {
    id: 'drift-boss',
    title: 'Drift Boss',
    description: '지그재그 길을 따라 계속 나아가는 하이퍼 캐주얼 게임 - 스페이스바를 눌러 우회전!',
    thumbnail: '🚗',
    category: 'web_games',
    icon: '🚗',
    path: '/game/drift-boss',
    tags: ['action', 'arcade', 'casual', 'hypercasual'],
    play_count: 0,
  },
]

export const getGameById = (gameId: string): GameItem | undefined => {
  return GAMES_DATA.find((game) => game.id === gameId)
}

export const getGamesByCategory = (category: string): GameItem[] => {
  return GAMES_DATA.filter((game) => game.category === category)
}
