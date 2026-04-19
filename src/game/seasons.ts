import { pickChapterTitle } from '../data/chapters'
import type { Season } from '../types/game'

const DAY_MS = 24 * 60 * 60 * 1000
export const DEFAULT_SEASON_SOFT_DURATION_MS = 30 * DAY_MS
export const DEFAULT_MILESTONE_THRESHOLD = 90

export function createNextSeason(params: {
  previousNumber: number
  now: number
  softDurationMs?: number
  milestoneThreshold?: number
}): Season {
  const number = params.previousNumber + 1
  return {
    id: `season-${number}`,
    number,
    chapterTitle: pickChapterTitle(number),
    startsAt: params.now,
    softEndsAt: params.now + (params.softDurationMs ?? DEFAULT_SEASON_SOFT_DURATION_MS),
    milestoneThreshold: params.milestoneThreshold ?? DEFAULT_MILESTONE_THRESHOLD,
    winningLabId: null,
    status: 'active',
  }
}

export interface SeasonEndCheck {
  ended: boolean
  reason: 'milestone' | 'time' | null
  winningLabId: string | null
}

export function shouldEndSeason(params: {
  season: Season
  now: number
  scoresByLab: Record<string, number>
}): SeasonEndCheck {
  const { season, now, scoresByLab } = params
  if (season.status === 'ended') {
    return { ended: false, reason: null, winningLabId: null }
  }

  const crossing = Object.entries(scoresByLab).find(
    ([, score]) => score >= season.milestoneThreshold,
  )
  if (crossing) {
    return { ended: true, reason: 'milestone', winningLabId: crossing[0] }
  }

  if (now >= season.softEndsAt) {
    const topEntry = Object.entries(scoresByLab).sort(
      ([, a], [, b]) => b - a,
    )[0]
    return {
      ended: true,
      reason: 'time',
      winningLabId: topEntry ? topEntry[0] : null,
    }
  }

  return { ended: false, reason: null, winningLabId: null }
}

export function milestoneProgress(season: Season, topScore: number): number {
  if (season.milestoneThreshold <= 0) return 0
  return Math.max(0, Math.min(1, topScore / season.milestoneThreshold))
}
