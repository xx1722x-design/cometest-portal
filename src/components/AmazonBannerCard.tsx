import { useState } from 'react'
import { useDarkMode } from '../theme'

interface AmazonBannerCardProps {
  productId: string
  productName: string
  affiliateUrl: string
  description?: string
  rating?: number
  imageUrl?: string
  fallbackImageUrl?: string
}

export default function AmazonBannerCard({
  productId,
  productName,
  affiliateUrl,
  description,
  rating,
  imageUrl,
  fallbackImageUrl,
}: AmazonBannerCardProps) {
  const [isDark] = useDarkMode()
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [primaryImageError, setPrimaryImageError] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  const handlePrimaryImageError = () => {
    setPrimaryImageError(true)
    if (fallbackImageUrl) {
      setUseFallback(true)
    }
  }

  const handleFallbackImageError = () => {
    setImageLoaded(true)
  }

  // 제품별 스킴 (컬러 + 아이콘)
  const getProductScheme = (id: string) => {
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
        primary: '#8B0000',
        accent: '#FFD700',
        icon: '💄',
        name: 'Beauty',
      },
      'B0CK7CJ8YT': {
        primary: '#2C2C2C',
        accent: '#E8D5C4',
        icon: '✨',
        name: 'Care',
      },
      'B07BMBQG73': {
        primary: '#D4248D',
        accent: '#FFD700',
        icon: '🧴',
        name: 'Skincare',
      },
      'B0714LK2WT': {
        primary: '#1A1A2E',
        accent: '#C0C0C0',
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

  const scheme = getProductScheme(productId)
  const currentImageUrl = useFallback && fallbackImageUrl ? fallbackImageUrl : imageUrl
  const showFallback = !currentImageUrl || (primaryImageError && !useFallback)

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
        height: '450px',
        backgroundColor: isDark ? '#1a1a2e' : '#f5f5f5',
        borderRadius: '12px',
        textDecoration: 'none',
        color: 'white',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        cursor: 'pointer',
        boxShadow: isHovered
          ? `0 16px 32px rgba(0, 0, 0, 0.25), inset 0 0 20px ${scheme.accent}20`
          : '0 8px 20px rgba(0, 0, 0, 0.15)',
        transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 상단: 제품 이미지 영역 (290px - 2배 확대) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '290px',
          backgroundColor: isDark ? '#0f0f1e' : '#e8e8e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderBottom: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0, 0, 0, 0.08)'}`,
        }}
      >
        {/* 실제 상품 이미지 */}
        {currentImageUrl && !showFallback && (
          <img
            src={currentImageUrl}
            alt={productName}
            onLoad={() => setImageLoaded(true)}
            onError={useFallback ? handleFallbackImageError : handlePrimaryImageError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: imageLoaded ? 1 : 0.3,
              transition: 'opacity 0.4s ease',
            }}
          />
        )}

        {/* 이미지 로드 실패 시 폴백 */}
        {showFallback && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${scheme.primary}40 0%, ${scheme.primary}20 100%)`,
              gap: '8px',
              backdropFilter: 'blur(4px)',
            }}
          >
            {/* Amazon 로고 */}
            <div
              style={{
                fontSize: '10px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Amazon
            </div>

            {/* 폴백 아이콘 */}
            <div
              style={{
                fontSize: '48px',
              }}
            >
              {scheme.icon}
            </div>

            {/* 카테고리 */}
            <div
              style={{
                fontSize: '9px',
                color: scheme.accent,
                fontWeight: '600',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {scheme.name}
            </div>
          </div>
        )}
      </div>

      {/* 하단: 제품 정보 영역 (160px - 컴팩트) */}
      <div
        style={{
          flex: 1,
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 0,
          gap: '2px',
        }}
      >
        {/* 상단 정보 블록 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          {/* 별점 */}
          {rating && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                height: '13px',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  color: '#FFD700',
                  lineHeight: '1',
                }}
              >
                {'★'.repeat(Math.floor(rating))}
              </span>
              <span
                style={{
                  fontSize: '9px',
                  color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* 제품명 */}
          <h3
            style={{
              fontSize: '12px',
              fontWeight: '700',
              lineHeight: '1.2',
              margin: '0',
              color: isDark ? '#FFFFFF' : '#1a1a2e',
              wordBreak: 'break-word',
            }}
          >
            {productName}
          </h3>

          {/* 설명 - 선택적으로 표시 */}
          {description && (
            <p
              style={{
                fontSize: '9px',
                lineHeight: '1.25',
                margin: '0',
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.55)',
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
            padding: '7px 9px',
            backgroundColor: isHovered ? scheme.accent : '#FF9933',
            color: isHovered ? '#1a1a2e' : '#FFFFFF',
            border: 'none',
            borderRadius: '5px',
            fontSize: '9px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            boxShadow: isHovered
              ? `0 6px 14px ${scheme.accent}50`
              : `0 2px 5px ${scheme.accent}25`,
            transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
            marginTop: '2px',
          }}
          onClick={(e) => {
            e.preventDefault()
            window.open(affiliateUrl, '_blank', 'noopener,noreferrer')
          }}
        >
          View on Amazon
        </button>

        {/* 공정위 문구 */}
        <p
          style={{
            fontSize: '7px',
            color: isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.25)',
            margin: '1px 0 0 0',
            textAlign: 'center',
            lineHeight: '1.1',
          }}
        >
          As an Amazon Associate, we earn from qualifying purchases.
        </p>
      </div>
    </a>
  )
}
