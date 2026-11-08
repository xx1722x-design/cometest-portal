import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ContentItemUnion } from '../lib/curatedList'
import { addUserTagPreference, recordPlayCount, getGridSpan } from '../lib/curatedList'
import { playSignatureGlitch } from '../lib/signature-effect'
import { triggerAdPopup } from '../lib/adSystem'

interface CuratedGridProps {
  items: ContentItemUnion[]
  columns?: number
}

// Store 히어로 카드 데이터
const STORE_CARD: ContentItemUnion = {
  id: 'store-hero',
  title: 'Premium Store',
  description: 'Premium 3D Assets & Exclusive Skins',
  category: 'store',
  icon: '🛍️',
  path: 'https://store.cometest.com',
  tags: ['store', 'premium'],
  play_count: 0,
} as any

// Ripavid 배너 카드 데이터
const RIPAVID_BANNER: ContentItemUnion = {
  id: 'ripavid-banner',
  title: 'YouTube Video Downloader',
  description: 'All platforms videos in 90 seconds',
  category: 'ripavid',
  icon: '⬇️',
  path: 'https://www.ripavid.com',
  tags: ['ripavid', 'downloader'],
  play_count: 0,
} as any

export function CuratedGrid({ items, columns = 6 }: CuratedGridProps) {
  const navigate = useNavigate()
  const [visibleCount, setVisibleCount] = useState(20)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Responsive column calculation
  const getResponsiveColumns = (width: number): number => {
    if (width < 640) return 2;    // Mobile: 2 columns
    if (width < 1024) return 3;   // Tablet: 3 columns
    if (width < 1280) return 4;   // Small desktop: 4 columns
    return columns;                // Desktop: use prop value
  }

  const responsiveColumns = getResponsiveColumns(windowWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Infinite scroll implementation using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 10, items.length + 1))
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [items.length])

  const handleCardClick = useCallback(
    (e: React.MouseEvent, item: ContentItemUnion) => {
      e.preventDefault()
      e.stopPropagation()

      // Trigger single ad popup on main card click (1 ad only)
      triggerAdPopup()

      // cometest 시그니처 글리치 효과 재생 (사운드 + 시각)
      playSignatureGlitch(e.currentTarget as HTMLElement)

      setTimeout(() => {
        // 스토어 카드와 배너 카드는 새 탭에서 열기
        if (item.id === 'store-hero' || item.id === 'ripavid-banner') {
          window.open(item.path, '_blank', 'noopener,noreferrer')
          return
        }

        // 태그 저장
        if (item.tags) {
          addUserTagPreference(item.tags)
        }
        // play_count 기록
        recordPlayCount(item)
        // 페이지 이동
        navigate(item.path)
      }, 250)
    },
    [navigate]
  )

  // Store 카드와 Ripavid 배너를 맨 앞에 추가
  const allItems = [STORE_CARD, RIPAVID_BANNER, ...items]
  const visibleItems = allItems.slice(0, visibleCount)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${responsiveColumns}, 1fr)`,
        gap: windowWidth < 640 ? '8px' : '16px',
        padding: windowWidth < 640 ? '12px' : '20px',
        maxWidth: '1600px',
        margin: '0 auto',
        gridAutoFlow: 'dense',
      } as React.CSSProperties}
    >
      {visibleItems.map((item, idx) => {
        const { col, row } =
          item.id === 'store-hero' || item.id === 'ripavid-banner'
            ? { col: 2, row: 2 }
            : getGridSpan(idx, visibleItems.length)

        return (
          <div
            key={item.id}
            onClick={(e) => handleCardClick(e, item)}
            style={{
              gridColumn: `span ${col}`,
              gridRow: `span ${row}`,
              cursor: 'pointer',
              aspectRatio: '1',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '20px',
              textAlign: 'center',
            }}
            className={item.id === 'store-hero' ? 'store-card' : item.id === 'ripavid-banner' ? 'ripavid-card' : 'curated-grid-card'}
            onMouseEnter={(e) => {
              if (item.id === 'ripavid-banner') {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 0, 0, 0.4)'
              } else if (item.id !== 'store-hero') {
                e.currentTarget.classList.add('fire-hover')
              }
            }}
            onMouseLeave={(e) => {
              if (item.id === 'ripavid-banner') {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              } else if (item.id !== 'store-hero') {
                e.currentTarget.classList.remove('fire-hover')
              }
            }}
          >
            {/* Store 카드 배경 */}
            {item.id === 'store-hero' && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                    zIndex: 1,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.3), transparent 50%)',
                    zIndex: 2,
                  }}
                />
              </>
            )}

            {/* Ripavid 배너 배경 */}
            {item.id === 'ripavid-banner' && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #FF0000 0%, #FF6B35 50%, #FFD700 100%)',
                    zIndex: 1,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.4), transparent 60%)',
                    zIndex: 2,
                  }}
                />
              </>
            )}

            {/* 일반 카드 배경 - 실제 이미지 또는 그래디언트 */}
            {item.id !== 'store-hero' && (
              <>
                {/* 실제 게임 스크린샷 이미지 배경 */}
                {(item as any).image && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url("${(item as any).image}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      borderRadius: '12px',
                      zIndex: 0,
                    }}
                  />
                )}

                {/* 그래디언트 오버레이 (이미지가 없거나 어두운 처리용) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: (item as any).image ? 'rgba(0, 0, 0, 0.3)' : 'rgba(100, 181, 246, 0.1)',
                    backgroundImage: (item as any).image
                      ? 'none'
                      : 'linear-gradient(135deg, rgba(100, 181, 246, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
                    border: '2px solid rgba(100, 181, 246, 0.2)',
                    borderRadius: '12px',
                    zIndex: 1,
                  }}
                />
                {/* 불꽃 레이어 */}
                <div className="fire-layer" style={{ position: 'absolute', inset: 0, zIndex: 2 }} />
              </>
            )}

            {/* 콘텐츠 */}
            <div
              style={{
                position: 'relative',
                zIndex: item.id === 'store-hero' || item.id === 'ripavid-banner' ? 3 : 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: item.id === 'ripavid-banner' ? '8px' : '4px',
                width: '100%',
              }}
            >
              {/* Ripavid 배너: 아이콘 조합 */}
              {item.id === 'ripavid-banner' ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '48px',
                    marginBottom: '8px',
                  }}
                >
                  <span>🎥</span>
                  <span>➡️</span>
                  <span>{item.icon}</span>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: item.id === 'store-hero' ? '80px' : `${Math.min(60, 20 + col * 10 + row * 10)}px`,
                  }}
                  aria-hidden="true"
                >
                  {item.icon}
                </div>
              )}

              {/* Ripavid 배너: 메인 텍스트 */}
              {item.id === 'ripavid-banner' && (
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: '800',
                    color: '#ffffff',
                    lineHeight: 1.3,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                    textAlign: 'center',
                    maxWidth: '90%',
                    margin: '0',
                  }}
                >
                  유튜브 주소 앞에
                  <br />
                  <span style={{ fontSize: '26px', fontWeight: '900', color: '#FFD700' }}>rrr</span>
                  {' '}누르고 엔터!
                </div>
              )}

              {/* 일반 카드: 제목 */}
              {item.id !== 'ripavid-banner' && (
                <h3
                  style={{
                    margin: '8px 0 4px 0',
                    fontSize: item.id === 'store-hero' ? '28px' : `${Math.max(12, 14 + (col - 1) * 2)}px`,
                    fontWeight: item.id === 'store-hero' ? '800' : '600',
                    color: item.id === 'store-hero' ? '#ffffff' : 'var(--text-primary)',
                    lineHeight: 1.2,
                    textShadow: item.id === 'store-hero' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: windowWidth < 640 ? 1 : 2,
                    WebkitBoxOrient: 'vertical',
                    wordBreak: 'break-word',
                  }}
                >
                  {item.title}
                </h3>
              )}

              {/* Ripavid 배너: 서브 텍스트 */}
              {item.id === 'ripavid-banner' && (
                <p
                  style={{
                    margin: '8px 0 0 0',
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: 1.3,
                    textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                    textAlign: 'center',
                    maxWidth: '90%',
                    fontWeight: '600',
                  }}
                >
                  {item.description}
                </p>
              )}

              {/* 일반 카드: 설명 */}
              {item.id !== 'ripavid-banner' && (
                <p
                  style={{
                    margin: 0,
                    fontSize: item.id === 'store-hero' ? '16px' : `${Math.max(11, 12 + (col - 1) * 1)}px`,
                    color: item.id === 'store-hero' ? 'rgba(255, 255, 255, 0.9)' : 'var(--text-secondary)',
                    opacity: item.id === 'store-hero' ? 1 : 0.8,
                    lineHeight: 1.3,
                    textShadow: item.id === 'store-hero' ? '0 1px 4px rgba(0, 0, 0, 0.2)' : 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: windowWidth < 640 ? 1 : 2,
                    WebkitBoxOrient: 'vertical',
                    wordBreak: 'break-word',
                  }}
                >
                  {item.description}
                </p>
              )}
            </div>

            {item.id !== 'store-hero' && (item.play_count || 0) > 0 && (
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  marginTop: 'auto',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  opacity: 0.6,
                }}
              >
                ▶ {(item.play_count || 0).toLocaleString()} plays
              </div>
            )}
          </div>
        )
      })}

      {/* Infinite scroll trigger */}
      <div
        ref={observerTarget}
        style={{
          gridColumn: `1 / -1`,
          height: '1px',
          visibility: 'hidden',
        }}
      />
    </div>
  )
}
