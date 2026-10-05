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
