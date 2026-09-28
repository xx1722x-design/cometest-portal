import type { ReactNode } from 'react'
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
  // 그리드 첫 줄에 먼저 배치할 요소 (예: 대형 피처드 카드)
  leading?: ReactNode
}

// 카드 스타일은 src/styles/portal.css 의 .content-grid / .glass-card 참고.
export function ContentGrid({ items, leading }: ContentGridProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleItemClick = (item: ContentItem) => {
    if (item.link) {
      if (item.link.startsWith('/')) {
        navigate(item.link)
      } else {
        window.open(item.link, '_blank', 'noopener,noreferrer')
      }
    }
  }

  return (
    <div className="content-grid">
      {leading}
      {items.map((item) => (
        <div
          key={item.id}
          className={`glass-card${item.link ? ' is-clickable' : ''}`}
          onClick={() => handleItemClick(item)}
          onKeyDown={(e) => {
            if (item.link && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              handleItemClick(item)
            }
          }}
          role={item.link ? 'link' : undefined}
          tabIndex={item.link ? 0 : undefined}
        >
          {/* 썸네일 */}
          <div className="glass-card__thumb">
            {item.icon ? (
              <span className="glass-card__emoji">{item.icon}</span>
            ) : (
              <img src={item.thumbnail} alt={item.title} />
            )}
          </div>

          {/* 컨텐츠 */}
          <div className="glass-card__body">
            <h3 className="glass-card__title">{item.title}</h3>
            <p className="glass-card__desc">{item.description}</p>

            {/* 카테고리 배지 */}
            <span className="glass-badge">
              {item.category === 'simulation' && t('simulation_3d')}
              {item.category === 'game' && t('web_game')}
              {item.category === 'banner' && t('market')}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
