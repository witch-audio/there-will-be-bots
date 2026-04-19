// Server-side AI sentiment sync, sourced from GDELT 2.0 DOC API.
//
// This is the server sibling of the old client-side `src/data/sentimentSource.ts`.
// Running on the PartyKit server means:
//   1) We only make ONE set of requests, not one per connected client.
//   2) Those requests come from the server's IP, so Chrome's 6-connection-per-host
//      limit is irrelevant and GDELT's per-IP throttle applies to a single caller
//      instead of every player in the room.
//
// Endpoint: https://api.gdeltproject.org/api/v2/doc/doc
// Mode used: TimelineTone — returns average tone (-100..+100, typically -10..+10)
// across articles matching the query, bucketed by day. We filter by
// `sourcecountry:XX` so the tone reflects how news outlets IN that country cover
// AI, not how AI articles elsewhere mention that country.

import type { SentimentBucket } from '../data/aiSentiment'

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

// Countries with enough AI coverage in GDELT to produce a reliable tone.
// Others fall back to the static sentiment lists on the client.
export const GDELT_TRACKED_COUNTRIES: readonly string[] = [
  // Anglosphere
  'US', 'GB', 'CA', 'AU', 'NZ', 'IE',
  // Europe
  'FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'SE', 'NO', 'DK', 'FI', 'PT', 'PL', 'AT', 'CH', 'GR', 'CZ',
  // Asia
  'JP', 'KR', 'CN', 'IN', 'SG', 'MY', 'TH', 'ID', 'PH', 'VN', 'TW', 'PK', 'BD',
  // Americas
  'BR', 'MX', 'AR', 'CL', 'CO', 'PE',
  // MENA + Africa
  'IL', 'AE', 'SA', 'TR', 'EG', 'ZA', 'NG', 'KE', 'MA',
  // Eastern Europe
  'RU', 'UA',
] as const

export interface CountryTone {
  iso: string
  tone: number
  bucket: SentimentBucket
  sampleSize: number
}

export interface SentimentSnapshot {
  byCountry: Record<string, CountryTone>
  fetchedAt: number
  hitCount: number
  trackedCount: number
}

// AI coverage in news skews slightly positive; real distribution is tight.
// Thresholds chosen so green/yellow/red buckets end up roughly balanced.
function bucketFromTone(tone: number): SentimentBucket {
  if (tone >= 1.0) return 'positive'
  if (tone <= -1.5) return 'negative'
  return 'neutral'
}

interface GdeltTimelineResponse {
  timeline?: Array<{
    series?: string
    data?: Array<{ date?: string; value?: number }>
  }>
}

async function fetchOne(
  fetchImpl: FetchLike,
  iso: string,
): Promise<CountryTone | null> {
  const query = `("artificial intelligence" OR "AI" OR "ChatGPT" OR "large language model") sourcecountry:${iso}`
  const url =
    `https://api.gdeltproject.org/api/v2/doc/doc` +
    `?query=${encodeURIComponent(query)}` +
    `&mode=TimelineTone` +
    `&timespan=14d` +
    `&format=json`

  try {
    const res = await fetchImpl(url, {
      headers: {
        'user-agent': 'agigame.live-sync/1.0 (+https://agigame.live)',
        accept: 'application/json,text/plain,*/*',
      },
    })
    if (!res.ok) return null

    // GDELT occasionally returns an empty body or an HTML error page; guard.
    const text = await res.text()
    if (!text || text.trim().startsWith('<')) return null

    const json = JSON.parse(text) as GdeltTimelineResponse
    const points = json.timeline?.[0]?.data ?? []
    const values = points
      .map((p) => (typeof p.value === 'number' ? p.value : Number.NaN))
      .filter((v) => Number.isFinite(v))

    if (values.length === 0) return null
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length

    return {
      iso,
      tone: avg,
      bucket: bucketFromTone(avg),
      sampleSize: values.length,
    }
  } catch {
    return null
  }
}

// GDELT throttles aggressive callers. Serialize with a small delay so a single
// sync takes ~10–15s but doesn't trip the 429 wall the client hit.
const REQUEST_SPACING_MS = 250

async function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export async function buildSentimentSnapshot(
  fetchImpl: FetchLike = fetch,
  now: number = Date.now(),
): Promise<SentimentSnapshot> {
  const byCountry: Record<string, CountryTone> = {}

  for (const iso of GDELT_TRACKED_COUNTRIES) {
    const entry = await fetchOne(fetchImpl, iso)
    if (entry) byCountry[entry.iso] = entry
    await sleep(REQUEST_SPACING_MS)
  }

  return {
    byCountry,
    fetchedAt: now,
    hitCount: Object.keys(byCountry).length,
    trackedCount: GDELT_TRACKED_COUNTRIES.length,
  }
}
