import type {
  MarketKind,
  MarketOption,
  PredictionMarket,
} from '../types/game'

const MINUTE_MS = 60 * 1000

export interface LabLike {
  id: string
  name: string
}

export function shouldLock(market: PredictionMarket, now: number): boolean {
  return market.status === 'open' && now >= market.closesAt
}

export function shouldResolve(market: PredictionMarket, now: number): boolean {
  return (
    (market.status === 'open' || market.status === 'locked') &&
    now >= market.resolvesAt
  )
}

export function createNextSyncLeaderMarket(params: {
  seasonId: string
  labs: LabLike[]
  opensAt: number
  nextSyncAt: number
  idSeed: string
}): PredictionMarket {
  const { seasonId, labs, opensAt, nextSyncAt, idSeed } = params
  const options: MarketOption[] = labs.map((lab) => ({
    id: lab.id,
    label: lab.name,
    labId: lab.id,
  }))
  return {
    id: `market-next-sync-leader-${idSeed}`,
    seasonId,
    kind: 'next-sync-leader',
    question: 'Who leads at the next sync?',
    options,
    opensAt,
    closesAt: Math.max(opensAt, nextSyncAt - 60 * MINUTE_MS),
    resolvesAt: nextSyncAt,
    resolvedOptionId: null,
    status: 'open',
    createdAt: opensAt,
  }
}

export function resolveMarket(params: {
  market: PredictionMarket
  scoresByLab: Record<string, number>
  leaderLabIdNow: string | null
  leaderLabIdAtOpen: string | null
  firstLabToThreshold: string | null
  firstLaunchingLabSinceOpen: string | null
}): string | null {
  const {
    market,
    leaderLabIdNow,
    leaderLabIdAtOpen,
    firstLabToThreshold,
    firstLaunchingLabSinceOpen,
  } = params

  switch (market.kind) {
    case 'next-sync-leader':
      return leaderLabIdNow
    case 'lead-change-by-sync': {
      if (!leaderLabIdAtOpen || !leaderLabIdNow) return null
      const yes = market.options.find((o) => o.id === 'yes')
      const no = market.options.find((o) => o.id === 'no')
      return leaderLabIdNow !== leaderLabIdAtOpen
        ? yes?.id ?? null
        : no?.id ?? null
    }
    case 'first-to-threshold':
      return firstLabToThreshold
    case 'next-launch-by-lab':
      return firstLaunchingLabSinceOpen
    default:
      return null
  }
}

export function kindSupportsAutoSeed(kind: MarketKind): boolean {
  return kind === 'next-sync-leader'
}
