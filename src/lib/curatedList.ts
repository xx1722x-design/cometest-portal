// 큐레이션 알고리즘: play_count + 사용자 취향(tags) 기반
import type { GameItem } from '../config/gamesData'
import type { SimulationItem } from '../config/simulationsData'

export type ContentItemUnion = GameItem | SimulationItem

const CURATION_STORAGE_KEY = 'cometest_user_tags'

interface UserTagPreference {
  tag: string
  weight: number
  timestamp: number
}

export function getUserTagPreferences(): Map<string, number> {
  try {
    const stored = localStorage.getItem(CURATION_STORAGE_KEY)
    if (!stored) return new Map()

    const preferences: UserTagPreference[] = JSON.parse(stored)
    const weights = new Map<string, number>()

    preferences.forEach(pref => {
      weights.set(pref.tag, (weights.get(pref.tag) || 0) + pref.weight)
    })

    return weights
  } catch {
    return new Map()
  }
}

export function addUserTagPreference(tags: string[]) {
  try {
    const stored = localStorage.getItem(CURATION_STORAGE_KEY)
    const preferences: UserTagPreference[] = stored ? JSON.parse(stored) : []

    tags.forEach(tag => {
      preferences.push({
        tag,
        weight: 1,
        timestamp: Date.now(),
      })
    })

    // 최근 1000개만 유지하여 localStorage 크기 관리
    if (preferences.length > 1000) {
      preferences.splice(0, preferences.length - 1000)
    }

    localStorage.setItem(CURATION_STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // 저장 실패 시 무시
  }
}

export function recordPlayCount(item: ContentItemUnion) {
  // 클라이언트에서는 실제 DB 업데이트 대신 로그만 남김
  console.log(`[Play Count] ${item.title}`, item.play_count || 0)
}

export function calculateCuratedScore(item: ContentItemUnion, userTagWeights: Map<string, number>): number {
  const baseScore = item.play_count || 0
  const tags = item.tags || []

  // 사용자 취향 가중치 계산
  let tagBonus = 0
  tags.forEach(tag => {
    tagBonus += userTagWeights.get(tag) || 0
  })

  // 최종 스코어 = play_count * 0.7 + tagBonus * 10
  return baseScore * 0.7 + tagBonus * 10
}

export function curateItems(items: ContentItemUnion[]): ContentItemUnion[] {
  const userTagWeights = getUserTagPreferences()

  return [...items].sort((a, b) => {
    const scoreA = calculateCuratedScore(a, userTagWeights)
    const scoreB = calculateCuratedScore(b, userTagWeights)
    return scoreB - scoreA
  })
}

export function getGridSpan(index: number, total: number): { col: number; row: number } {
  // 상위 3개는 2x2, 4-10번째는 2x1 또는 1x2, 나머지는 1x1
  if (index < 1) return { col: 2, row: 2 } // 첫 번째: 2x2
  if (index === 1) return { col: 2, row: 1 } // 두 번째: 2x1
  if (index === 2) return { col: 1, row: 2 } // 세 번째: 1x2
  if (index < 10) return { col: index % 2 === 0 ? 2 : 1, row: 2 } // 4-10: 교대로 2x1 또는 1x2
  return { col: 1, row: 1 } // 기본: 1x1
}
