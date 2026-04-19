import { useGameStore } from '../store'
import type { PredictionMarket } from '../types/game'
import { computeWinOdds, formatOdds } from '../utils/odds'

function formatCloseTime(ms: number): string {
  const diff = ms - Date.now()
  if (diff <= 0) return 'closed'
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

function MarketCard({ market }: { market: PredictionMarket }) {
  const userPredictions = useGameStore((s) => s.userPredictions)
  const predict = useGameStore((s) => s.predict)
  const players = useGameStore((s) => s.players)

  const myPick = userPredictions.find((p) => p.marketId === market.id)
  const locked = market.status === 'locked'
  const labs = players.filter((p) => p.isBot)
  const odds = computeWinOdds(labs)

  return (
    <div className="panel rounded-lg p-3">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold leading-snug text-white">
          {market.question}
        </p>
        <span
          className={`shrink-0 font-mono text-[10px] tabular-nums ${
            locked
              ? 'text-[var(--color-market-warn)]'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          {locked ? 'locked' : formatCloseTime(market.closesAt)}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {market.options.map((option) => {
          const isMine = myPick?.optionId === option.id
          const lab = option.labId
            ? players.find((p) => p.id === option.labId)
            : null
          const pct = option.labId ? (odds.get(option.labId) ?? 0) : 0
          const disabled = locked || market.status !== 'open' || !!myPick

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => predict(market.id, option.id)}
              className={`group relative flex items-center justify-between overflow-hidden rounded-md px-2.5 py-1.5 text-left transition ${
                isMine
                  ? 'bg-[var(--color-market-you)]/10 ring-1 ring-[var(--color-market-you)]/50'
                  : disabled
                    ? 'cursor-not-allowed bg-white/[0.02] opacity-60'
                    : 'bg-white/[0.03] hover:bg-white/[0.06]'
              }`}
            >
              {/* probability fill bar behind label */}
              {option.labId && (
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700"
                  style={{
                    width: `${pct * 100}%`,
                    backgroundColor: lab?.color ?? '#888',
                    opacity: isMine ? 0.18 : 0.1,
                  }}
                />
              )}
              <div className="relative flex items-center gap-1.5">
                {lab && (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: lab.color }}
                  />
                )}
                <span
                  className={`text-[11px] font-medium ${
                    isMine ? 'text-[var(--color-market-you)]' : 'text-white'
                  }`}
                >
                  {option.label}
                </span>
              </div>
              <span
                className={`relative font-mono text-[11px] font-bold tabular-nums ${
                  isMine
                    ? 'text-[var(--color-market-you)]'
                    : 'text-[var(--color-text-secondary)]'
                }`}
              >
                {option.labId ? formatOdds(pct) : '—'}
              </span>
            </button>
          )
        })}
      </div>
      {myPick && (
        <p className="mt-2 font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
          Locked in · +10 if correct
        </p>
      )}
    </div>
  )
}

export default function MarketsPanel() {
  const openMarkets = useGameStore((s) => s.openMarkets)
  const resolvedMarkets = useGameStore((s) => s.resolvedMarkets)
  const userPredictions = useGameStore((s) => s.userPredictions)

  if (openMarkets.length === 0 && resolvedMarkets.length === 0) return null

  return (
    <div className="pointer-events-auto absolute right-4 top-[124px] z-30 flex w-[300px] flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            Markets
          </span>
          <span className="font-mono text-[10px] tabular-nums text-[var(--color-text-tertiary)]">
            {openMarkets.length} open
          </span>
        </div>
      </div>
      {openMarkets.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
      {resolvedMarkets.slice(0, 2).map((market) => {
        const myPick = userPredictions.find((p) => p.marketId === market.id)
        const won = myPick && myPick.optionId === market.resolvedOptionId
        const winningLabel =
          market.options.find((o) => o.id === market.resolvedOptionId)?.label ??
          'void'
        return (
          <div
            key={market.id}
            className="panel-hairline rounded-lg bg-white/[0.02] p-2.5 text-[10px]"
          >
            <p className="font-medium text-[var(--color-text-secondary)]">
              {market.question}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-[10px] text-white">
                {winningLabel}
              </span>
              {myPick && (
                <span
                  className={`font-mono text-[10px] font-bold tabular-nums ${
                    won
                      ? 'text-[var(--color-market-up)]'
                      : 'text-[var(--color-market-down)]'
                  }`}
                >
                  {won ? '+10' : '0'}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
