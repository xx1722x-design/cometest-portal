import { Header } from '../components/Header'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Store() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
      }}
    >
      <Header />

      <main
        style={{
          flex: 1,
          padding: '3rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            padding: '3rem',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🛒</div>
          <h1
            style={{
              margin: '0 0 1rem 0',
              fontSize: '32px',
              fontWeight: '700',
              color: '#333',
            }}
          >
            {t('original_asset_store')}
          </h1>
          <p
            style={{
              margin: '0 0 2rem 0',
              fontSize: '16px',
              color: '#666',
              lineHeight: '1.6',
            }}
          >
            {t('asset_store_description')}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '2rem',
            }}
          >
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              {t('go_home')}
            </button>
            <button
              onClick={() => navigate('/game')}
              style={{
                padding: '1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              Play
            </button>
          </div>

          {/* 상품 목록 영역 (나중에 통합할 부분) */}
          <div
            style={{
              marginTop: '3rem',
              padding: '2rem',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              border: '2px dashed #ddd',
            }}
          >
            <p
              style={{
                color: '#888',
                fontSize: '14px',
                margin: 0,
              }}
            >
              {t('coming_soon')}
            </p>
          </div>
        </div>
      </main>

      <footer
        style={{
          backgroundColor: '#333',
          color: '#ccc',
          padding: '2rem',
          textAlign: 'center',
          fontSize: '12px',
        }}
      >
        <p style={{ margin: 0 }}>{t('copyright')}</p>

        {/* Coupang Dynamic Affiliate Banner */}
        <div
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <iframe
            src="https://ads-partners.coupang.com/widgets.html?id=1039159&template=carousel&trackingCode=AF1892950&subId=&width=120&height=240&tsource="
            width="120"
            height="240"
            frameBorder="0"
            scrolling="no"
            referrerPolicy="unsafe-url"
            style={{ borderRadius: '4px' }}
          />
        </div>

        {/* FTC Disclosure */}
        {/* FTC Disclosure - Korean & English */}
        <div style={{ marginTop: '1rem' }}>
          <p
            style={{
              margin: '0.5rem 0',
              opacity: '0.5',
              fontSize: '11px',
              lineHeight: '1.4',
            }}
          >
            이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
          </p>
          <p
            style={{
              margin: '0.5rem 0 0 0',
              opacity: '0.5',
              fontSize: '11px',
              lineHeight: '1.4',
            }}
          >
            As a Coupang Partners affiliate, we earn a commission from qualifying purchases.
          </p>
        </div>
      </footer>
    </div>
  )
}
