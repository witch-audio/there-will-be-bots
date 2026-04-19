import type { CompanyStrategy } from '../types'

export interface CompanyBotTemplate {
  id: string
  name: string
  color: string
  tagline: string
  strategy: CompanyStrategy
  sourceAliases: string[]
  arenaAliases: string[]
  officialNewsUrl: string
  platformWeight: number
}

export const COMPANY_BOTS: CompanyBotTemplate[] = [
  {
    id: 'bot-openai',
    name: 'OpenAI',
    color: '#65f0ff',
    tagline: 'Pushes frontier launches fast and lets the benchmarks explain themselves.',
    strategy: 'product',
    sourceAliases: ['OpenAI'],
    arenaAliases: ['OpenAI', 'GPT', 'o3', 'o4', 'Codex'],
    officialNewsUrl: 'https://openai.com/news/',
    platformWeight: 1.1,
  },
  {
    id: 'bot-google',
    name: 'Google',
    color: '#ffd166',
    tagline: 'Turns research wins into distribution before everyone finishes the tweet.',
    strategy: 'expansion',
    sourceAliases: ['Google'],
    arenaAliases: ['Google', 'Gemini'],
    officialNewsUrl: 'https://blog.google/technology/ai/',
    platformWeight: 1.06,
  },
  {
    id: 'bot-anthropic',
    name: 'Anthropic',
    color: '#ffb57a',
    tagline: 'Leans on safety language, then quietly posts top-tier scores.',
    strategy: 'defensive',
    sourceAliases: ['Anthropic'],
    arenaAliases: ['Anthropic', 'Claude'],
    officialNewsUrl: 'https://www.anthropic.com/news',
    platformWeight: 1.03,
  },
  {
    id: 'bot-xai',
    name: 'xAI',
    color: '#ff8c61',
    tagline: 'Treats product velocity like a contact sport.',
    strategy: 'aggressive',
    sourceAliases: ['xAI'],
    arenaAliases: ['xAI', 'Grok'],
    officialNewsUrl: 'https://x.ai/news',
    platformWeight: 0.99,
  },
  {
    id: 'bot-meta',
    name: 'Meta',
    color: '#80a7ff',
    tagline: 'Ships open model moves to keep the pressure on everyone else.',
    strategy: 'aggressive',
    sourceAliases: ['Meta'],
    arenaAliases: ['Meta', 'Llama', 'Muse'],
    officialNewsUrl: 'https://ai.meta.com/blog/',
    platformWeight: 1.01,
  },
  {
    id: 'bot-deepseek',
    name: 'DeepSeek',
    color: '#78f5d7',
    tagline: 'Shows up with strong reasoning and forces everyone to reset the math.',
    strategy: 'product',
    sourceAliases: ['DeepSeek'],
    arenaAliases: ['DeepSeek'],
    officialNewsUrl: 'https://api-docs.deepseek.com/news/news250120',
    platformWeight: 0.95,
  },
  {
    id: 'bot-alibaba',
    name: 'Alibaba',
    color: '#ff9966',
    tagline: 'Competes on capability, price, and scale at the same time.',
    strategy: 'expansion',
    sourceAliases: ['Alibaba'],
    arenaAliases: ['Alibaba', 'Qwen'],
    officialNewsUrl: 'https://www.alibabacloud.com/blog/product-and-technology',
    platformWeight: 1.0,
  },
  {
    id: 'bot-microsoft',
    name: 'Microsoft',
    color: '#7cff9b',
    tagline: 'Wins distribution fights by making every launch look like infrastructure.',
    strategy: 'balanced',
    sourceAliases: ['Microsoft Azure', 'Microsoft AI'],
    arenaAliases: ['Microsoft', 'Microsoft AI', 'MAI', 'Phi'],
    officialNewsUrl: 'https://microsoft.ai/news/',
    platformWeight: 1.16,
  },
]
