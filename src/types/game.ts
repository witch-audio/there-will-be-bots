export interface UserProfile {
  id: string
  displayName: string
  createdAt: number
}

export interface Draft {
  userId: string
  seasonId: string
  labId: string
  pickedAt: number
  anchorScore: number
  cumulativeDelta: number
  swapsUsedThisWeek: number
  lastSwapAt: number | null
}

export type MarketKind =
  | 'next-sync-leader'
  | 'lead-change-by-sync'
  | 'first-to-threshold'
  | 'next-launch-by-lab'

export type MarketStatus = 'open' | 'locked' | 'resolved' | 'void'

export interface MarketOption {
  id: string
  label: string
  labId?: string
}

export interface PredictionMarket {
  id: string
  seasonId: string
  kind: MarketKind
  question: string
  options: MarketOption[]
  opensAt: number
  closesAt: number
  resolvesAt: number
  resolvedOptionId: string | null
  status: MarketStatus
  createdAt: number
}

export interface UserPrediction {
  userId: string
  marketId: string
  optionId: string
  submittedAt: number
  awardedPoints: number | null
}

export type SentimentValue = -2 | -1 | 0 | 1 | 2

export interface UserSentiment {
  userId: string
  labId: string
  value: SentimentValue
  updatedAt: number
}

export interface LabSentimentAggregate {
  labId: string
  mean: number
  count: number
  updatedAt: number
}

export interface Season {
  id: string
  number: number
  chapterTitle: string
  startsAt: number
  softEndsAt: number
  milestoneThreshold: number
  winningLabId: string | null
  status: 'active' | 'ended'
}

export interface HumanLeaderboardEntry {
  userId: string
  displayName: string
  draftPoints: number
  predictionPoints: number
  totalPoints: number
  draftLabId: string | null
}
