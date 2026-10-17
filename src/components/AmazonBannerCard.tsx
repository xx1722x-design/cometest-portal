import { useState } from 'react'
import { useDarkMode } from '../theme'

interface AmazonBannerCardProps {
  productId: string
  productName: string
  affiliateUrl: string
  description?: string
  rating?: number
}

export default function AmazonBannerCard({
  productId,
  productName,
  affiliateUrl,
  description,
  rating,
}: AmazonBannerCardProps) {
  const [isDark] = useDarkMode()
  const [isHovered, setIsHovered] = useState(false)

  // 제품별 컬러 스킴 (럭셔리 브랜드 컬러)
  const getProductColorScheme = (id: string) => {
    const schemes: Record<
      string,
      {
        primary: string
        accent: string
        icon: string
        name: string
      }
    > = {
      'B08MJZYW8P': {
        primary: '#8B0000', // 진한 버건디
        accent: '#FFD700', // 골드
        icon: '💄',
        name: 'Beauty',
      },
      'B0CK7CJ8YT': {
        primary: '#2C2C2C', // 진한 차콜
        accent: '#E8D5C4', // 크림
        icon: '✨',
        name: 'Care',
      },
      'B07BMBQG73': {
        primary: '#D4248D', // 핫핑크
        accent: '#FFD700', // 골드
        icon: '🧴',
        name: 'Skincare',
      },
      'B0714LK2WT': {
        primary: '#1A1A2E', // 진한 네이비
        accent: '#C0C0C0', // 실버
        icon: '💎',
        name: 'Luxury',
      },
    }
    return (
      schemes[id] || {
        primary: '#1a1a2e',
        accent: '#FFD700',
        icon: '⭐',
        name: 'Premium',
      }
    )
  }

  const colorScheme = getProductColorScheme(productId)

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="amazon-banner-card"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '300px',
        height: '480px',
        backgroundColor: isDark ? '#1a1a2e' : '#f5f5f5',
        borderRadius: '12px',
        textDecoration: 'none',
        color: 'white',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        cursor: 'pointer',
        boxShadow: isHovered
          ? `0 20px 40px rgba(212, 175, 55, 0.4), inset 0 0 30px ${colorScheme.accent}15`
          : '0 10px 30px rgba(0, 0, 0, 0.3)',
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 상단: 럭셔리 컬러 블록 (130px) */}
      <div
        style={{
          width: '100%',
          height: '130px',
          background: `linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.primary}dd 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Amazon 로고 텍스트 */}
        <div
          style={{
            fontSize: '10px',
            fontWeight: '700',
            color: 'rgba(255, 255, 255, 0.7)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          Amazon
        </div>

        {/* 폴백 아이콘 */}
        <div
          style={{
            fontSize: '42px',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
          }}
        >
          {colorScheme.icon}
        </div>

        {/* 카테고리 텍스트 */}
        <div
          style={{
            fontSize: '9px',
            color: colorScheme.accent,
            fontWeight: '600',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          {colorScheme.name}
        </div>
      </div>

      {/* 하단: 제품 정보 영역 (350px) */}
      <div
        style={{
          flex: 1,
          padding: '12px 14px 14px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0',
        }}
      >
        {/* 상단 정보 그룹 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {/* 제품명 */}
          <h3
            style={{
              fontSize: '14px',
              fontWeight: '700',
              lineHeight: '1.3',
              margin: '0',
              color: isDark ? '#FFFFFF' : '#1a1a2e',
            }}
          >
            {productName}
          </h3>

          {/* 별점 */}
          {rating && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: '#FFD700',
                  lineHeight: '1',
                }}
              >
                {'★'.repeat(Math.floor(rating))}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.55)',
                }}
              >
                {rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* 설명 */}
          {description && (
            <p
              style={{
                fontSize: '11px',
                lineHeight: '1.35',
                margin: '2px 0 0 0',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* CTA 버튼 */}
        <button
          style={{
            width: '100%',
            padding: '9px 11px',
            backgroundColor: isHovered ? colorScheme.accent : '#FF9933',
            color: isHovered ? '#1a1a2e' : '#FFFFFF',
            border: `1.5px solid ${colorScheme.accent}40`,
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: isHovered
              ? `0 6px 16px ${colorScheme.accent}40`
              : `0 2px 6px ${colorScheme.accent}20`,
            transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
            marginTop: '8px',
          }}
          onClick={(e) => {
            e.preventDefault()
            window.open(affiliateUrl, '_blank', 'noopener,noreferrer')
          }}
        >
          View on Amazon
        </button>

        {/* Amazon Affiliate 공시 */}
        <p
          style={{
            fontSize: '8px',
            color: isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.35)',
            margin: '4px 0 0 0',
            textAlign: 'center',
            lineHeight: '1.2',
          }}
        >
          As an Amazon Associate, we earn from qualifying purchases.
        </p>
      </div>
    </a>
  )
}
