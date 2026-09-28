import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { StoreHero } from '../components/StoreHero'
import { CategoryRow } from '../components/CategoryRow'
import { SiteFooter } from '../components/SiteFooter'
import type { ContentItem } from '../components/ContentCard'

// 메인 페이지 가로 Row 구성: 주제별로 카드 id 를 묶는다
const ROWS: { id: string; titleKey: string; itemIds: string[] }[] = [
  { id: 'physics', titleKey: 'row_physics', itemIds: ['cat-1', 'cat-3', 'cat-5', 'cat-2', 'cat-4', 'cat-6', 'cat-14'] },
  { id: 'nature', titleKey: 'row_nature', itemIds: ['cat-7', 'cat-8', 'cat-9', 'cat-10'] },
  { id: 'math-tech', titleKey: 'row_math_tech', itemIds: ['cat-11', 'cat-12', 'cat-13'] },
  {
    id: 'mystery',
    titleKey: 'row_mystery',
    itemIds: ['cat-15', 'cat-16', 'cat-17', 'cat-18', 'cat-19', 'cat-20', 'cat-21', 'cat-22', 'cat-23'],
  },
  { id: 'games', titleKey: 'web_games', itemIds: ['game-1', 'coming-soon'] },
]

export function Index() {
  const { t } = useTranslation()
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode !== null) {
      setIsDarkMode(JSON.parse(savedMode))
    }
  }, [])

  const handleToggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('darkMode', JSON.stringify(newMode))
  }

  const contentItems: ContentItem[] = [
    {
      id: 'cat-1',
      title: t('measurement'),
      description: t('measurement_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '📏',
    },
    {
      id: 'cat-3',
      title: t('force_motion'),
      description: t('force_motion_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '🎯',
    },
    {
      id: 'cat-5',
      title: t('light_wave'),
      description: t('light_wave_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '🌊',
    },
    {
      id: 'cat-2',
      title: t('electricity'),
      description: t('electricity_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '⚡',
    },
    {
      id: 'cat-4',
      title: t('energy'),
      description: t('energy_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '⚛️',
    },
    {
      id: 'cat-6',
      title: t('atoms'),
      description: t('atoms_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '🔬',
    },
    {
      id: 'cat-7',
      title: t('chemistry'),
      description: t('chemistry_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '🧪',
    },
    {
      id: 'cat-8',
      title: t('earth'),
      description: t('earth_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '🌍',
    },
    {
      id: 'cat-9',
      title: t('astronomy'),
      description: t('astronomy_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '🌌',
    },
    {
      id: 'cat-10',
      title: t('biology'),
      description: t('biology_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '🧬',
    },
    {
      id: 'cat-11',
      title: t('mathematics'),
      description: t('mathematics_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '📐',
    },
    {
      id: 'cat-12',
      title: t('technology'),
      description: t('technology_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '🤖',
    },
    {
      id: 'cat-13',
      title: t('others'),
      description: t('others_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '📚',
    },
    {
      id: 'cat-14',
      title: t('physics_3d'),
      description: t('physics_3d_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '⚙️',
    },
    {
      id: 'cat-15',
      title: t('cryptozoology'),
      description: t('cryptozoology_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '👹',
    },
    {
      id: 'cat-16',
      title: t('paranormal'),
      description: t('paranormal_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '👻',
    },
    {
      id: 'cat-17',
      title: t('mythology'),
      description: t('mythology_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '🐉',
    },
    {
      id: 'cat-18',
      title: t('deepsea'),
      description: t('deepsea_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '🌊',
    },
    {
      id: 'cat-19',
      title: t('liminalspace'),
      description: t('liminalspace_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '🚪',
    },
    {
      id: 'cat-20',
      title: t('xfiles'),
      description: t('xfiles_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '🛸',
    },
    {
      id: 'cat-21',
      title: t('containment'),
      description: t('containment_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '📹',
    },
    {
      id: 'cat-22',
      title: t('apocalypse'),
      description: t('apocalypse_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '💀',
    },
    {
      id: 'cat-23',
      title: t('magic'),
      description: t('magic_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '✨',
    },
    {
      id: 'game-1',
      title: t('web_games'),
      description: t('web_games_desc'),
      thumbnail: '',
      category: 'game',
      link: '/game',
      icon: '🍔',
    },
    {
      id: 'coming-soon',
      title: t('coming_soon_title'),
      description: t('coming_soon_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '🚀',
    },
  ]

  const itemsById = new Map(contentItems.map((item) => [item.id, item]))
  const rows = ROWS.map((row) => ({
    ...row,
    items: row.itemIds.map((id) => itemsById.get(id)).filter((item): item is ContentItem => Boolean(item)),
  }))

  return (
    <div
      className={`portal-bg${isDarkMode ? '' : ' theme-light'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />

      {/* 전체 폭 스토어 히어로 */}
      <StoreHero />

      {/* 주제별 가로 캐러셀 */}
      <main className="rows">
        {rows.map((row) => (
          <CategoryRow key={row.id} id={row.id} title={t(row.titleKey)} items={row.items} />
        ))}
        <p className="rows__more">{t('continuing_content')}</p>
      </main>

      <SiteFooter />
    </div>
  )
}
