import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ContentItemUnion } from '../lib/curatedList'
import { addUserTagPreference, recordPlayCount, getGridSpan } from '../lib/curatedList'
import { playSignatureGlitch } from '../lib/signature-effect'

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

export function CuratedGrid({ items, columns = 6 }: CuratedGridProps) {
  const navigate = useNavigate()
  const [visibleCount, setVisibleCount] = useState(20)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Intersection Observer로 무한 스크롤 구현
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
      // cometest 시그니처 글리치 효과 재생 (사운드 + 시각)
      playSignatureGlitch(e.currentTarget as HTMLElement)

      setTimeout(() => {
        // 스토어 카드는 새 탭에서 열기
        if (item.id === 'store-hero') {
          window.open(item.path, '_blank')
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

  // Store 카드를 맨 앞에 추가
  const allItems = [STORE_CARD, ...items]
  const visibleItems = allItems.slice(0, visibleCount)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px',
        padding: '20px',
        maxWidth: '1600px',
        margin: '0 auto',
        gridAutoFlow: 'dense',
      } as React.CSSProperties}
    >
      {visibleItems.map((item, idx) => {
        const { col, row } = item.id === 'store-hero' ? { col: 2, row: 2 } : getGridSpan(idx - 1, items.length)

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
            className={item.id === 'store-hero' ? 'store-card' : 'curated-grid-card'}
            onMouseEnter={(e) => {
              if (item.id !== 'store-hero') {
                e.currentTarget.classList.add('fire-hover')
              }
            }}
            onMouseLeave={(e) => {
              if (item.id !== 'store-hero') {
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

            {/* 일반 카드 배경 */}
            {item.id !== 'store-hero' && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(100, 181, 246, 0.1)',
                    backgroundImage: 'linear-gradient(135deg, rgba(100, 181, 246, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
                    border: '2px solid rgba(100, 181, 246, 0.2)',
                    borderRadius: '12px',
                    zIndex: 0,
                  }}
                />
                {/* 불꽃 레이어 */}
                <div className="fire-layer" style={{ position: 'absolute', inset: 0, zIndex: 1 }} />
              </>
            )}

            {/* 콘텐츠 */}
            <div style={{ position: 'relative', zIndex: item.id === 'store-hero' ? 3 : 2 }}>
              <div
                style={{
                  fontSize: item.id === 'store-hero' ? '80px' : `${Math.min(60, 20 + col * 10 + row * 10)}px`,
                }}
                aria-hidden="true"
              >
                {item.icon}
              </div>

              <h3
                style={{
                  margin: '8px 0 4px 0',
                  fontSize: item.id === 'store-hero' ? '28px' : `${Math.max(12, 14 + (col - 1) * 2)}px`,
                  fontWeight: item.id === 'store-hero' ? '800' : '600',
                  color: item.id === 'store-hero' ? '#ffffff' : 'var(--text-primary)',
                  lineHeight: 1.2,
                  textShadow: item.id === 'store-hero' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none',
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize: item.id === 'store-hero' ? '16px' : `${Math.max(11, 12 + (col - 1) * 1)}px`,
                  color: item.id === 'store-hero' ? 'rgba(255, 255, 255, 0.9)' : 'var(--text-secondary)',
                  opacity: item.id === 'store-hero' ? 1 : 0.8,
                  lineHeight: 1.3,
                  textShadow: item.id === 'store-hero' ? '0 1px 4px rgba(0, 0, 0, 0.2)' : 'none',
                }}
              >
                {item.description}
              </p>
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
