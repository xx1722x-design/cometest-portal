import { useState } from 'react'
import { useDarkMode } from '../theme'

interface AmazonBannerCardProps {
  productId: string
  productName: string
  affiliateUrl: string
  description?: string
  rating?: number
  backgroundImage?: string
}

export default function AmazonBannerCard({
  productId,
  productName,
  affiliateUrl,
  description,
  rating,
  backgroundImage,
}: AmazonBannerCardProps) {
  const [isDark] = useDarkMode()
  const [isHovered, setIsHovered] = useState(false)

  // 제품별 폴백 배경 그라데이션
  const getBackgroundGradient = (id: string) => {
    const gradients: Record<string, string> = {
      'B08MJZYW8P': 'linear-gradient(135deg, #8B4513 0%, #D4AF37 50%, #8B4513 100%)',
      'B0CK7CJ8YT': 'linear-gradient(135deg, #2C3E50 0%, #E8D5C4 50%, #2C3E50 100%)',
      'B07BMBQG73': 'linear-gradient(135deg, #C41E3A 0%, #FFD700 50%, #C41E3A 100%)',
      'B0714LK2WT': 'linear-gradient(135deg, #3D3D5C 0%, #D4AF37 50%, #3D3D5C 100%)',
    }
    return gradients[id] || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
  }

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
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        maxWidth: '300px',
        height: '800px',
        padding: '24px',
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundColor: backgroundImage ? undefined : '#1a1a2e',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        borderRadius: '12px',
        textDecoration: 'none',
        color: 'white',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        cursor: 'pointer',
        boxShadow: isHovered
          ? '0 20px 40px rgba(212, 175, 55, 0.4), inset 0 0 30px rgba(212, 175, 55, 0.1)'
          : '0 10px 30px rgba(0, 0, 0, 0.3)',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 배경 이미지 없을 시 폴백 그라데이션 */}
      {!backgroundImage && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: getBackgroundGradient(productId),
            zIndex: 1,
          }}
        />
      )}

      {/* 다크 그라데이션 오버레이 (상단 투명 → 하단 검은색) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 40%, rgba(0, 0, 0, 0.8) 100%)',
          zIndex: 2,
        }}
      />

      {/* 컨텐츠 영역 */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          width: '100%',
          height: '100%',
          gap: '12px',
        }}
      >
        {/* 상단 여유 공간 */}
        <div style={{ flex: 1 }} />

        {/* 제품명 */}
        <h3
          style={{
            fontSize: '20px',
            fontWeight: '700',
            lineHeight: '1.3',
            margin: '0 0 8px 0',
            color: '#FFFFFF',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            letterSpacing: '0.5px',
          }}
        >
          {productName}
        </h3>

        {/* 설명 */}
        {description && (
          <p
            style={{
              fontSize: '13px',
              lineHeight: '1.5',
              margin: '0 0 8px 0',
              color: 'rgba(255, 255, 255, 0.85)',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            {description}
          </p>
        )}

        {/* 별점 */}
        {rating && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                fontSize: '16px',
                color: '#FFD700',
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              {'★'.repeat(Math.floor(rating))}
            </span>
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.8)',
                marginLeft: '4px',
              }}
            >
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* CTA 버튼 */}
        <button
          style={{
            width: '100%',
            padding: '14px 16px',
            backgroundColor: isHovered
              ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
              : 'linear-gradient(135deg, #FF9933 0%, #FF8811 100%)',
            color: '#1a1a2e',
            border: '2px solid rgba(255, 215, 0, 0.4)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: isHovered
              ? '0 8px 20px rgba(255, 153, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              : '0 4px 12px rgba(255, 153, 0, 0.2)',
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
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: '8px 0 0 0',
            textAlign: 'center',
            lineHeight: '1.3',
          }}
        >
          As an Amazon Associate, we earn from qualifying purchases.
        </p>
      </div>
    </a>
  )
}
