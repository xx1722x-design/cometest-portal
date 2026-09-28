import { useTranslation } from 'react-i18next'

const STORE_URL = 'https://store.cometest.com/'

const CUBE_FACES = ['front', 'back', 'right', 'left', 'top', 'bottom'] as const

// 메인 그리드 첫 줄을 가로로 크게 차지하는 스토어 피처드 카드.
// 스타일은 src/styles/portal.css 의 .featured-card / .cube 참고.
export function StoreFeaturedCard() {
  const { t } = useTranslation()

  return (
    <a
      className="glass-card featured-card"
      href={STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${t('original_asset_store')} — store.cometest.com`}
    >
      <div className="featured-card__content">
        <span className="featured-card__eyebrow">
          <span className="featured-card__dot" aria-hidden="true" />
          {t('market')}
        </span>
        <h2 className="featured-card__title">{t('original_asset_store')}</h2>
        <p className="featured-card__desc">{t('asset_store_description')}</p>
        <span className="featured-card__cta">
          store.cometest.com
          <span className="featured-card__arrow" aria-hidden="true">↗</span>
        </span>
      </div>

      <div className="featured-card__visual" aria-hidden="true">
        <div className="featured-card__halo" />
        <div className="featured-card__floor" />
        <div className="cube">
          {CUBE_FACES.map((face) => (
            <div key={face} className={`cube__face cube__face--${face}`} />
          ))}
        </div>
      </div>
    </a>
  )
}
