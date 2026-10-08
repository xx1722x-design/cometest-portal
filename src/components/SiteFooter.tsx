import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { withLang } from '../i18n/languages'

const STORE = 'https://store.cometest.com'

// 라벨은 i18n 키 — 렌더 시점 언어로 번역한다.
// 포털(/cometest.com) 또는 스토어(store.cometest.com)인지 감지하여 legal 링크 결정
const getColumns = (isStoreView: boolean): { headingKey: string; links: { labelKey: string; href: string }[] }[] => [
  {
    headingKey: 'footer_store',
    links: [
      { labelKey: 'footer_browse_assets', href: `${STORE}/products` },
      { labelKey: 'footer_pricing', href: `${STORE}/pricing` },
    ],
  },
  {
    headingKey: 'footer_company',
    links: [
      { labelKey: 'footer_login', href: `${STORE}/login` },
      { labelKey: 'footer_signup', href: `${STORE}/signup` },
    ],
  },
  {
    headingKey: 'footer_legal',
    links: isStoreView
      ? [
          { labelKey: 'terms_of_service', href: `${STORE}/terms` },
          { labelKey: 'privacy_policy', href: `${STORE}/privacy` },
        ]
      : [
          { labelKey: 'about', href: '/about' },
          { labelKey: 'terms_of_service', href: '/terms' },
          { labelKey: 'privacy_policy', href: '/privacy' },
        ],
  },
]

// store.cometest.com 과 톤을 맞춘 4열 글래스 푸터.
// 스토어 링크엔 현재 언어(?lang=)를 붙여 스토어에서도 같은 언어로 열린다.
// 메인 포털 legal 링크는 /about, /terms, /privacy로 로컬 라우팅한다.
// 스타일은 src/styles/portal.css 의 .site-footer 참고.
export function SiteFooter() {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()

  // 스토어 뷰인지 감지 (/store 경로 또는 호스트 기반 감지)
  const isStoreView = pathname.includes('/store') || typeof window !== 'undefined' && window.location.hostname.includes('store.')
  const COLUMNS = getColumns(isStoreView)

  return (
    <footer className="site-footer glass-panel">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <div className="site-footer__logo">
            <span className="site-footer__logo-mark" aria-hidden="true">📚</span>
            <span className="site-footer__logo-text">cometest</span>
          </div>
          <p className="site-footer__tagline">{t('footer_tagline')}</p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.headingKey} className="site-footer__col" aria-label={t(col.headingKey)}>
            <h3 className="site-footer__heading">{t(col.headingKey)}</h3>
            <ul>
              {col.links.map((link) => {
                // 로컬 라우팅 링크는 target="_blank" 없음, 스토어 링크는 언어 파라미터 추가
                const isLocalLink = link.href.startsWith('/')
                const href = isLocalLink ? link.href : withLang(link.href, i18n.language)
                return (
                  <li key={link.labelKey}>
                    <a
                      href={href}
                      {...(!isLocalLink && { target: '_blank', rel: 'noopener noreferrer' })}
                    >
                      {t(link.labelKey)}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
        ))}
      </div>

      <div className="site-footer__bottom">
        <p>{t('copyright')}</p>

        {/* Legal Credits & Attribution */}
        <div style={{ marginTop: '16px', fontSize: '12px', opacity: '0.8', lineHeight: '1.5' }}>
          <p style={{ margin: '8px 0' }}>
            <strong>PhET Interactive Simulations:</strong> Physics education simulations developed by University of Colorado Boulder.
            Used for educational purposes under the Creative Commons BY 4.0 license.
          </p>
          <p style={{ margin: '8px 0' }}>
            <strong>Archive Notice:</strong> Cometest Portal is an educational simulation and interactive platform.
            All content is provided for personal, non-commercial use only. Unauthorized commercial reproduction is prohibited.
          </p>
        </div>
      </div>
    </footer>
  )
}
