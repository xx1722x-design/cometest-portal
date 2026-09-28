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

// 색은 테마 CSS 변수로만 결정된다 — src/styles/portal.css 의 .portal-sidebar 참고.
export function Sidebar({ links }: SidebarProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // 번역 문구에 이모지가 이미 들어 있으므로 아이콘을 따로 붙이지 않는다
  const defaultLinks: SidebarLink[] = [
    { id: 'about', title: t('about_portal'), path: '/about' },
    { id: 'docs', title: t('documentation'), path: '/docs' },
    { id: 'community', title: t('community'), path: '/community' },
  ]

  const sidebarLinks = links || defaultLinks

  const handleLinkClick = (link: SidebarLink) => {
    if (!link.path) return
    if (link.external) {
      window.open(link.path, '_blank', 'noopener,noreferrer')
    } else {
      navigate(link.path)
    }
  }

  return (
    <aside className="portal-sidebar glass-panel">
      <div>
        <h3 className="portal-sidebar__heading">{t('shortcuts')}</h3>
        <div className="portal-sidebar__links">
          {sidebarLinks.map((link) => (
            <button key={link.id} type="button" className="portal-sidebar__link" onClick={() => handleLinkClick(link)}>
              {link.title}
            </button>
          ))}
        </div>
      </div>

      {/* 공지사항 영역 */}
      <div className="portal-sidebar__notice">
        <h4>{t('notice')}</h4>
        <p>{t('notice_content')}</p>
      </div>
    </aside>
  )
}
