// AI sentiment grouping by ISO 3166-1 alpha-2 country code.
//
// NOTE: An earlier version of this file blended Pew/Ipsos *public trust
// surveys* with Freedom House *internet access* data, which put the US, UK,
// France, Germany etc. in the same bucket as North Korea and Afghanistan.
// That was technically defensible ("publics in wealthy democracies are wary
// of AI") but visually misleading for a game about the AI race — the US is
// the #1 frontier-lab hub, so coloring it red read as wrong to anyone who
// glanced at the globe.
//
// This file now classifies by the dimension players actually care about:
// *AI industry presence + adoption posture*. Surveys still inform the
// neutral/positive split, but survey-cautious wealthy democracies with
// real AI industry (US, UK, DE, FR…) are positive, not negative.
//
// Buckets:
//   POSITIVE = major AI industry presence, heavy consumer/enterprise
//              adoption, or both.
//   NEUTRAL  = emerging adoption, mixed sentiment, secondary market.
//   NEGATIVE = sanctioned, restricted, or very limited access (the
//              actual "AI can't meaningfully reach this country" list).
//
// Live GDELT news-tone data overrides these per country when the server
// successfully fetches it. This static list is the fallback basis.

export type SentimentBucket = 'positive' | 'neutral' | 'negative'

// Major AI industry presence and/or heavy adoption. Frontier-lab HQs,
// serious national AI strategies, large enterprise/consumer uptake.
export const POSITIVE_COUNTRIES: string[] = [
  // North America — frontier-lab home + heavy adoption
  'US', 'CA',
  // Europe with meaningful AI industry or adoption
  'GB', // DeepMind, Anthropic EMEA, Stability, ARM
  'FR', // Mistral, H, Kyutai
  'DE', // Aleph Alpha, DeepL, SAP AI
  'NL', // ASML + strong AI research
  'IE', // Google, OpenAI, Anthropic EMEA HQs
  'SE', // Volvo AI, Ericsson, KTH research
  'CH', // ETH Zurich, Google Zurich
  'IL', // huge AI industry density per capita
  'EE', // digital-forward, national AI strategy
  // Asia AI powerhouses
  'CN', // frontier labs, national push
  'JP', // SoftBank, national AI initiative, strong robotics
  'KR', // Samsung, Naver, LG AI
  'IN', // largest adoption population, big talent pool
  'SG', // AI Singapore, regional hub
  'TW', // TSMC, strong chip + AI integration
  // Gulf AI investors
  'AE', // G42, national AI minister
  'SA', // SDAIA, HUMAIN, large sovereign AI spend
  'QA',
  // High-enthusiasm emerging markets (Ipsos shows >60% upbeat sentiment)
  'ID', 'TH', 'MY', 'PH', 'VN',
  'BR', 'MX', 'TR',
  'EG', 'NG', 'KE', 'ZA',
  // Oceania
  'AU', 'NZ',
]

// Cautious / mixed / emerging. Real AI access but no frontier industry
// and mixed public signal.
export const NEUTRAL_COUNTRIES: string[] = [
  // Rest of Europe — real access, cautious public, smaller industry
  'ES', 'IT', 'PT', 'GR',
  'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'HR', 'SI', 'RS',
  'LT', 'LV', 'MT', 'CY',
  'AT', 'BE', 'LU', 'FI', 'DK', 'NO', 'IS',
  'UA',
  // South Asia emerging
  'PK', 'BD', 'LK', 'NP',
  // SE Asia smaller markets
  'KH', 'LA', 'MN',
  // Central Asia / Caucasus
  'KZ', 'UZ', 'AZ', 'GE', 'AM',
  // Latin America middle tier
  'CO', 'PE', 'CL', 'AR',
  'BO', 'PY', 'UY', 'EC',
  'CR', 'PA', 'DO', 'GT', 'HN', 'SV', 'NI', 'JM',
  // MENA middle tier
  'MA', 'TN', 'DZ', 'JO', 'LB',
  'BH', 'KW', 'OM',
  // Africa middle tier
  'SN', 'CI', 'CM', 'UG', 'TZ', 'ZM', 'BW', 'NA', 'MU', 'GH', 'RW',
]

// Sanctioned / restricted / very limited access. The actual "AI can't
// meaningfully operate here" list. US export-control bans, internet
// shutdowns, or active conflict states.
export const NEGATIVE_COUNTRIES: string[] = [
  'KP', // North Korea
  'IR', // Iran
  'CU', // Cuba
  'SY', // Syria
  'AF', // Afghanistan
  'MM', // Myanmar
  'TM', // Turkmenistan
  'ER', // Eritrea
  'SO', // Somalia
  'YE', // Yemen
  'SS', // South Sudan
  'SD', // Sudan
  'LY', // Libya
  'VE', // Venezuela
  'HT', // Haiti
  'CF', // Central African Republic
  'TD', // Chad
  'NE', // Niger
  'ML', // Mali
  'BF', // Burkina Faso
  'GN', // Guinea
  'LR', // Liberia
  'SL', // Sierra Leone
  'ET', // Ethiopia (partial access, gov restrictions)
  'ZW', // Zimbabwe
  'BY', // Belarus
  'RU', // Russia — sanctions block OpenAI/Anthropic/Google AI access
]

export const SENTIMENT_COLORS = {
  positive: '#22c55e', // green-500
  neutral: '#eab308', // yellow-500
  negative: '#ef4444', // red-500
} as const

export const SENTIMENT_LABELS: Record<SentimentBucket, string> = {
  positive: 'AI hub / high adoption',
  neutral: 'Emerging / mixed',
  negative: 'Restricted / limited access',
}
