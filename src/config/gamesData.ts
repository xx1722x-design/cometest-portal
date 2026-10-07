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
    id: 'dante',
    title: 'Dante - Puzzle Adventure',
    description: '🔮 신비로운 차원을 탐험하는 퍼즐 어드벤처. 섬뜩한 분위기 속에서 미지의 영역을 풀어내세요.',
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
    title: 'Clawstrike - Action Battle',
    description: '⚔️ 신비한 존재들과의 격렬한 전투. 직관적인 컨트롤로 위험한 순간들을 헤쳐나가세요.',
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
    title: 'Neon Platformer - Premium',
    description: '🎮 형광빛 나는 미로 같은 스테이지를 뛰어다니는 프리미엄 플랫포머. 동전을 모으고 적을 피하며 난이도 상승의 쾌감을 즐기세요.',
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
    description: '💥 형광색 우주에서 펼쳐지는 슈팅 게임. 화살표 키로 이동하고 스페이스바로 사격하여 파도 같이 밀려오는 적들을 격퇴하세요.',
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
    description: '🎮 떨어지는 과일을 바구니로 잡는 클래식 아케이드 게임. 마우스를 움직여 신속하게 반응하고 높은 점수를 기록하세요.',
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
