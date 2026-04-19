import { useEffect, useMemo, useState } from 'react'
import { COMPANY_BOTS } from '../data/companies'
import { useGameStore } from '../store'
import { computeWinOdds, formatOdds } from '../utils/odds'

const ROTATE_MS = 15_000

export default function LabSpotlight() {
  const players = useGameStore((s) => s.players)
  const headlines = useGameStore((s) => s.headlines)

  const labs = useMemo(() => players.filter((p) => p.isBot), [players])
  const topLabs = useMemo(
    () =>
      [...labs]
        .sort(
          (a, b) =>
            (b.sourceBackedStats.agiScore ?? 0) -
            (a.sourceBackedStats.agiScore ?? 0),
        )
        .slice(0, 3),
    [labs],
  )

  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (topLabs.length <= 1) {
      return
    }
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % topLabs.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [topLabs.length])

  useEffect(() => {
    if (index >= topLabs.length) {
      setIndex(0)
    }
  }, [index, topLabs.length])

  if (topLabs.length === 0) {
    return null
  }

  const lab = topLabs[index] ?? topLabs[0]
  const template = COMPANY_BOTS.find((c) => c.id === lab.id)
  const score = lab.sourceBackedStats.agiScore ?? 0
  const odds = computeWinOdds(labs).get(lab.id) ?? 0

  const labelWords = lab.name.toLowerCase().split(/\s+/)
  const latestHeadline =
    headlines.find((headline) =>
      labelWords.some((word) => headline.toLowerCase().includes(word)),
    ) ?? headlines[0]

  return (
    <div className="pointer-events-none absolute bottom-20 left-4 z-10 w-[320px]">
      <div className="panel pointer-events-auto rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: lab.color }}
            />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
              Leader · #{index + 1}
            </span>
          </div>
          <div className="flex gap-1">
            {topLabs.map((_, i) => (
              <span
                key={i}
                className={`h-0.5 w-3 rounded-full transition-all ${
                  i === index ? 'bg-white' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-3">
          <span className="text-[15px] font-bold tracking-tight text-white">
            {lab.name}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[22px] font-bold leading-none tabular-nums text-white">
              {score.toFixed(1)}
            </span>
            <span className="font-mono text-[11px] font-bold tabular-nums text-[var(--color-market-leader)]">
              {formatOdds(odds)}
            </span>
          </div>
        </div>

        <p className="mt-1.5 text-[11px] leading-snug text-[var(--color-text-secondary)]">
          {lab.tagline}
        </p>

        {latestHeadline && (
          <p
            className="mt-2 border-l-2 pl-2 text-[10px] leading-snug text-[var(--color-text-tertiary)]"
            style={{ borderColor: `${lab.color}66` }}
          >
            {latestHeadline}
          </p>
        )}

        {template?.officialNewsUrl && (
          <a
            href={template.officialNewsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block font-mono text-[9px] uppercase tracking-wider text-[var(--color-market-you)] hover:underline"
          >
            Official news →
          </a>
        )}
      </div>
    </div>
  )
}
