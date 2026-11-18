import { useState } from 'react'

interface AmazonProductCardProps {
  product: {
    asin: string
    url: string
    imageUrl: string
    title: string
  }
  variant?: 'vertical' | 'compact' | 'horizontal'
}

export default function AmazonProductCard({
  product,
  variant = 'vertical',
}: AmazonProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  if (variant === 'vertical') {
    return (
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="amazon-product-card-vertical"
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '160px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          overflow: 'hidden',
          textDecoration: 'none',
          color: '#1a1a2e',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          boxShadow: isHovered
            ? '0 12px 24px rgba(0, 0, 0, 0.15)'
            : '0 4px 12px rgba(0, 0, 0, 0.08)',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          border: '1px solid #e0e0e0',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image - 100px fixed height */}
        <div
          style={{
            width: '100%',
            height: '100px',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderBottom: '1px solid #eeeeee',
            flexShrink: 0,
          }}
        >
          <img
            src={product.imageUrl}
            alt={product.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              opacity: 1,
            }}
            loading="eager"
            referrerPolicy="no-referrer"
            decoding="async"
          />
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '4px',
            minHeight: 0,
          }}
        >
          {/* Sponsored Badge */}
          <span
            style={{
              fontSize: '8px',
              fontWeight: '600',
              color: '#999999',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}
          >
            Sponsored
          </span>

          {/* Title - 2 lines max */}
          <h3
            style={{
              fontSize: '12px',
              fontWeight: '700',
              lineHeight: '1.2',
              margin: '0',
              color: '#1a1a2e',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '24px',
            }}
          >
            {product.title}
          </h3>

          {/* CTA Button */}
          <button
            style={{
              width: '100%',
              padding: '6px 8px',
              backgroundColor: isHovered ? '#FF9900' : '#FF9900',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              marginTop: '4px',
              boxShadow: isHovered
                ? '0 4px 12px rgba(255, 153, 0, 0.3)'
                : '0 2px 6px rgba(255, 153, 0, 0.15)',
            }}
            onClick={(e) => {
              e.preventDefault()
              window.open(product.url, '_blank', 'noopener,noreferrer')
            }}
          >
            View on Amazon
          </button>
        </div>

        {/* FTC Disclosure */}
        <div
          style={{
            padding: '0 10px 6px',
            fontSize: '7px',
            color: '#999999',
            textAlign: 'center',
            lineHeight: '1',
          }}
        >
          As an Amazon Associate I earn from qualifying purchases.
        </div>
      </a>
    )
  }

  if (variant === 'compact') {
    return (
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="amazon-product-card-compact"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          height: '70px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '0 12px',
          textDecoration: 'none',
          color: '#1a1a2e',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: isHovered
            ? '0 8px 16px rgba(0, 0, 0, 0.12)'
            : '0 2px 8px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e0e0e0',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Compact Product Image */}
        <div
          style={{
            width: '48px',
            height: '48px',
            flexShrink: 0,
            backgroundColor: '#f5f5f5',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            src={product.imageUrl}
            alt={product.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              opacity: 1,
            }}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Middle Content */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <span
            style={{
              fontSize: '8px',
              fontWeight: '600',
              color: '#999999',
              textTransform: 'uppercase',
            }}
          >
            Sponsored
          </span>
          <p
            style={{
              fontSize: '12px',
              fontWeight: '600',
              margin: '0',
              color: '#1a1a2e',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {product.title}
          </p>
        </div>

        {/* CTA Button */}
        <button
          style={{
            padding: '6px 10px',
            backgroundColor: '#FF9900',
            color: '#ffffff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '9px',
            fontWeight: '700',
            cursor: 'pointer',
            flexShrink: 0,
            textTransform: 'uppercase',
            transition: 'all 0.2s ease',
            boxShadow: isHovered
              ? '0 4px 10px rgba(255, 153, 0, 0.3)'
              : '0 2px 5px rgba(255, 153, 0, 0.15)',
          }}
          onClick={(e) => {
            e.preventDefault()
            window.open(product.url, '_blank', 'noopener,noreferrer')
          }}
        >
          View
        </button>
      </a>
    )
  }

  if (variant === 'horizontal') {
    return (
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="amazon-product-card-horizontal"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '12px',
          textDecoration: 'none',
          color: '#1a1a2e',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: isHovered
            ? '0 10px 20px rgba(0, 0, 0, 0.12)'
            : '0 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e0e0e0',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image - Left */}
        <div
          style={{
            width: '80px',
            height: '80px',
            flexShrink: 0,
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            src={product.imageUrl}
            alt={product.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              opacity: 1,
            }}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Content - Middle */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <span
            style={{
              fontSize: '8px',
              fontWeight: '600',
              color: '#999999',
              textTransform: 'uppercase',
            }}
          >
            Sponsored
          </span>
          <h3
            style={{
              fontSize: '13px',
              fontWeight: '700',
              lineHeight: '1.3',
              margin: '0',
              color: '#1a1a2e',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.title}
          </h3>
        </div>

        {/* CTA Button - Right */}
        <button
          style={{
            padding: '8px 12px',
            backgroundColor: '#FF9900',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: '700',
            cursor: 'pointer',
            flexShrink: 0,
            textTransform: 'uppercase',
            transition: 'all 0.2s ease',
            boxShadow: isHovered
              ? '0 4px 12px rgba(255, 153, 0, 0.3)'
              : '0 2px 6px rgba(255, 153, 0, 0.15)',
            whiteSpace: 'nowrap',
          }}
          onClick={(e) => {
            e.preventDefault()
            window.open(product.url, '_blank', 'noopener,noreferrer')
          }}
        >
          View on Amazon
        </button>
      </a>
    )
  }

  return null
}
