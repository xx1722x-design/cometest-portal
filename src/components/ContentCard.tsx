import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GLITCH_NAV_DELAY, playPanelBeep, triggerGlitch } from '../lib/sciFiFx'

export interface ContentItem {
  id: string
  title: string
  description: string
  thumbnail: string
  category: 'simulation' | 'game' | 'banner'
  link?: string
  icon?: string
}

interface ContentCardProps {
  item: ContentItem
  className?: string
}

// 글래스 카드 1장. 클릭 시 Sci-Fi 조작음 + 글리치 이펙트를 낸다.
// 스타일은 src/styles/portal.css 의 .glass-card 참고.
export function ContentCard({ item, className }: ContentCardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const activate = (el: HTMLElement) => {
    playPanelBeep()
    triggerGlitch(el)
    if (!item.link) return
    if (item.link.startsWith('/')) {
      // 글리치가 보이도록 내부 이동만 살짝 늦춘다
      const link = item.link
      window.setTimeout(() => navigate(link), GLITCH_NAV_DELAY)
    } else {
      // 팝업 차단을 피하려면 외부 링크는 클릭 핸들러 안에서 바로 연다
      window.open(item.link, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      className={`glass-card${item.link ? ' is-clickable' : ''}${className ? ` ${className}` : ''}`}
      onClick={(e) => activate(e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          activate(e.currentTarget)
        }
      }}
      role={item.link ? 'link' : 'button'}
      tabIndex={0}
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
        <h3 className="glass-card__title" data-text={item.title}>{item.title}</h3>
        <p className="glass-card__desc">{item.description}</p>

        {/* 카테고리 배지 */}
        <span className="glass-badge">
          {item.category === 'simulation' && t('simulation_3d')}
          {item.category === 'game' && t('web_game')}
          {item.category === 'banner' && t('market')}
        </span>
      </div>
    </div>
  )
}
