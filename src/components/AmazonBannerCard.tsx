import { useDarkMode } from '../theme'

interface AmazonBannerCardProps {
  productId: string
  productName: string
  affiliateUrl: string
  description?: string
}

export default function AmazonBannerCard({ productId, productName, affiliateUrl, description }: AmazonBannerCardProps) {
  const [isDark] = useDarkMode()

  const bgColor = isDark ? 'rgba(255, 153, 0, 0.08)' : 'rgba(255, 153, 0, 0.06)'
  const bgColorHover = isDark ? 'rgba(255, 153, 0, 0.15)' : 'rgba(255, 153, 0, 0.12)'
  const borderColor = isDark ? 'rgba(255, 153, 0, 0.3)' : 'rgba(255, 153, 0, 0.4)'
  const borderColorHover = isDark ? 'rgba(255, 153, 0, 0.5)' : 'rgba(255, 153, 0, 0.6)'
  const textColor = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)'
  const secondaryText = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'
  const accentColor = 'rgba(255, 153, 0, 0.9)'
  const ctaBgColor = isDark ? 'rgba(255, 153, 0, 0.3)' : 'rgba(255, 153, 0, 0.2)'
  const shadowColor = isDark ? 'rgba(255, 153, 0, 0.2)' : 'rgba(255, 153, 0, 0.15)'

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="amazon-banner-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 12px',
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        textDecoration: 'none',
        color: textColor,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        minHeight: '100px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = bgColorHover
        e.currentTarget.style.borderColor = borderColorHover
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = `0 4px 12px ${shadowColor}`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = bgColor
        e.currentTarget.style.borderColor = borderColor
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Amazon Logo */}
      <div
        style={{
          fontSize: '24px',
          marginBottom: '8px',
          fontWeight: '700',
          color: accentColor,
        }}
      >
        ★
      </div>

      {/* Product Name */}
      <div
        style={{
          fontSize: '13px',
          fontWeight: '600',
          textAlign: 'center',
          marginBottom: '4px',
          lineHeight: '1.4',
          color: textColor,
        }}
      >
        {productName}
      </div>

      {/* Description */}
      {description && (
        <div
          style={{
            fontSize: '11px',
            textAlign: 'center',
            color: secondaryText,
            lineHeight: '1.3',
            marginTop: '4px',
          }}
        >
          {description}
        </div>
      )}

      {/* CTA */}
      <div
        style={{
          fontSize: '11px',
          marginTop: '8px',
          padding: '4px 8px',
          backgroundColor: ctaBgColor,
          borderRadius: '4px',
          color: accentColor,
          fontWeight: '600',
        }}
      >
        View on Amazon
      </div>
    </a>
  )
}
