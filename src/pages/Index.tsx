import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { ContentGrid } from '../components/ContentGrid'
import { Sidebar } from '../components/Sidebar'
import { HeroSection3D } from '../components/HeroSection3D'

interface ContentItem {
  id: string
  title: string
  description: string
  thumbnail: string
  category: 'simulation' | 'game' | 'banner'
  link?: string
  icon?: string
}

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
      description: 'Experience high-quality 3D burger cooking in this interactive clicking game!',
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
    {
      id: 'market-banner',
      title: t('original_asset_store'),
      description: t('asset_store_description'),
      thumbnail: '',
      category: 'banner',
      link: '/store',
      icon: '🛒',
    },
  ]

  const darkBg = '#0a0a0a'
  const lightBg = '#f5f5f5'
  const currentBg = isDarkMode ? darkBg : lightBg

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: currentBg,
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* 헤더 */}
      <Header isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />

      {/* 메인 콘텐츠 영역 */}
      <div
        style={{
          display: 'flex',
          flex: 1,
        }}
      >
        {/* 그리드 콘텐츠 */}
        <main
          style={{
            flex: 1,
            backgroundColor: currentBg,
            overflow: 'auto',
            transition: 'background-color 0.3s ease',
          }}
        >
          {/* 히어로 섹션 - 3D 우주 에셋 */}
          <HeroSection3D isDarkMode={isDarkMode} />

          {/* 콘텐츠 그리드 */}
          <ContentGrid items={contentItems} />

          {/* 페이지네이션 (나중에 추가) */}
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#888888',
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
          backgroundColor: isDarkMode ? '#151515' : '#f0f0f0',
          color: isDarkMode ? '#888888' : '#666666',
          padding: '2rem',
          textAlign: 'center',
          fontSize: '12px',
          borderTop: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ margin: '0.5rem 0' }}>{t('copyright')}</p>
          <p style={{ margin: '0.5rem 0', fontSize: '11px' }}>
            <a href="#" style={{ color: isDarkMode ? '#666666' : '#999999', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = isDarkMode ? '#999999' : '#666666'} onMouseLeave={(e) => e.currentTarget.style.color = isDarkMode ? '#666666' : '#999999'}>
              {t('privacy_policy')}
            </a>
            {' | '}
            <a href="#" style={{ color: isDarkMode ? '#666666' : '#999999', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = isDarkMode ? '#999999' : '#666666'} onMouseLeave={(e) => e.currentTarget.style.color = isDarkMode ? '#666666' : '#999999'}>
              {t('terms_of_service')}
            </a>
            {' | '}
            <a href="#" style={{ color: isDarkMode ? '#666666' : '#999999', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = isDarkMode ? '#999999' : '#666666'} onMouseLeave={(e) => e.currentTarget.style.color = isDarkMode ? '#666666' : '#999999'}>
              {t('contact')}
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
