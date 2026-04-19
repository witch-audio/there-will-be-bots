import { useGameStore } from '../store'

export default function SeasonBanner() {
  const season = useGameStore((s) => s.season)
  const players = useGameStore((s) => s.players)

  if (!season) return null

  const topScore = players.reduce(
    (max, p) => Math.max(max, p.sourceBackedStats.agiScore ?? 0),
    0,
  )
  const progress = Math.min(1, topScore / season.milestoneThreshold)
  const dayOfSeason = Math.max(
    1,
    Math.floor((Date.now() - season.startsAt) / (24 * 60 * 60 * 1000)) + 1,
  )

  return (
    <div className="pointer-events-none absolute left-4 right-4 top-2 z-30 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-dark-border bg-dark-panel/85 px-4 py-1.5 text-[11px] backdrop-blur-md">
        <span className="font-bold text-white">{season.chapterTitle}</span>
        <span className="text-gray-500">·</span>
        <span className="text-gray-400">Day {dayOfSeason}</span>
        <span className="text-gray-500">·</span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-dark-bg">
            <div
              className="h-full rounded-full bg-neon-green transition-all duration-700"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="font-mono tabular-nums text-gray-300">
            {topScore.toFixed(0)} / {season.milestoneThreshold}
          </span>
        </div>
      </div>
    </div>
  )
}
