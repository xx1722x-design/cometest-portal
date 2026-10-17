import { useState } from 'react'
import { useDarkMode } from '../theme'

interface AmazonBannerCardProps {
  productId: string
  productName: string
  affiliateUrl: string
  description?: string
  rating?: number
  imageUrl?: string
}

export default function AmazonBannerCard({
  productId,
  productName,
  affiliateUrl,
  description,
  rating,
  imageUrl,
}: AmazonBannerCardProps) {
  const [isDark] = useDarkMode()
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // 제품별 폴백 아이콘/색상
  const getProductInfo = (id: string) => {
    const info: Record<string, { icon: string; color: string }> = {
      'B08MJZYW8P': { icon: '💄', color: '#FF69B4' },
      'B0CK7CJ8YT': { icon: '✨', color: '#FFD700' },
      'B07BMBQG73': { icon: '🧴', color: '#FF6B9D' },
      'B0714LK2WT': { icon: '💎', color: '#C0C0C0' },
    }
    return info[id] || { icon: '⭐', color: '#FFD700' }
  }

  const productInfo = getProductInfo(productId)

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
        height: '600px',
        backgroundColor: isDark ? '#1a1a2e' : '#f5f5f5',
        borderRadius: '12px',
        textDecoration: 'none',
        color: 'white',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        cursor: 'pointer',
        boxShadow: isHovered
          ? '0 20px 40px rgba(212, 175, 55, 0.4), inset 0 0 30px rgba(212, 175, 55, 0.1)'
          : '0 10px 30px rgba(0, 0, 0, 0.3)',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 상단: 제품 이미지 영역 (220px) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '220px',
          backgroundColor: isDark ? '#0f0f1e' : '#e8e8e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderBottom: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        {/* 실제 이미지 */}
        {imageUrl && !imageError && (
          <img
            src={imageUrl}
            alt={productName}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imageLoaded ? 1 : 0.5,
              transition: 'opacity 0.3s ease',
            }}
          />
        )}

        {/* 이미지 로드 실패 또는 없을 시 폴백 */}
        {!imageUrl || imageError ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${productInfo.color}20 0%, ${productInfo.color}40 100%)`,
              gap: '8px',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                color: productInfo.color,
              }}
            >
              {productInfo.icon}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
                textAlign: 'center',
              }}
            >
              Premium Product
            </div>
          </div>
        ) : null}
      </div>

      {/* 중앙~하단: 제품 정보 영역 (380px) */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        {/* 제품명 */}
        <h3
          style={{
            fontSize: '16px',
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
              gap: '4px',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: '#FFD700',
              }}
            >
              {'★'.repeat(Math.floor(rating))}
            </span>
            <span
              style={{
                fontSize: '12px',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
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
              fontSize: '12px',
              lineHeight: '1.4',
              margin: '0',
              color: isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.7)',
            }}
          >
            {description}
          </p>
        )}

        {/* CTA 버튼 */}
        <button
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: isHovered
              ? '#FFD700'
              : '#FF9933',
            color: '#1a1a2e',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: isHovered
              ? '0 6px 16px rgba(255, 153, 0, 0.4)'
              : '0 2px 8px rgba(255, 153, 0, 0.2)',
            transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
            marginTop: 'auto',
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
            fontSize: '9px',
            color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
            margin: '0',
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
