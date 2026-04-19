import { useCallback, useMemo, useRef } from 'react'
import Map, {
  Layer,
  Source,
  type MapRef,
  type FillLayerSpecification,
} from 'react-map-gl/mapbox'
import {
  NEGATIVE_COUNTRIES,
  NEUTRAL_COUNTRIES,
  POSITIVE_COUNTRIES,
  SENTIMENT_COLORS,
  SENTIMENT_LABELS,
  type SentimentBucket,
} from '../data/aiSentiment'
import type { SentimentBroadcast } from '../multiplayer/contracts'
import { useGameStore } from '../store'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

const AMBIENT_VIEW = {
  longitude: 10,
  latitude: 18,
  zoom: 1.65,
  pitch: 14,
  bearing: 0,
} as const

const COUNTRY_BOUNDARIES_SOURCE = 'mapbox://mapbox.country-boundaries-v1'
const COUNTRY_SOURCE_LAYER = 'country_boundaries'

/**
 * Merge live GDELT tone (broadcast by the PartyKit server) with the
 * hand-curated static lists, then collapse duplicates and build the Mapbox
 * `match` expression for the fill layer.
 *
 * Live data wins for any ISO code the server returned. Countries the server
 * didn't cover fall through to the static bucket.
 */
function buildSentimentFill(
  live: SentimentBroadcast | null,
): FillLayerSpecification['paint'] {
  const byBucket: Record<SentimentBucket, Set<string>> = {
    positive: new Set<string>(POSITIVE_COUNTRIES),
    negative: new Set<string>(NEGATIVE_COUNTRIES),
    neutral: new Set<string>(NEUTRAL_COUNTRIES),
  }

  if (live) {
    for (const [iso, entry] of Object.entries(live.byCountry)) {
      byBucket.positive.delete(iso)
      byBucket.negative.delete(iso)
      byBucket.neutral.delete(iso)
      byBucket[entry.bucket].add(iso)
    }
  }

  // Enforce unique branches: positive > negative > neutral.
  const positive = Array.from(byBucket.positive)
  const negative = Array.from(byBucket.negative).filter(
    (c) => !byBucket.positive.has(c),
  )
  const neutral = Array.from(byBucket.neutral).filter(
    (c) => !byBucket.positive.has(c) && !byBucket.negative.has(c),
  )

  // Mapbox `match` chokes on empty branch-label arrays. Only add non-empty ones.
  const branches: (string | string[])[] = []
  if (positive.length) branches.push(positive, SENTIMENT_COLORS.positive)
  if (negative.length) branches.push(negative, SENTIMENT_COLORS.negative)
  if (neutral.length) branches.push(neutral, SENTIMENT_COLORS.neutral)

  return {
    'fill-color': [
      'match',
      ['get', 'iso_3166_1'],
      ...branches,
      'rgba(0,0,0,0)', // unlisted: transparent so the globe shows through
    ],
    'fill-opacity': 0.28,
    'fill-outline-color': 'rgba(255,255,255,0.08)',
  } as FillLayerSpecification['paint']
}

export default function GameMap() {
  const mapRef = useRef<MapRef | null>(null)
  const aiSentiment = useGameStore((state) => state.aiSentiment)
  const connectionStatus = useGameStore((state) => state.connectionStatus)

  const sentimentFillColor = useMemo(
    () => buildSentimentFill(aiSentiment),
    [aiSentiment],
  )

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn({ duration: 260 })
  }, [])
  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut({ duration: 260 })
  }, [])
  const handleResetView = useCallback(() => {
    mapRef.current?.flyTo({
      center: [AMBIENT_VIEW.longitude, AMBIENT_VIEW.latitude],
      zoom: AMBIENT_VIEW.zoom,
      pitch: AMBIENT_VIEW.pitch,
      bearing: AMBIENT_VIEW.bearing,
      duration: 700,
    })
  }, [])

  if (!MAPBOX_TOKEN) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(80,80,160,0.25)_0%,rgba(10,10,20,0.95)_60%)]"
      />
    )
  }

  return (
    <>
      <div className="absolute inset-0">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={AMBIENT_VIEW}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          projection={{ name: 'globe' }}
          minZoom={0.8}
          maxZoom={16}
          dragRotate
          touchZoomRotate
          attributionControl={false}
          fog={{
            range: [0.8, 8],
            color: '#0a0a1a',
            'horizon-blend': 0.1,
            'high-color': '#1a1a3a',
            'space-color': '#050510',
            'star-intensity': 0.6,
          }}
        >
          <Source
            id="country-boundaries"
            type="vector"
            url={COUNTRY_BOUNDARIES_SOURCE}
          >
            <Layer
              id="ai-sentiment-fill"
              type="fill"
              source-layer={COUNTRY_SOURCE_LAYER}
              paint={sentimentFillColor}
            />
          </Source>
        </Map>
      </div>

      {/*
       * Map controls live on the top-left column, under the Leaderboard header
       * (top-[124px]) and well clear of:
       *   - MarketsPanel (top-[124px] right-4)
       *   - LabSpotlight (bottom-20 left-4)
       *   - HumanLeaderboard (bottom-16 right-4)
       * Stacked vertically: zoom controls first, then the sentiment legend.
       */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetView}
      />
      <SentimentLegend
        aiSentiment={aiSentiment}
        connectionStatus={connectionStatus}
      />
    </>
  )
}

function MapControls({
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}) {
  return (
    <div className="pointer-events-auto absolute left-4 top-[124px] z-30 flex flex-col overflow-hidden rounded-lg border border-white/10 bg-black/55 text-white/85 shadow-[0_6px_18px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <button
        type="button"
        onClick={onZoomIn}
        aria-label="Zoom in"
        className="flex h-9 w-9 items-center justify-center text-lg leading-none transition hover:bg-white/10 active:bg-white/15"
      >
        +
      </button>
      <div className="h-px bg-white/10" aria-hidden />
      <button
        type="button"
        onClick={onZoomOut}
        aria-label="Zoom out"
        className="flex h-9 w-9 items-center justify-center text-lg leading-none transition hover:bg-white/10 active:bg-white/15"
      >
        −
      </button>
      <div className="h-px bg-white/10" aria-hidden />
      <button
        type="button"
        onClick={onReset}
        aria-label="Reset view"
        className="flex h-9 w-9 items-center justify-center text-[11px] leading-none tracking-wider transition hover:bg-white/10 active:bg-white/15"
      >
        ⌂
      </button>
    </div>
  )
}

function SentimentLegend({
  aiSentiment,
  connectionStatus,
}: {
  aiSentiment: SentimentBroadcast | null
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error'
}) {
  const liveCount = aiSentiment?.hitCount ?? 0
  const statusLabel = getStatusLabel(aiSentiment, connectionStatus, liveCount)

  return (
    <div className="pointer-events-none absolute left-4 top-[252px] z-20 w-[180px] rounded-lg border border-white/10 bg-black/55 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
      <div className="mb-1.5 text-[9px] tracking-[0.28em] text-white/50">
        AI Sentiment
      </div>
      <ul className="space-y-1">
        {(
          [
            ['positive', SENTIMENT_LABELS.positive] as const,
            ['neutral', SENTIMENT_LABELS.neutral] as const,
            ['negative', SENTIMENT_LABELS.negative] as const,
          ]
        ).map(([bucket, label]) => (
          <li key={bucket} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: SENTIMENT_COLORS[bucket] }}
            />
            <span className="normal-case tracking-normal text-[11px] text-white/85">
              {label}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-2 border-t border-white/10 pt-1.5 text-[9px] normal-case tracking-normal text-white/50">
        {statusLabel}
      </div>
    </div>
  )
}

function getStatusLabel(
  aiSentiment: SentimentBroadcast | null,
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error',
  liveCount: number,
): string {
  if (connectionStatus === 'error') {
    return 'Room offline — static baseline'
  }
  if (!aiSentiment) {
    return connectionStatus === 'connected'
      ? 'Loading GDELT…'
      : 'Static baseline'
  }
  if (liveCount === 0) {
    return 'GDELT rate-limited — static baseline'
  }
  return `GDELT live · ${liveCount} countries`
}
