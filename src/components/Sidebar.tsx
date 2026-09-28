import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface SidebarLink {
  id: string
  title: string
  path?: string
  icon?: string
  external?: boolean
}

interface SidebarProps {
  links?: SidebarLink[]
}

export function Sidebar({ links }: SidebarProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode !== null) {
      setIsDarkMode(JSON.parse(savedMode))
    }
  }, [])

  const defaultLinks: SidebarLink[] = [
    {
      id: 'market',
      title: `🛒 ${t('original_asset_store')}`,
      path: 'https://store.cometest.com',
      icon: '🛒',
      external: true,
    },
    {
      id: 'about',
      title: `${t('about_portal')}`,
      path: '/about',
      icon: '📖',
    },
    {
      id: 'docs',
      title: `${t('documentation')}`,
      path: '/docs',
      icon: '📚',
    },
    {
      id: 'community',
      title: `${t('community')}`,
      path: '/community',
      icon: '👥',
    },
  ]

  const sidebarLinks = links || defaultLinks

  const handleLinkClick = (link: SidebarLink) => {
    if (link.path) {
      if (link.external) {
        window.open(link.path, '_blank')
      } else {
        navigate(link.path)
      }
    }
  }

  return (
    <aside
      style={{
        width: '280px',
        backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff',
        borderLeft: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <h3
          style={{
            margin: '0 0 1rem 0',
            fontSize: '14px',
            fontWeight: '600',
            color: isDarkMode ? '#999999' : '#666666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'color 0.3s ease',
          }}
        >
          {t('shortcuts')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link)}
              style={{
                padding: '1rem',
                backgroundColor: link.id === 'market'
                  ? (isDarkMode ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.1)')
                  : (isDarkMode ? '#1a1a1a' : '#f5f5f5'),
                border: link.id === 'market' ? '2px solid #7c3aed' : (isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0'),
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: link.id === 'market' ? '600' : '500',
                color: link.id === 'market' ? '#a78bfa' : (isDarkMode ? '#ffffff' : '#1a1a1a'),
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (link.id === 'market') {
                  e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.2)'
                } else {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#242424' : '#efefef'
                }
                e.currentTarget.style.transform = 'translateX(4px)'
                e.currentTarget.style.borderColor = '#7c3aed'
              }}
              onMouseLeave={(e) => {
                if (link.id === 'market') {
                  e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.1)'
                } else {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5'
                }
                e.currentTarget.style.transform = 'translateX(0)'
                e.currentTarget.style.borderColor = link.id === 'market' ? '#7c3aed' : (isDarkMode ? '#333333' : '#e0e0e0')
              }}
            >
              {link.title}
            </button>
          ))}
        </div>
      </div>

      {/* 공지사항 영역 */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: isDarkMode ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.05)',
          borderLeft: '4px solid #7c3aed',
          borderRadius: '6px',
          transition: 'all 0.3s ease',
        }}
      >
        <h4
          style={{
            margin: '0 0 0.5rem 0',
            fontSize: '12px',
            fontWeight: '600',
            color: '#a78bfa',
            textTransform: 'uppercase',
          }}
        >
          {t('notice')}
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: isDarkMode ? '#999999' : '#666666',
            lineHeight: '1.5',
            transition: 'color 0.3s ease',
          }}
        >
          {t('notice_content')}
        </p>
      </div>
    </aside>
  )
}
