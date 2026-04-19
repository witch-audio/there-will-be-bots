import { useGameStore } from '../store'
import type { MultiplayerPlayer } from '../multiplayer/contracts'
import DraftChip from './DraftChip'
import { computeWinOdds, formatOdds } from '../utils/odds'

interface LeaderboardProps {
  onOpenDraftPicker: () => void
}

function TrendPill({ trend, delta }: { trend: 'up' | 'down' | 'flat'; delta?: number }) {
  const up = trend === 'up'
  const down = trend === 'down'
  const color = up
    ? 'text-[var(--color-market-up)]'
    : down
      ? 'text-[var(--color-market-down)]'
      : 'text-[var(--color-text-tertiary)]'
  const sign = up ? '+' : down ? '' : ''
  return (
    <span className={`font-mono text-[10px] tabular-nums ${color}`}>
      {up ? '▲' : down ? '▼' : '·'}
      {typeof delta === 'number' && delta !== 0 ? ` ${sign}${delta.toFixed(1)}` : ''}
    </span>
  )
}

function LabCard({
  player,
  rank,
  odds,
}: {
  player: MultiplayerPlayer
  rank: number
  odds: number
}) {
  const score = player.sourceBackedStats.agiScore ?? 0
  const trend = player.sourceBackedStats.agiScoreTrend ?? 'flat'
  const isLeader = rank === 1

  return (
    <div
      className={`relative flex min-w-[168px] flex-col gap-1.5 rounded-md px-3 py-2 transition-colors ${
        isLeader
          ? 'bg-white/[0.04] ring-1 ring-[var(--color-market-leader)]/30'
          : 'bg-white/[0.02] hover:bg-white/[0.03]'
      }`}
    >
      {/* top row: rank + name + odds */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-[10px] tabular-nums text-[var(--color-text-tertiary)]">
            {rank.toString().padStart(2, '0')}
          </span>
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: player.color }}
          />
          <span className="truncate text-[12px] font-semibold tracking-tight text-white">
            {player.name}
          </span>
        </div>
        <span
          className={`font-mono text-[11px] font-bold tabular-nums ${
            isLeader
              ? 'text-[var(--color-market-leader)]'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          {formatOdds(odds)}
        </span>
      </div>

      {/* score + trend */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[22px] font-bold leading-none tabular-nums text-white">
          {score.toFixed(1)}
        </span>
        <TrendPill trend={trend} />
      </div>

      {/* odds bar */}
      <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.max(2, odds * 100)}%`,
            backgroundColor: player.color,
            opacity: isLeader ? 1 : 0.6,
          }}
        />
      </div>
    </div>
  )
}

export default function Leaderboard({ onOpenDraftPicker }: LeaderboardProps) {
  const players = useGameStore((s) => s.players)
  const season = useGameStore((s) => s.season)

  const ranked = [...players]
    .filter((p) => p.isBot)
    .sort(
      (a, b) =>
        (b.sourceBackedStats.agiScore ?? 0) - (a.sourceBackedStats.agiScore ?? 0),
    )

  if (ranked.length === 0) {
    return null
  }

  const odds = computeWinOdds(ranked)
  const topScore = ranked[0]?.sourceBackedStats.agiScore ?? 0
  const progress = season
    ? Math.min(1, topScore / season.milestoneThreshold)
    : 0
  const dayOfSeason = season
    ? Math.max(
        1,
        Math.floor((Date.now() - season.startsAt) / (24 * 60 * 60 * 1000)) + 1,
      )
    : 1

  return (
    <div className="absolute inset-x-0 top-0 z-20 border-b border-[var(--color-panel-hairline)] bg-[rgba(6,7,15,0.72)] backdrop-blur-xl">
      {/* Header row: brand + season + draft */}
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-[var(--color-market-up)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-market-up)]">
              Live
            </span>
          </div>
          <span className="h-3 w-px bg-white/10" />
          <span className="text-[13px] font-bold tracking-tight text-white">
            agigame<span className="text-[var(--color-text-tertiary)]">.live</span>
          </span>
          {season && (
            <>
              <span className="h-3 w-px bg-white/10" />
              <span className="hidden truncate text-[11px] font-medium text-[var(--color-text-secondary)] sm:inline">
                {season.chapterTitle}
              </span>
              <span className="hidden font-mono text-[10px] tabular-nums text-[var(--color-text-tertiary)] md:inline">
                · Day {dayOfSeason}
              </span>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {season && (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-[9px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
                To AGI
              </span>
              <div className="h-1 w-28 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[var(--color-market-up)] transition-all duration-700"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className="font-mono text-[10px] tabular-nums text-[var(--color-text-secondary)]">
                {topScore.toFixed(0)}
                <span className="text-[var(--color-text-tertiary)]">/{season.milestoneThreshold}</span>
              </span>
            </div>
          )}
          <DraftChip onOpenPicker={onOpenDraftPicker} />
        </div>
      </div>

      {/* Lab cards row */}
      <div className="flex gap-1.5 overflow-x-auto px-4 pb-3">
        {ranked.map((player, index) => (
          <LabCard
            key={player.id}
            player={player}
            rank={index + 1}
            odds={odds.get(player.id) ?? 0}
          />
        ))}
      </div>
    </div>
  )
}
