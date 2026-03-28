import { useState } from 'react'
import { GAME_CONFIG } from '../data/config'
import { useGameStore } from '../store'
import { formatNumber } from '../utils/formatters'

export default function RivalTracker() {
  const [isOpen, setIsOpen] = useState(false)
  const players = useGameStore((s) => s.players)
  const leaderboard = useGameStore((s) => s.leaderboard)
  const localPlayer = useGameStore((s) => s.localPlayer)

  if (!localPlayer) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-4 top-20 z-20 bg-dark-panel border border-dark-border rounded-lg px-3 py-2 text-xs font-bold text-neon-magenta hover:border-neon-magenta transition-all cursor-pointer"
      >
        👥 World Standings
      </button>

      {isOpen && (
        <div className="absolute right-4 top-32 z-20 w-72 max-h-[65vh] overflow-y-auto bg-dark-panel/95 backdrop-blur-sm border border-dark-border rounded-xl p-3">
          <h3 className="text-sm font-bold text-neon-magenta mb-3">👥 Live World</h3>

          {players.map((player, index) => {
            const progress = Math.min(
              100,
              (player.resources.computePower / GAME_CONFIG.SINGULARITY_THRESHOLD) * 100,
            )

            return (
              <div
                key={player.id}
                className={`mb-2.5 ${
                  player.id === localPlayer.id
                    ? 'bg-dark-card border border-neon-cyan/30 rounded-lg p-2'
                    : 'px-2'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-500">#{index + 1}</span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: player.color }}
                    >
                      {player.name}
                    </span>
                    {!player.connected && (
                      <span className="text-[9px] text-gray-500">(offline)</span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {formatNumber(player.resources.computePower)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-dark-card rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: player.color,
                    }}
                  />
                </div>
              </div>
            )
          })}

          <div className="border-t border-dark-border my-3" />
          <h3 className="text-sm font-bold text-neon-cyan mb-2">🏆 Hall of Chaos</h3>

          {leaderboard.length === 0 && (
            <p className="text-xs text-gray-500">No finished runs submitted yet.</p>
          )}

          {leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              className="bg-dark-card/70 border border-dark-border rounded-lg p-2 mb-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  #{index + 1} {entry.name}
                </span>
                <span className={`text-[10px] font-bold ${entry.won ? 'text-neon-green' : 'text-gray-400'}`}>
                  {entry.won ? 'WIN' : 'RUN'}
                </span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1 flex justify-between">
                <span>⚡ {formatNumber(entry.score)}</span>
                <span>🏗️ {entry.farms}</span>
                <span>🚀 {entry.launchedProducts}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
