import { useTranslation } from 'react-i18next'

const STORE = 'https://store.cometest.com'

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Store',
    links: [
      { label: 'Browse Assets', href: `${STORE}/products` },
      { label: 'Pricing', href: `${STORE}/pricing` },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Login', href: `${STORE}/login` },
      { label: 'Sign Up', href: `${STORE}/signup` },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms of Service', href: `${STORE}/terms` },
      { label: 'Privacy Policy', href: `${STORE}/privacy` },
    ],
  },
]

// store.cometest.com 과 톤을 맞춘 4열 글래스 푸터.
// 스타일은 src/styles/portal.css 의 .site-footer 참고.
export function SiteFooter() {
  const { t } = useTranslation()

  return (
    <footer className="site-footer glass-panel">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <div className="site-footer__logo">
            <span className="site-footer__logo-mark" aria-hidden="true">📚</span>
            <span className="site-footer__logo-text">cometest</span>
          </div>
          <p className="site-footer__tagline">Next-Generation WebXR &amp; 3D Simulation Platform.</p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.heading} className="site-footer__col" aria-label={col.heading}>
            <h3 className="site-footer__heading">{col.heading}</h3>
            <ul>
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}
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
