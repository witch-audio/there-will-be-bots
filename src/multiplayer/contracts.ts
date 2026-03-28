import type { AIProduct, PlayerStatus, Resources, ServerFarm, Toast } from '../types'

export const PARTYKIT_ROOM_ID = 'main-world'
export const LEADERBOARD_STORAGE_KEY = 'leaderboard'

export interface MultiplayerPlayer {
  id: string
  name: string
  color: string
  resources: Resources
  buildings: ServerFarm[]
  products: AIProduct[]
  status: PlayerStatus
  connected: boolean
  submittedScore: boolean
}

export interface LeaderboardEntry {
  id: string
  name: string
  score: number
  farms: number
  launchedProducts: number
  tick: number
  won: boolean
  createdAt: number
}

export interface MultiplayerSnapshot {
  phase: 'waiting' | 'playing' | 'finished'
  tick: number
  winnerId: string | null
  players: MultiplayerPlayer[]
  headlines: string[]
  leaderboard: LeaderboardEntry[]
}

export type ClientMessage =
  | { type: 'join'; playerId: string; name: string }
  | { type: 'build-farm'; cityId: string }
  | { type: 'launch-product'; productId: string }
  | { type: 'submit-score'; name: string }
  | { type: 'reset-match' }

export type ServerMessage =
  | { type: 'snapshot'; snapshot: MultiplayerSnapshot }
  | { type: 'toast'; toast: Toast }
