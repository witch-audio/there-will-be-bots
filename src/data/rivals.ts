import type { RivalCEO } from '../types'

export const RIVAL_TEMPLATES: Omit<RivalCEO, 'computePower' | 'farms'>[] = [
  {
    id: 'elon-x9',
    name: 'Elon-X9',
    tagline: 'Wants to put servers on Mars. Already filed permits.',
    color: '#ff4444',
    farmInterval: 18,
    personality: 'flashy',
  },
  {
    id: 'zuck-3000',
    name: 'Zuck-3000',
    tagline: 'Building the Metaverse... again. This time with more legs.',
    color: '#4488ff',
    farmInterval: 12,
    personality: 'sneaky',
  },
  {
    id: 'bezos-prime',
    name: 'Bezos-Prime',
    tagline: 'Same-day Singularity delivery. Free for Prime members.',
    color: '#ff8800',
    farmInterval: 14,
    personality: 'aggressive',
  },
  {
    id: 'satya-neural',
    name: 'Satya Neural',
    tagline: 'Has rebranded everything with "Copilot". Even the coffee machine.',
    color: '#00cc66',
    farmInterval: 16,
    personality: 'steady',
  },
]
