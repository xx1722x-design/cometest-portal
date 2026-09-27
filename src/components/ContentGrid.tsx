import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface ContentItem {
  id: string
  title: string
  description: string
  thumbnail: string
  category: 'simulation' | 'game' | 'banner'
  link?: string
  icon?: string
}

interface ContentGridProps {
  items: ContentItem[]
}

export function ContentGrid({ items }: ContentGridProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode !== null) {
      setIsDarkMode(JSON.parse(savedMode))
    }
  }, [])

  const handleItemClick = (item: ContentItem) => {
    if (item.link) {
      if (item.link.startsWith('/')) {
        navigate(item.link)
      } else {
        window.open(item.link, '_blank')
      }
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '1.2rem',
        padding: '1.8rem',
        maxWidth: '100%',
        margin: '0 auto',
        alignContent: 'start',
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => handleItemClick(item)}
          style={{
            cursor: item.link ? 'pointer' : 'default',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
            boxShadow: isDarkMode ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s, background-color 0.3s',
            border: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
          }}
          onMouseEnter={(e) => {
            if (item.link) {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.25)'
              e.currentTarget.style.borderColor = '#7c3aed'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.5)'
            e.currentTarget.style.borderColor = '#333333'
          }}
        >
          {/* 썸네일 */}
          <div
            style={{
              width: '100%',
              height: '150px',
              backgroundColor: isDarkMode ? '#242424' : '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              fontWeight: 'bold',
              fontSize: item.category === 'banner' ? '28px' : '40px',
              color: isDarkMode ? '#666666' : '#cccccc',
              transition: 'background-color 0.3s',
            }}
          >
            {item.icon || (
              <img
                src={item.thumbnail}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}
          </div>

          {/* 컨텐츠 */}
          <div style={{ padding: '1.2rem' }}>
            <h3
              style={{
                margin: '0 0 0.4rem 0',
                fontSize: item.category === 'banner' ? '16px' : '14px',
                fontWeight: '600',
                color: item.category === 'banner' ? '#7c3aed' : (isDarkMode ? '#ffffff' : '#1a1a1a'),
                lineHeight: '1.3',
                transition: 'color 0.3s',
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: isDarkMode ? '#aaaaaa' : '#666666',
                lineHeight: '1.4',
                height: '2.4em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                transition: 'color 0.3s',
              }}
            >
              {item.description}
            </p>

            {/* 카테고리 배지 */}
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  backgroundColor:
                    item.category === 'simulation'
                      ? 'rgba(124,58,237,0.15)'
                      : item.category === 'game'
                        ? 'rgba(124,58,237,0.2)'
                        : 'rgba(124,58,237,0.25)',
                  color:
                    item.category === 'simulation'
                      ? '#a78bfa'
                      : item.category === 'game'
                        ? '#c4b5fd'
                        : '#ddd6fe',
                  fontSize: '11px',
                  fontWeight: '500',
                  borderRadius: '12px',
                }}
              >
                {item.category === 'simulation' && t('simulation_3d')}
                {item.category === 'game' && t('web_game')}
                {item.category === 'banner' && t('market')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
