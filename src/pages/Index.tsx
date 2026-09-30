import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { StoreHero } from '../components/StoreHero'
import { BentoSection } from '../components/BentoSection'
import { SiteFooter } from '../components/SiteFooter'
import type { ContentItem } from '../components/ContentCard'

// 메인 페이지 섹션 구성 (벤토 그리드).
// featured: 가장 눈길을 끄는 카드 — 플레이 가능한 버거 게임(2×2)과 마법진 이펙트(2×1).
// 인기 지표 데이터가 아직 없어 '실제로 플레이 가능 + 시각 효과' 기준으로 골랐다.
// 추천에 올린 카드는 아래 주제 섹션에서 빼 중복 노출을 막는다.
const SECTIONS: { id: string; titleKey: string; itemIds: string[]; featured?: boolean }[] = [
  { id: 'featured', titleKey: 'featured_title', itemIds: ['game-1', 'cat-23', 'cat-14', 'coming-soon'], featured: true },
  { id: 'physics', titleKey: 'row_physics', itemIds: ['cat-1', 'cat-3', 'cat-5', 'cat-2', 'cat-4', 'cat-6'] },
  { id: 'nature', titleKey: 'row_nature', itemIds: ['cat-7', 'cat-8', 'cat-9', 'cat-10'] },
  { id: 'math-tech', titleKey: 'row_math_tech', itemIds: ['cat-11', 'cat-12', 'cat-13'] },
  {
    id: 'mystery',
    titleKey: 'row_mystery',
    itemIds: ['cat-15', 'cat-16', 'cat-17', 'cat-18', 'cat-19', 'cat-20', 'cat-21', 'cat-22'],
  },
]

export function Index() {
  const { t } = useTranslation()
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
      link: '/chemistry',
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
  const sections = SECTIONS.map((section) => ({
    ...section,
    items: section.itemIds.map((id) => itemsById.get(id)).filter((item): item is ContentItem => Boolean(item)),
  }))

  return (
    <div
      className="portal-bg"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header />

      {/* 전체 폭 스토어 히어로 */}
      <StoreHero />

      {/* 추천 + 주제별 벤토 그리드 */}
      <main className="sections">
        {sections.map((section) => (
          <BentoSection
            key={section.id}
            id={section.id}
            title={t(section.titleKey)}
            items={section.items}
            featured={section.featured}
          />
        ))}
        <p className="sections__more">{t('continuing_content')}</p>
      </main>

      <SiteFooter />
    </div>
  )
}
