import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ContentCard, type ContentItem } from './ContentCard'

interface CategoryRowProps {
  id: string
  title: string
  items: ContentItem[]
}

// 넷플릭스식 가로 캐러셀 한 줄. 좌우 화살표는 더 넘길 내용이 있을 때만 보인다.
// 스타일은 src/styles/portal.css 의 .row / .row__track 참고.
export function CategoryRow({ id, title, items }: CategoryRowProps) {
  const { t } = useTranslation()
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    // RTL(아랍어)에선 scrollLeft 가 0 에서 음수로 진행하므로 절댓값으로 판정
    const offset = Math.abs(el.scrollLeft)
    setCanPrev(offset > 4)
    setCanNext(offset + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      ro.disconnect()
    }
  }, [updateArrows, items.length])

  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const rtl = getComputedStyle(el).direction === 'rtl'
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: (rtl ? -dir : dir) * el.clientWidth * 0.85, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const headingId = `row-${id}-title`

  return (
    <section className="row" aria-labelledby={headingId}>
      <h2 className="row__title" id={headingId}>
        {title}
        <span className="row__count">{items.length}</span>
      </h2>

      <div className="row__viewport">
        <button
          type="button"
          className="row__arrow row__arrow--prev"
          onClick={() => scrollByPage(-1)}
          aria-label={t('scroll_prev')}
          hidden={!canPrev}
        >
          ‹
        </button>

        <div className="row__track" ref={trackRef}>
          {items.map((item) => (
            <ContentCard key={item.id} item={item} className="row__card" />
          ))}
        </div>

        <button
          type="button"
          className="row__arrow row__arrow--next"
          onClick={() => scrollByPage(1)}
          aria-label={t('scroll_next')}
          hidden={!canNext}
        >
          ›
        </button>
      </div>
    </section>
  )
}
