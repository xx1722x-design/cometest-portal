import { useTranslation } from 'react-i18next'
import { playPanelBeep } from '../lib/sciFiFx'

const STORE_URL = 'https://store.cometest.com/'

const CUBE_FACES = ['front', 'back', 'right', 'left', 'top', 'bottom'] as const

function Cube({ className }: { className: string }) {
  return (
    <div className={`cube ${className}`}>
      {CUBE_FACES.map((face) => (
        <div key={face} className={`cube__face cube__face--${face}`} />
      ))}
    </div>
  )
}

// 헤더 바로 아래 전체 폭을 차지하는 넷플릭스식 히어로 섹션 (스토어 소개).
// 스타일은 src/styles/portal.css 의 .hero 참고.
export function StoreHero() {
  const { t } = useTranslation()

  return (
    <section className="hero" aria-labelledby="hero-title">
      {/* 배경: 우주 그라데이션 + 원근 그리드 바닥 + 3D 큐브 */}
      <div className="hero__backdrop" aria-hidden="true">
        <div className="hero__stars" />
        <div className="hero__grid-floor" />
        <div className="hero__halo" />
        <div className="hero__cubes">
          <Cube className="cube--hero" />
          <Cube className="cube--orbit cube--orbit-a" />
          <Cube className="cube--orbit cube--orbit-b" />
        </div>
        <div className="hero__vignette" />
      </div>

      <div className="hero__content">
        <span className="hero__eyebrow">
          <span className="hero__dot" aria-hidden="true" />
          {t('market')} · store.cometest.com
        </span>
        <h1 className="hero__title" id="hero-title">{t('original_asset_store')}</h1>
        <p className="hero__desc">{t('asset_store_description')}</p>
        <div className="hero__actions">
          <a
            className="hero__cta"
            href={STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playPanelBeep()}
          >
            {t('store_cta')}
            <span className="hero__cta-arrow" aria-hidden="true">➔</span>
          </a>
        </div>
      </div>
    </section>
  )
}
