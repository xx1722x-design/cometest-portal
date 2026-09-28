import { ContentCard, type ContentItem } from './ContentCard'

type BentoSize = 'sm' | 'wide' | 'large'

interface BentoSectionProps {
  id: string
  title: string
  items: ContentItem[]
  // featured: 첫 카드 2×2(large), 두 번째 2×1(wide) — 메인 강조 블록용
  featured?: boolean
}

const GRID_COLS = 4 // 데스크톱 열 수. 태블릿 2열은 이 값의 약수라 같은 규칙으로 빈칸 없이 채워진다.

// 일반 섹션: 마지막 줄이 비지 않도록 필요한 만큼(0~3개) 카드를 2칸(wide)으로 키운다.
// wide 위치는 줄 경계가 맞아떨어지는 자리(앞쪽, 맨 끝)에만 둔다:
//   n%4==3 → [0]           : W s s | s s s s …
//   n%4==2 → [0, n-1]      : W s s | … | s s W
//   n%4==1 → [0, 1, n-1]   : W W | … | s s W
function sizesFor(count: number, featured: boolean): BentoSize[] {
  const sizes: BentoSize[] = Array(count).fill('sm')
  if (featured) {
    if (count > 0) sizes[0] = 'large'
    if (count > 1) sizes[1] = 'wide'
    return sizes
  }
  const wideCount = (GRID_COLS - (count % GRID_COLS)) % GRID_COLS
  const positions = wideCount === 1 ? [0] : wideCount === 2 ? [0, count - 1] : wideCount === 3 ? [0, 1, count - 1] : []
  for (const i of positions) if (i >= 0 && i < count) sizes[i] = 'wide'
  return sizes
}

// 세로로 스크롤하며 훑어보는 벤토 그리드 섹션.
// 스타일은 src/styles/portal.css 의 .bento 참고.
export function BentoSection({ id, title, items, featured = false }: BentoSectionProps) {
  const sizes = sizesFor(items.length, featured)
  const headingId = `section-${id}-title`

  return (
    <section className={`bento${featured ? ' bento--featured' : ''}`} aria-labelledby={headingId}>
      <h2 className="bento__title" id={headingId}>
        {title}
        <span className="bento__count">{items.length}</span>
      </h2>
      <div className="bento__grid">
        {items.map((item, i) => (
          <ContentCard
            key={item.id}
            item={item}
            className={`bento__card${sizes[i] === 'sm' ? '' : ` bento__card--${sizes[i]}`}`}
          />
        ))}
      </div>
    </section>
  )
}
