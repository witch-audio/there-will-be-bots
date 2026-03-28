export interface Resources {
  computePower: number
  publicOpinion: number
  vcFunding: number
}

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
