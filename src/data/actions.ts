import type { ExecutiveActionId } from '../types'

export interface ExecutiveActionTemplate {
  id: ExecutiveActionId
  name: string
  cost: number
  cooldown: number
  requiresTarget: boolean
  description: string
}

export const EXECUTIVE_ACTIONS: ExecutiveActionTemplate[] = [
  {
    id: 'ddos',
    name: 'DDoS Blitz',
    cost: 900,
    cooldown: 8,
    requiresTarget: true,
    description: 'Crush a rival for 3 ticks. Their compute income drops hard unless they are shielded.',
  },
  {
    id: 'smear',
    name: 'Smear Campaign',
    cost: 700,
    cooldown: 7,
    requiresTarget: true,
    description: 'Hit a rival with a bad press cycle. Their opinion drops while yours gets a small bump.',
  },
  {
    id: 'poach',
    name: 'Talent Poach',
    cost: 800,
    cooldown: 9,
    requiresTarget: true,
    description: 'Steal compute momentum from a rival. You gain a burst and they lose one.',
  },
  {
    id: 'shield',
    name: 'Legal Shield',
    cost: 650,
    cooldown: 10,
    requiresTarget: false,
    description: 'Block the next hostile move for a few ticks and buy time to counter.',
  },
]
