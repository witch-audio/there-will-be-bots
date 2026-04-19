import { useGameStore } from '../store'
import { formatShortDateTime } from '../utils/formatters'

export default function NewsTicker() {
  const headlines = useGameStore((s) => s.headlines)
  const worldSnapshotMeta = useGameStore((s) => s.worldSnapshotMeta)

  const tickerText = headlines.join('  ///  ')

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 flex h-7 items-center overflow-hidden border-t border-[var(--color-panel-hairline)] bg-[rgba(6,7,15,0.85)] backdrop-blur-lg">
      <div className="z-10 flex-shrink-0 bg-white/[0.06] px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white">
        {worldSnapshotMeta?.stale ? 'Stale' : 'Feed'}
      </div>
      <div className="flex-1 overflow-hidden whitespace-nowrap">
        <span className="ticker-text inline-block pl-4 text-[11px] text-[var(--color-text-secondary)]">
          {tickerText}
        </span>
      </div>
      {worldSnapshotMeta && (
        <div className="hidden pr-3 font-mono text-[10px] tabular-nums text-[var(--color-text-tertiary)] sm:block">
          {formatShortDateTime(worldSnapshotMeta.asOf)}
        </div>
      )}
    </div>
  )
}
