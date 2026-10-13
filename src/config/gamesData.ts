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
  {
    id: 'at-both-ends',
    englishTitle: "Echoes of the Twin Abyss",
    englishDescription: "A forbidden ritual has tethered your soul to a candle burning from two ends, drawing terrifying entities from the dark. Navigate the crumbling sigils of an ancient void before the encroaching shadows devour what little remains. In this unholy race against time, salvation demands a total sacrifice.",
    title: "🎮 Echoes of the Twin Abyss",
    description: "A forbidden ritual has tethered your soul to a candle burning from two ends, drawing terrifying entities from the dark. Navigate the crumbling sigils of an ancient void before the encroaching shadows devour what little remains. In this unholy race against time, salvation demands a total sacrifice.",
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/at-both-ends',
    image: '/thumbnails/at-both-ends.png',
    tags: ['web_games'],
    play_count: 0,
  },
  {
    id: 'gjallarhorn',
    englishTitle: "Gjallarhorn: Echoes of Eldritch Doom",
    englishDescription: "Deep within forgotten abysses, a cursed horn echoes with the forbidden resonance of an impending apocalypse. Unearth ancient rituals and decipher esoteric blasphemies before the final dread blast shatters the veil of reality.",
    title: "🎮 Gjallarhorn: Echoes of Eldritch Doom",
    description: "Deep within forgotten abysses, a cursed horn echoes with the forbidden resonance of an impending apocalypse. Unearth ancient rituals and decipher esoteric blasphemies before the final dread blast shatters the veil of reality.",
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/gjallarhorn',
    image: '/thumbnails/gjallarhorn.png',
    tags: ['web_games'],
    play_count: 0,
  },
  {
    id: 'huecorn',
    englishTitle: "Huecorn: The Chromatic Void Ritual",
    englishDescription: "Channel forbidden prismatic frequencies to summon the horned entity lurking beyond the visible spectrum. Traverse desecrated sanctuaries where color bleeds into cosmic madness and shadows whisper forgotten truths. Offer your sanity to the celestial beast before the final light fades forever.",
    title: "🎮 Huecorn: The Chromatic Void Ritual",
    description: "Channel forbidden prismatic frequencies to summon the horned entity lurking beyond the visible spectrum. Traverse desecrated sanctuaries where color bleeds into cosmic madness and shadows whisper forgotten truths. Offer your sanity to the celestial beast before the final light fades forever.",
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/huecorn',
    image: '/thumbnails/huecorn.png',
    tags: ['web_games'],
    play_count: 0,
  },
  {
    id: 'panzercorn',
    englishTitle: "Panzercorn: The Black Horn Rites",
    englishDescription: "Awakened through profane blood rituals, an ancient iron behemoth stalks the dying cosmos under an eclipsed moon. Bound in cursed steel and guided by a piercing celestial spire, it obliterates all mortal sanity in its path. Pray that your soul crumbles before the abyssal war beast finds you.",
    title: "🎮 Panzercorn: The Black Horn Rites",
    description: "Awakened through profane blood rituals, an ancient iron behemoth stalks the dying cosmos under an eclipsed moon. Bound in cursed steel and guided by a piercing celestial spire, it obliterates all mortal sanity in its path. Pray that your soul crumbles before the abyssal war beast finds you.",
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/panzercorn',
    image: '/thumbnails/panzercorn.png',
    tags: ['web_games'],
    play_count: 0,
  },
  {
    id: 'prismhoof',
    englishTitle: "Prismhoof: Shadows of Shattered Light",
    englishDescription: "Summoned through forbidden geometry, an eldritch beast treads the fractured realm between spectral light and the eternal void. Perform blasphemous rituals to channel its blinding horror before reality dissolves into cosmic madness.",
    title: "🎮 Prismhoof: Shadows of Shattered Light",
    description: "Summoned through forbidden geometry, an eldritch beast treads the fractured realm between spectral light and the eternal void. Perform blasphemous rituals to channel its blinding horror before reality dissolves into cosmic madness.",
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/prismhoof',
    image: '/thumbnails/prismhoof.png',
    tags: ['web_games'],
    play_count: 0,
  },
  {
    id: 'rainbow-rescue',
    englishTitle: "Ritual of the Fractured Prism",
    englishDescription: "Deep within the abyssal void, the sacred spectrum of creation has been bound by eldritch horrors. As an adept of the hidden arts, you must traverse cosmic shadow and perform forbidden rites to extract the weeping strands of light. Failure will plunge the astral plane into perpetual, starving darkness.",
    title: "🎮 Ritual of the Fractured Prism",
    description: "Deep within the abyssal void, the sacred spectrum of creation has been bound by eldritch horrors. As an adept of the hidden arts, you must traverse cosmic shadow and perform forbidden rites to extract the weeping strands of light. Failure will plunge the astral plane into perpetual, starving darkness.",
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/rainbow-rescue',
    image: '/thumbnails/rainbow-rescue.png',
    tags: ['web_games'],
    play_count: 0,
  },
  {
    id: 'seven-cushions',
    englishTitle: "Seven Cushions of the Void",
    englishDescription: "Bound by forgotten incantations, seven sacred cushions rest upon the threshold of the void, waiting for the dark geometry to be fulfilled. Arrange the ritualistic offerings to channel the dormant energies of eldritch gods before the lingering shadows consume your mind. Do not be deceived by their soft embrace, for every placement edges the cosmos closer to eternal slumber.",
    title: "🎮 Seven Cushions of the Void",
    description: "Bound by forgotten incantations, seven sacred cushions rest upon the threshold of the void, waiting for the dark geometry to be fulfilled. Arrange the ritualistic offerings to channel the dormant energies of eldritch gods before the lingering shadows consume your mind. Do not be deceived by their soft embrace, for every placement edges the cosmos closer to eternal slumber.",
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/seven-cushions',
    image: '/thumbnails/seven-cushions.png',
    tags: ['web_games'],
    play_count: 0,
  },
  {
    id: 'spectral-horn',
    englishTitle: "Whispers of the Spectral Horn",
    englishDescription: "Unearth the forgotten relic forged in the fires of an elder void. Its haunting refrain tears through the fabric of reality, awakening ancient entities that hunger for mortal souls. Dare you sound the call before the abyssal resonance consumes your mind?",
    title: "🎮 Whispers of the Spectral Horn",
    description: "Unearth the forgotten relic forged in the fires of an elder void. Its haunting refrain tears through the fabric of reality, awakening ancient entities that hunger for mortal souls. Dare you sound the call before the abyssal resonance consumes your mind?",
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/spectral-horn',
    image: '/thumbnails/spectral-horn.png',
    tags: ['web_games'],
    play_count: 0,
  },
  {
    id: 'suupaa-yunikoon',
    englishTitle: "Suupaa Yunikoon: The Abyssal Horn",
    englishDescription: "Beneath the shattered celestial vault, an ancient entity takes the form of a twisted, silver-horned beast to consume the twilight. Perform forbidden rituals to awaken its true nightmare form and tear open the veil between dimensions. Feed the cosmic beast the blood of dying stars to achieve ultimate, dreadful ascension.",
    title: "🎮 Suupaa Yunikoon: The Abyssal Horn",
    description: "Beneath the shattered celestial vault, an ancient entity takes the form of a twisted, silver-horned beast to consume the twilight. Perform forbidden rituals to awaken its true nightmare form and tear open the veil between dimensions. Feed the cosmic beast the blood of dying stars to achieve ultimate, dreadful ascension.",
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/suupaa-yunikoon',
    image: '/thumbnails/suupaa-yunikoon.png',
    tags: ['web_games'],
    play_count: 0,
  },
  {
    id: 'swinicorn',
    englishTitle: "Swinicorn: Ritual of Cosmic Blood",
    englishDescription: "Awakened through forbidden blood rites, the Swinicorn stalks the shadowed threshold between celestial purity and abyssal filth. Tread carefully through the sigil-carved mire, lest your soul be consumed by this horned blasphemy. Answer the dark calling and behold the cosmic corruption of a forgotten ritual.",
    title: "🎮 Swinicorn: Ritual of Cosmic Blood",
    description: "Awakened through forbidden blood rites, the Swinicorn stalks the shadowed threshold between celestial purity and abyssal filth. Tread carefully through the sigil-carved mire, lest your soul be consumed by this horned blasphemy. Answer the dark calling and behold the cosmic corruption of a forgotten ritual.",
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/swinicorn',
    image: '/thumbnails/swinicorn.png',
    tags: ['web_games'],
    play_count: 0,
  },
  {
    id: 'unicorn-fireball',
    englishTitle: "Ritual of the Horned Inferno",
    englishDescription: "Awaken an ancient, horned harbinger of doom to cast scorching hellfire across the corrupted cosmos. Channel forbidden occult energy into relentless fireballs that consume all mortal resistance. The stars bleed as the celestial beast burns everything to ash.",
    title: "🎮 Ritual of the Horned Inferno",
    description: "Awaken an ancient, horned harbinger of doom to cast scorching hellfire across the corrupted cosmos. Channel forbidden occult energy into relentless fireballs that consume all mortal resistance. The stars bleed as the celestial beast burns everything to ash.",
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/unicorn-fireball',
    image: '/thumbnails/unicorn-fireball.png',
    tags: ['web_games'],
    play_count: 0,
  },
  {
    id: 'unifrost',
    englishTitle: "Unifrost Rituals of Frozen Stars",
    englishDescription: "Deep beneath the ancient permafrost, forgotten rituals beckon a chilling entity older than the cosmos itself. Decipher forbidden runes and offer your warmth to the eternal ice before the creeping void consumes your sanity. In this realm of absolute zero, salvation and utter damnation are frozen as one.",
    title: "🎮 Unifrost Rituals of Frozen Stars",
    description: "Deep beneath the ancient permafrost, forgotten rituals beckon a chilling entity older than the cosmos itself. Decipher forbidden runes and offer your warmth to the eternal ice before the creeping void consumes your sanity. In this realm of absolute zero, salvation and utter damnation are frozen as one.",
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/unifrost',
    image: '/thumbnails/unifrost.png',
    tags: ['web_games'],
    play_count: 0,
  },
  {
    id: 'sp13ktra',
    englishTitle: "Rituals of the Forbidden Spectrum",
    englishDescription: "Peer beyond the visible realm to uncover ancient, esoteric frequencies that bind the cosmos. As the veil between dimensions dissolves, malevolent specters awaken to claim those who dare to observe the hidden light. Tread carefully, for the secrets woven into the void will strip away your sanity.",
    title: "🎮 Rituals of the Forbidden Spectrum",
    description: "Peer beyond the visible realm to uncover ancient, esoteric frequencies that bind the cosmos. As the veil between dimensions dissolves, malevolent specters awaken to claim those who dare to observe the hidden light. Tread carefully, for the secrets woven into the void will strip away your sanity.",
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/sp13ktra',
    image: '/thumbnails/sp13ktra.png',
    tags: ['web_games'],
    play_count: 0,
  },
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
