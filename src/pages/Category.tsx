import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { ContentGrid } from '../components/ContentGrid'
import { Sidebar } from '../components/Sidebar'
import { SiteFooter } from '../components/SiteFooter'

interface ContentItem {
  id: string
  title: string
  description: string
  thumbnail: string
  category: 'simulation' | 'game' | 'banner'
  link?: string
  icon?: string
}

export function Category() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { t } = useTranslation()

  const categoryTitles: Record<string, string> = {
    measurement: t('measurement'),
    electricity: t('electricity'),
    force_motion: t('force_motion'),
    energy: t('energy'),
    light_wave: t('light_wave'),
    atoms: t('atoms'),
    chemistry: t('chemistry'),
    earth: t('earth'),
    astronomy: t('astronomy'),
    biology: t('biology'),
    mathematics: t('mathematics'),
    technology: t('technology'),
    others: t('others'),
  }

  const categoryEmojis: Record<string, string> = {
    measurement: '📊',
    electricity: '⚡',
    force_motion: '🎯',
    energy: '💡',
    light_wave: '🌈',
    atoms: '⚛️',
    chemistry: '🧪',
    earth: '🌍',
    astronomy: '🌌',
    biology: '🧬',
    mathematics: '📐',
    technology: '💻',
    others: '📦',
  }

  const sampleContent: ContentItem[] = [
    {
      id: 'sample-1',
      title: t('sample_sim_1_title'),
      description: t('sample_sim_1_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '🎬',
    },
    {
      id: 'sample-2',
      title: t('sample_sim_2_title'),
      description: t('sample_sim_2_desc'),
      thumbnail: '',
      category: 'simulation',
      icon: '🎨',
    },
  ]

  return (
    <div className="portal-bg" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <div className="category-layout">
        <main className="category-main">
          {/* 카테고리 헤더 — 짙은 그라데이션 위 흰 글씨라 다크/라이트 모두 선명 */}
          <div className="category-hero">
            <h1 className="category-hero__title">
              <span aria-hidden="true">{categoryEmojis[categoryId || '']}</span> {categoryTitles[categoryId || '']}
            </h1>
            <p className="category-hero__subtitle">{t('portal_subtitle')}</p>
          </div>

          {/* 콘텐츠 그리드 */}
          <ContentGrid items={sampleContent} />

          {/* 준비 중 메시지 */}
          <p className="category-main__more">{t('continuing_content')}</p>
        </main>

        {/* 우측 사이드바 */}
        <Sidebar />
      </div>

      <SiteFooter />
    </div>
  )
}
