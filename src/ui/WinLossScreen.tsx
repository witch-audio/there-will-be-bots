import { useEffect, useState } from 'react'
import { useGameStore } from '../store'
import { formatNumber } from '../utils/formatters'

const WIN_MESSAGES = [
  'You hit Singularity first. The shared world now belongs to your bots.',
  'Victory. Your AI empire scaled faster than everyone else in the room.',
  'You won the race. Investors are crying and nobody knows why.',
]

const LOSS_MESSAGES = [
  'Another CEO reached Singularity first. Your run can still make the leaderboard.',
  'You lost the room race, but your score still counts if you submit it.',
  'Defeated this round. The leaderboard can still remember the attempt.',
]

export default function WinLossScreen() {
  const gamePhase = useGameStore((s) => s.gamePhase)
  const tick = useGameStore((s) => s.tick)
  const localPlayer = useGameStore((s) => s.localPlayer)
  const players = useGameStore((s) => s.players)
  const leaderboard = useGameStore((s) => s.leaderboard)
  const playerName = useGameStore((s) => s.playerName)
  const submitScore = useGameStore((s) => s.submitScore)
  const resetMatch = useGameStore((s) => s.resetMatch)

  const [leaderboardName, setLeaderboardName] = useState(playerName)

  useEffect(() => {
    setLeaderboardName(playerName)
  }, [playerName])

  if ((gamePhase !== 'won' && gamePhase !== 'lost') || !localPlayer) {
    return null
  }

  const isWin = gamePhase === 'won'
  const messages = isWin ? WIN_MESSAGES : LOSS_MESSAGES
  const message = messages[tick % messages.length]
  const winner = players.find((player) => player.status === 'won')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md modal-backdrop">
      <div className="text-center max-w-xl px-6">
        <div className="text-6xl mb-4">{isWin ? '🤖' : '💀'}</div>
        <h1 className={`text-4xl font-bold mb-3 ${isWin ? 'text-neon-cyan' : 'text-neon-red'}`}>
          {isWin ? 'SINGULARITY ACHIEVED' : 'MATCH OVER'}
        </h1>
        <p className="text-sm text-gray-300 mb-2 italic">"{message}"</p>
        {winner && (
          <p className="text-xs text-gray-500 mb-6">
            Winner: <span style={{ color: winner.color }}>{winner.name}</span>
          </p>
        )}

        <div className="bg-dark-panel border border-dark-border rounded-xl p-4 mb-6 grid grid-cols-2 gap-3 text-left">
          <div>
            <span className="text-[10px] text-gray-500 uppercase">Time</span>
            <p className="text-sm text-white font-bold">{Math.floor(tick / 60)}m {tick % 60}s</p>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase">Server Farms</span>
            <p className="text-sm text-neon-cyan font-bold">{localPlayer.buildings.length}</p>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase">Products Launched</span>
            <p className="text-sm text-neon-green font-bold">
              {localPlayer.products.filter((product) => product.launched).length}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase">Final Compute</span>
            <p className="text-sm text-neon-magenta font-bold">
              {formatNumber(localPlayer.resources.computePower)}
            </p>
          </div>
        </div>

        <div className="bg-dark-panel border border-dark-border rounded-xl p-4 mb-6 text-left">
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2">
            Leaderboard name
          </label>
          <div className="flex gap-2">
            <input
              value={leaderboardName}
              onChange={(event) => setLeaderboardName(event.target.value)}
              maxLength={18}
              className="flex-1 rounded-lg border border-dark-border bg-dark-card px-3 py-2 text-sm text-white outline-none focus:border-neon-cyan"
            />
            <button
              onClick={() => submitScore(leaderboardName)}
              disabled={localPlayer.submittedScore}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                localPlayer.submittedScore
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-neon-magenta text-dark-bg hover:brightness-110 cursor-pointer'
              }`}
            >
              {localPlayer.submittedScore ? 'SUBMITTED' : 'ADD SCORE'}
            </button>
          </div>
        </div>

        {leaderboard.length > 0 && (
          <div className="bg-dark-panel border border-dark-border rounded-xl p-4 mb-6 text-left">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Top runs</p>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg bg-dark-card/70 px-3 py-2"
                >
                  <span className="text-xs text-white">
                    #{index + 1} {entry.name}
                  </span>
                  <span className="text-[10px] text-neon-cyan">{formatNumber(entry.score)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={resetMatch}
          className={`font-bold text-lg px-10 py-3 rounded-xl transition-all cursor-pointer ${
            isWin
              ? 'bg-gradient-to-r from-neon-cyan to-neon-magenta text-dark-bg'
              : 'bg-neon-red text-white'
          }`}
        >
          🔄 START NEXT MATCH
        </button>
      </div>
    </div>
  )
}
