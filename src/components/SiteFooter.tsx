import { useTranslation } from 'react-i18next'
import { withLang } from '../i18n/languages'

const STORE = 'https://store.cometest.com'

// 라벨은 i18n 키 — 렌더 시점 언어로 번역한다.
const COLUMNS: { headingKey: string; links: { labelKey: string; href: string }[] }[] = [
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
    links: [
      { labelKey: 'terms_of_service', href: `${STORE}/terms` },
      { labelKey: 'privacy_policy', href: `${STORE}/privacy` },
    ],
  },
]

// store.cometest.com 과 톤을 맞춘 4열 글래스 푸터.
// 스토어 링크엔 현재 언어(?lang=)를 붙여 스토어에서도 같은 언어로 열린다.
// 스타일은 src/styles/portal.css 의 .site-footer 참고.
export function SiteFooter() {
  const { t, i18n } = useTranslation()

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
              {col.links.map((link) => (
                <li key={link.labelKey}>
                  <a href={withLang(link.href, i18n.language)} target="_blank" rel="noopener noreferrer">
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="site-footer__bottom">
        <p>{t('copyright')}</p>
      </div>
    </footer>
  )
}
