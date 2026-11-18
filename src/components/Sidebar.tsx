import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { getRandomProducts } from '../data/amazonProducts'
import AmazonProductCard from './AmazonProductCard'

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
  const amazonProducts = useMemo(() => getRandomProducts(3), [])

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

      {/* Amazon Product Cards Section */}
      <div
        style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(100, 181, 246, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <h4
          style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: 'rgba(100, 181, 246, 0.9)',
          }}
        >
          ⭐ Featured Deals
        </h4>
        {amazonProducts.map((product, idx) => (
          <AmazonProductCard
            key={`sidebar-product-${idx}`}
            product={product}
            variant="vertical"
          />
        ))}
        <div
          style={{
            fontSize: '8px',
            color: '#999999',
            textAlign: 'center',
            marginTop: '8px',
          }}
        >
          As an Amazon Associate I earn from qualifying purchases.
        </div>
      </div>
    </aside>
  )
}
