export interface GameItem {
  id: string
  title: string
  description: string
  thumbnail: string
  category: 'web_games' | 'simulation' | '3d_physics'
  icon: string
  path: string
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
  },
  {
    id: 'prism-rush',
    title: 'Prism Rush',
    description: '3D 프리즘을 피해 나아가는 스릴 넘치는 게임',
    thumbnail: '✨',
    category: 'web_games',
    icon: '✨',
    path: '/game/prism-rush',
  },
]

export const getGameById = (gameId: string): GameItem | undefined => {
  return GAMES_DATA.find((game) => game.id === gameId)
}

export const getGamesByCategory = (category: string): GameItem[] => {
  return GAMES_DATA.filter((game) => game.category === category)
}
