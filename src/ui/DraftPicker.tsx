import { useGameStore } from '../store'
import { computeWinOdds, formatOdds } from '../utils/odds'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

interface DraftPickerProps {
  open: boolean
  onClose: () => void
}

export default function DraftPicker({ open, onClose }: DraftPickerProps) {
  const players = useGameStore((s) => s.players)
  const userDraft = useGameStore((s) => s.userDraft)
  const draftLab = useGameStore((s) => s.draftLab)
  const swapLab = useGameStore((s) => s.swapLab)

  if (!open) return null

  const labs = players.filter((p) => p.isBot)
  const odds = computeWinOdds(labs)
  const now = Date.now()
  const cooldownRemaining =
    userDraft && userDraft.lastSwapAt && userDraft.swapsUsedThisWeek >= 1
      ? Math.max(0, WEEK_MS - (now - userDraft.lastSwapAt))
      : 0
  const swapLocked = cooldownRemaining > 0

  const handlePick = (labId: string) => {
    if (!userDraft) {
      draftLab(labId)
    } else if (userDraft.labId !== labId && !swapLocked) {
      swapLab(labId)
    }
    onClose()
  }

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="panel w-full max-w-xl rounded-xl p-5 shadow-[0_32px_64px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
              {userDraft ? 'Swap your bet' : 'Place your bet'}
            </p>
            <h2 className="mt-1 text-[18px] font-bold tracking-tight text-white">
              {userDraft ? 'Move to a new lab' : 'Who will lead the race?'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--color-panel-border)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] hover:bg-white/[0.05] hover:text-white"
          >
            Close
          </button>
        </div>

        {userDraft && swapLocked && (
          <p className="mb-3 rounded-md bg-[var(--color-market-warn)]/10 px-3 py-2 text-[11px] text-[var(--color-market-warn)] ring-1 ring-[var(--color-market-warn)]/30">
            Swap on cooldown · {formatCooldown(cooldownRemaining)} remaining
          </p>
        )}

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {labs.map((lab) => {
            const isCurrent = userDraft?.labId === lab.id
            const score = lab.sourceBackedStats.agiScore ?? 0
            const pct = odds.get(lab.id) ?? 0
            const disabled = isCurrent || (!!userDraft && swapLocked)
            return (
              <button
                key={lab.id}
                type="button"
                disabled={disabled}
                onClick={() => handlePick(lab.id)}
                className={`relative flex flex-col items-start gap-1 overflow-hidden rounded-md p-3 text-left transition ${
                  isCurrent
                    ? 'bg-[var(--color-market-up)]/10 ring-1 ring-[var(--color-market-up)]/50'
                    : disabled
                      ? 'cursor-not-allowed bg-white/[0.02] opacity-50'
                      : 'bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <div
                  className="absolute inset-x-0 bottom-0 h-0.5 transition-all"
                  style={{ width: `${pct * 100}%`, backgroundColor: lab.color }}
                />
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: lab.color }}
                    />
                    <span className="text-[12px] font-semibold text-white">
                      {lab.name}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold tabular-nums text-[var(--color-market-leader)]">
                    {formatOdds(pct)}
                  </span>
                </div>
                <span className="font-mono text-[18px] font-bold leading-none tabular-nums text-white">
                  {score.toFixed(1)}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  {isCurrent ? 'Your pick' : 'AGI Score'}
                </span>
              </button>
            )
          })}
        </div>

        <p className="mt-4 font-mono text-[10px] text-[var(--color-text-tertiary)]">
          You gain points when your lab's AGI Score climbs, lose when it slides.
          One free swap per 7-day rolling window.
        </p>
      </div>
    </div>
  )
}

function formatCooldown(ms: number): string {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  if (days > 0) return `${days}d ${hours}h`
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}
