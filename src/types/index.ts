export interface Resources {
  computePower: number
  publicOpinion: number
  vcFunding: number
}

export type CitySpecialty =
  | 'launch-lab'
  | 'policy-hub'
  | 'ops-bunker'
  | 'capital-hub'
  | 'scale-yard'
  | 'cooling-grid'

export interface ServerFarm {
  id: string
  cityId: string
  lat: number
  lng: number
  level: number
  computePerTick: number
  ownerId?: string
  ownerName?: string
  ownerColor?: string
}

export interface City {
  id: string
  name: string
  lat: number
  lng: number
  country: string
  computeBonus: number
  unlockCost: number
  specialty: CitySpecialty
  specialtyName: string
  specialtyDescription: string
}

export interface RivalCEO {
  id: string
  name: string
  tagline: string
  color: string
  computePower: number
  farms: ServerFarm[]
  farmInterval: number
  personality: 'aggressive' | 'sneaky' | 'flashy' | 'steady'
}

export interface AIProduct {
  id: string
  name: string
  description: string
  cost: number
  revenuePerTick: number
  opinionEffect: number
  unlocked: boolean
  launched: boolean
}

export interface EventChoice {
  text: string
  effects: Partial<Resources>
}

export interface ChaosEvent {
  id: string
  title: string
  description: string
  choices: EventChoice[]
}

export interface PendingChaosEvent extends ChaosEvent {
  expiresAtTick: number
}

export interface SourceBackedStats extends Resources {
  artificialAnalysisRank: number | null
  artificialAnalysisScore: number | null
  arenaRank: number | null
  arenaScore: number | null
  confidence: number
  launches: string[]
  agiScore: number
  agiScoreTrend: 'up' | 'down' | 'flat'
}

export interface WorldSourceStatus {
  id: string
  label: string
  url: string
  status: 'ok' | 'error'
  checkedAt: number
  detail: string
}

export interface WorldEventImpact {
  companyId: string
  effects: Partial<Resources>
}

export interface WorldEvent {
  id: string
  title: string
  summary: string
  companyIds: string[]
  sourceLabel: string
  sourceUrl: string
  publishedAt: number
  impacts: WorldEventImpact[]
}

export interface WorldEventBriefing {
  id: string
  title: string
  summary: string
  sourceLabel: string
  sourceUrl: string
  publishedAt: number
  companyNames: string[]
  expiresAtTick: number
}

export interface WorldContractTemplate {
  id: string
  title: string
  description: string
  kind: LiveContractKind
  target: number
  rewardLabel: string
  rewards: Partial<Resources>
  sourceLabel: string
  sourceUrl: string
}

export interface WorldCompanySignal {
  id: string
  name: string
  color: string
  tagline: string
  strategy: CompanyStrategy
  sourceBackedStats: SourceBackedStats
  recentLaunches: string[]
  sourceLinks: string[]
  lastUpdatedAt: number
}

export interface WorldSnapshot {
  asOf: number
  windowStart: number
  windowEnd: number
  status: 'fresh' | 'stale' | 'fallback'
  sources: WorldSourceStatus[]
  companies: WorldCompanySignal[]
  events: WorldEvent[]
  contracts: WorldContractTemplate[]
  productCatalog: Omit<AIProduct, 'unlocked' | 'launched'>[]
}

export interface WorldSnapshotMeta {
  asOf: number
  stale: boolean
  nextSyncAt: number
  sourceCount: number
  windowStart: number
  windowEnd: number
  status: WorldSnapshot['status']
}

export type ExecutiveActionId = 'ddos' | 'smear' | 'poach' | 'shield'
export type CompanyStrategy =
  | 'aggressive'
  | 'balanced'
  | 'product'
  | 'defensive'
  | 'expansion'

export interface PlayerEffects {
  disruptionTicks: number
  shieldTicks: number
  momentumTicks: number
}

export type LiveContractKind = 'build' | 'launch' | 'ops' | 'compute'

export interface LiveContract {
  id: string
  title: string
  description: string
  kind: LiveContractKind
  target: number
  expiresAtTick: number
  rewardLabel: string
  progressByPlayer: Record<string, number>
}

export type GamePhase = 'start' | 'playing' | 'won' | 'lost'
export type PlayerStatus = 'playing' | 'won' | 'lost'

export interface Toast {
  id: string
  message: string
  type: 'info' | 'warning' | 'success' | 'chaos'
  timestamp: number
}

export interface GameState {
  // Resources
  resources: Resources
  addResources: (delta: Partial<Resources>) => void

  // Buildings
  buildings: ServerFarm[]
  placeServerFarm: (cityId: string, lat: number, lng: number) => boolean

  // Rivals
  rivals: RivalCEO[]
  advanceRivals: () => void

  // Events
  activeEvent: ChaosEvent | null
  triggerEvent: (event: ChaosEvent) => void
  resolveEvent: (choiceIndex: number) => void

  // Products
  products: AIProduct[]
  launchProduct: (productId: string) => boolean

  // Game
  gamePhase: GamePhase
  tick: number
  setGamePhase: (phase: GamePhase) => void
  incrementTick: () => void

  // Toasts
  toasts: Toast[]
  addToast: (message: string, type: Toast['type']) => void
  removeToast: (id: string) => void

  // Headlines
  headlines: string[]
  addHeadline: (headline: string) => void

  // Reset
  resetGame: () => void
}
