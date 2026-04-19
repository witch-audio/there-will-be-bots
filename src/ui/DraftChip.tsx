import { useGameStore } from '../store'

interface DraftChipProps {
  onOpenPicker: () => void
}

export default function DraftChip({ onOpenPicker }: DraftChipProps) {
  const userDraft = useGameStore((s) => s.userDraft)
  const players = useGameStore((s) => s.players)
  const userRank = useGameStore((s) => s.userRank)

  if (!userDraft) {
    return (
      <button
        type="button"
        onClick={onOpenPicker}
        className="pointer-events-auto rounded-md bg-[var(--color-market-you)] px-3 py-1.5 text-[11px] font-bold tracking-tight text-[#06070f] transition hover:brightness-110"
      >
        Place your bet →
      </button>
    )
  }

  const lab = players.find((p) => p.id === userDraft.labId)
  const currentScore = lab?.sourceBackedStats.agiScore ?? userDraft.anchorScore
  const delta =
    userDraft.cumulativeDelta + (currentScore - userDraft.anchorScore)
  const deltaLabel = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}`
  const deltaColor =
    delta > 0
      ? 'text-[var(--color-market-up)]'
      : delta < 0
        ? 'text-[var(--color-market-down)]'
        : 'text-[var(--color-text-tertiary)]'

  return (
    <button
      type="button"
      onClick={onOpenPicker}
      className="pointer-events-auto flex items-center gap-2 rounded-md border border-[var(--color-panel-border)] bg-white/[0.03] px-2.5 py-1.5 text-[11px] transition hover:bg-white/[0.06]"
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: lab?.color ?? '#888' }}
      />
      <span className="font-semibold text-white">{lab?.name ?? 'Unknown'}</span>
      <span className={`font-mono tabular-nums ${deltaColor}`}>
        {deltaLabel}
      </span>
      {userRank !== null && (
        <span className="font-mono text-[10px] tabular-nums text-[var(--color-text-tertiary)]">
          #{userRank}
        </span>
      )}
    </button>
  )
}
