import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { ContentGrid } from '../components/ContentGrid'
import { Sidebar } from '../components/Sidebar'

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
    <div
      className="theme-light"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#fafafa',
      }}
    >
      <Header />

      <div
        style={{
          display: 'flex',
          flex: 1,
        }}
      >
        <main
          style={{
            flex: 1,
            backgroundColor: '#fafafa',
            overflow: 'auto',
          }}
        >
          {/* 카테고리 헤더 */}
          <div
            style={{
              backgroundColor: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              color: 'white',
              padding: '3rem 2rem',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '32px',
                fontWeight: '700',
              }}
            >
              {categoryEmojis[categoryId || '']} {categoryTitles[categoryId || '']}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '16px',
                opacity: 0.9,
              }}
            >
              {t('portal_subtitle')}
            </p>
          </div>

          {/* 콘텐츠 그리드 */}
          <ContentGrid items={sampleContent} />

          {/* 준비 중 메시지 */}
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#888',
              fontSize: '14px',
            }}
          >
            <p>{t('continuing_content')}</p>
          </div>
        </main>

        {/* 우측 사이드바 */}
        <Sidebar />
      </div>

      {/* 푸터 */}
      <footer
        style={{
          backgroundColor: '#333',
          color: '#ccc',
          padding: '2rem',
          textAlign: 'center',
          fontSize: '12px',
          borderTop: '1px solid #555',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ margin: '0.5rem 0' }}>{t('copyright')}</p>
          <p style={{ margin: '0.5rem 0', fontSize: '11px' }}>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>
              {t('privacy_policy')}
            </a>
            {' | '}
            <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>
              {t('terms_of_service')}
            </a>
            {' | '}
            <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>
              {t('contact')}
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
