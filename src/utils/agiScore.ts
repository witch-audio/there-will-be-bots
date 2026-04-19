import type { SourceBackedStats } from '../types'

export type AgiScoreTrend = 'up' | 'down' | 'flat'

export const AGI_SCORE_WEIGHTS = {
  artificialAnalysis: 0.4,
  arena: 0.35,
  launchVelocity: 0.15,
  platform: 0.1,
} as const

const MAX_RANK = 12
const ARENA_ELO_FLOOR = 1100
const ARENA_ELO_CEILING = 1500
const LAUNCH_TARGET = 5
const PLATFORM_WEIGHT_FLOOR = 0.9
const PLATFORM_WEIGHT_CEILING = 1.2

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

function normalizeRank(rank: number | null): number | null {
  if (rank === null || rank <= 0) {
    return null
  }
  return clamp((1 - (rank - 1) / MAX_RANK) * 100)
}

function normalizeArena(score: number | null): number | null {
  if (score === null) {
    return null
  }
  return clamp(
    ((score - ARENA_ELO_FLOOR) / (ARENA_ELO_CEILING - ARENA_ELO_FLOOR)) * 100,
  )
}

function normalizeLaunches(launchCount: number): number {
  return clamp((Math.min(launchCount, LAUNCH_TARGET) / LAUNCH_TARGET) * 100)
}

function normalizePlatform(platformWeight: number): number {
  return clamp(
    ((platformWeight - PLATFORM_WEIGHT_FLOOR) /
      (PLATFORM_WEIGHT_CEILING - PLATFORM_WEIGHT_FLOOR)) *
      100,
  )
}

export function computeAgiScore(
  stats: Pick<
    SourceBackedStats,
    'artificialAnalysisRank' | 'arenaRank' | 'arenaScore' | 'launches'
  >,
  platformWeight: number,
): number {
  const aaNormalized = normalizeRank(stats.artificialAnalysisRank)
  const arenaRankNormalized = normalizeRank(stats.arenaRank)
  const arenaEloNormalized = normalizeArena(stats.arenaScore)
  const arenaBlended =
    arenaEloNormalized !== null && arenaRankNormalized !== null
      ? (arenaEloNormalized + arenaRankNormalized) / 2
      : (arenaEloNormalized ?? arenaRankNormalized)

  const launchNormalized = normalizeLaunches(stats.launches?.length ?? 0)
  const platformNormalized = normalizePlatform(platformWeight)

  let total = 0
  let usedWeight = 0

  if (aaNormalized !== null) {
    total += aaNormalized * AGI_SCORE_WEIGHTS.artificialAnalysis
    usedWeight += AGI_SCORE_WEIGHTS.artificialAnalysis
  }
  if (arenaBlended !== null) {
    total += arenaBlended * AGI_SCORE_WEIGHTS.arena
    usedWeight += AGI_SCORE_WEIGHTS.arena
  }

  total += launchNormalized * AGI_SCORE_WEIGHTS.launchVelocity
  usedWeight += AGI_SCORE_WEIGHTS.launchVelocity

  total += platformNormalized * AGI_SCORE_WEIGHTS.platform
  usedWeight += AGI_SCORE_WEIGHTS.platform

  // If external ranks were missing, renormalize over the weights actually used
  // so a lab isn't dragged to 0 just because a source is stale.
  const score = usedWeight > 0 ? total / usedWeight : platformNormalized
  return Math.round(clamp(score) * 10) / 10
}

export function computeTrend(
  current: number,
  previous: number | null | undefined,
  deadband = 0.3,
): AgiScoreTrend {
  if (previous === null || previous === undefined) {
    return 'flat'
  }
  const diff = current - previous
  if (Math.abs(diff) < deadband) {
    return 'flat'
  }
  return diff > 0 ? 'up' : 'down'
}
