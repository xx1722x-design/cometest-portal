import { useState } from 'react'

interface AmazonAffiliateCardProps {
  emoji: string
  productName: string
  affiliateUrl: string
}

export default function AmazonAffiliateCard({
  emoji,
  productName,
  affiliateUrl,
}: AmazonAffiliateCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '12px',
        gap: '8px',
        width: '100%',
        height: 'auto',
        backgroundColor: isHovered
          ? 'linear-gradient(135deg, rgba(100, 181, 246, 0.25), rgba(156, 39, 176, 0.15))'
          : 'linear-gradient(135deg, rgba(100, 181, 246, 0.1), rgba(156, 39, 176, 0.05))',
        border: `1px solid ${isHovered ? 'rgba(100, 181, 246, 0.5)' : 'rgba(100, 181, 246, 0.2)'}`,
        borderRadius: '10px',
        backdropFilter: 'blur(8px)',
        textDecoration: 'none',
        color: 'white',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered
          ? '0 12px 28px rgba(100, 181, 246, 0.2), 0 0 20px rgba(100, 181, 246, 0.1)'
          : '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Emoji Icon - Large & Bold */}
      <div
        style={{
          fontSize: '32px',
          lineHeight: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.15) rotate(5deg)' : 'scale(1) rotate(0deg)',
        }}
      >
        {emoji}
      </div>

      {/* Product Name - Clean & Minimal */}
      <h3
        style={{
          fontSize: '11px',
          fontWeight: '700',
          lineHeight: '1.3',
          margin: '0',
          textAlign: 'center',
          wordBreak: 'break-word',
          letterSpacing: '0.3px',
          textTransform: 'uppercase',
          transition: 'all 0.3s ease',
          color: isHovered ? 'rgba(100, 181, 246, 1)' : 'rgba(255, 255, 255, 0.95)',
        }}
      >
        {productName}
      </h3>

      {/* CTA Button - Compact */}
      <button
        style={{
          width: '100%',
          padding: '7px 10px',
          backgroundColor: isHovered
            ? 'linear-gradient(135deg, rgba(100, 181, 246, 0.9), rgba(156, 39, 176, 0.8))'
            : 'linear-gradient(135deg, rgba(100, 181, 246, 0.6), rgba(156, 39, 176, 0.5))',
          color: '#FFFFFF',
          border: `1px solid ${isHovered ? 'rgba(100, 181, 246, 0.7)' : 'rgba(100, 181, 246, 0.4)'}`,
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          letterSpacing: '0.4px',
          textTransform: 'uppercase',
          boxShadow: isHovered
            ? '0 6px 16px rgba(100, 181, 246, 0.25)'
            : '0 2px 8px rgba(100, 181, 246, 0.1)',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          marginTop: '2px',
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          window.open(affiliateUrl, '_blank', 'noopener,noreferrer')
        }}
      >
        🛒 Check Deal
      </button>

      {/* FTC Disclosure - Minimal */}
      <p
        style={{
          fontSize: '7px',
          color: 'rgba(100, 181, 246, 0.5)',
          margin: '2px 0 0 0',
          textAlign: 'center',
          lineHeight: '1.1',
          transition: 'all 0.3s ease',
          opacity: isHovered ? 0.7 : 0.4,
        }}
      >
        Affiliate Link
      </p>
    </a>
  )
}
