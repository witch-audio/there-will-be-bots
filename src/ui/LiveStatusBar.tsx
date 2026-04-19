import { useEffect, useState } from 'react'
import { useGameStore } from '../store'

function formatRelative(timestamp: number | null, now: number) {
  if (!timestamp) {
    return '—'
  }
  const diff = Math.max(0, now - timestamp)
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function formatNextSync(timestamp: number | null, now: number) {
  if (!timestamp) return '—'
  const diff = Math.max(0, timestamp - now)
  const hours = Math.floor(diff / 3_600_000)
  const mins = Math.floor((diff % 3_600_000) / 60_000)
  if (hours > 0) return `${hours}h${mins.toString().padStart(2, '0')}`
  return `${mins}m`
}

export default function LiveStatusBar() {
  const worldSnapshotMeta = useGameStore((s) => s.worldSnapshotMeta)
  const connectionStatus = useGameStore((s) => s.connectionStatus)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const stale = worldSnapshotMeta?.stale ?? false
  const connected = connectionStatus === 'connected'
  const statusLabel = !connected ? 'Reconnect' : stale ? 'Stale' : 'Live'
  const statusColor = !connected
    ? 'bg-[var(--color-market-down)]'
    : stale
      ? 'bg-[var(--color-market-warn)]'
      : 'bg-[var(--color-market-up)]'

  const Stat = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-baseline gap-1">
      <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
        {label}
      </span>
      <span className="font-mono text-[10px] tabular-nums text-[var(--color-text-secondary)]">
        {value}
      </span>
    </div>
  )

  return (
    <div className="absolute inset-x-0 bottom-7 z-10 flex items-center justify-between gap-4 border-t border-[var(--color-panel-hairline)] bg-[rgba(6,7,15,0.72)] px-4 py-1.5 backdrop-blur-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className={`live-dot h-1.5 w-1.5 rounded-full ${statusColor}`} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
            {statusLabel}
          </span>
        </div>
        <Stat
          label="upd"
          value={formatRelative(worldSnapshotMeta?.asOf ?? null, now)}
        />
        <Stat
          label="next"
          value={formatNextSync(worldSnapshotMeta?.nextSyncAt ?? null, now)}
        />
        <Stat
          label="src"
          value={(worldSnapshotMeta?.sourceCount ?? 0).toString()}
        />
      </div>
      <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] sm:inline">
        Artificial Analysis · LMArena · Official blogs
      </span>
    </div>
  )
}
