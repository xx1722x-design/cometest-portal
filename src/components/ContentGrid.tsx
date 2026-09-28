import type { ReactNode } from 'react'
import { ContentCard, type ContentItem } from './ContentCard'

interface ContentGridProps {
  items: ContentItem[]
  // 그리드 첫 줄에 먼저 배치할 요소
  leading?: ReactNode
}

// 카드 스타일은 src/styles/portal.css 의 .content-grid / .glass-card 참고.
export function ContentGrid({ items, leading }: ContentGridProps) {
  return (
    <div className="content-grid">
      {leading}
      {items.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  )
}
