import { GAME_CONFIG } from '../data/config'
import { useGameStore } from '../store'
import { formatNumber } from '../utils/formatters'

export default function HUD() {
  const localPlayer = useGameStore((s) => s.localPlayer)
  const tick = useGameStore((s) => s.tick)
  const players = useGameStore((s) => s.players)
  const connectionStatus = useGameStore((s) => s.connectionStatus)

  if (!localPlayer) {
    return null
  }

  const resources = localPlayer.resources
  const buildings = localPlayer.buildings
  const products = localPlayer.products

  const computePerTick = buildings.reduce((sum, building) => sum + building.computePerTick, 0)
    + products
      .filter((product) => product.launched)
      .reduce((sum, product) => sum + product.revenuePerTick, 0)

  const progressPercent = Math.min(
    100,
    (resources.computePower / GAME_CONFIG.SINGULARITY_THRESHOLD) * 100,
  )

  return (
    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
      <div className="flex items-center justify-between px-4 py-2 bg-dark-bg/90 backdrop-blur-sm border-b border-dark-border pointer-events-auto">
        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">CEO</span>
            <span
              className="font-bold text-sm"
              style={{ color: localPlayer.color }}
            >
              {localPlayer.name}
            </span>
          </div>

          <div className="flex flex-col items-start">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Compute</span>
            <div className="flex items-center gap-1">
              <span className="text-neon-cyan font-bold text-sm">⚡ {formatNumber(resources.computePower)}</span>
              {computePerTick > 0 && (
                <span className="text-neon-green text-[10px]">+{formatNumber(computePerTick)}/s</span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Opinion</span>
            <span
              className={`font-bold text-sm ${
                resources.publicOpinion > 60
                  ? 'text-neon-green'
                  : resources.publicOpinion > 30
                    ? 'text-neon-orange'
                    : 'text-neon-red'
              }`}
            >
              {resources.publicOpinion > 60 ? '😊' : resources.publicOpinion > 30 ? '😐' : '😠'}{' '}
              {Math.round(resources.publicOpinion)}%
            </span>
          </div>

          <div className="flex flex-col items-start">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">VC Funding</span>
            <span className="text-yellow-400 font-bold text-sm">💰 {formatNumber(resources.vcFunding)}</span>
          </div>

          <div className="flex flex-col items-start">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Live Players</span>
            <span className="text-white font-bold text-sm">
              👥 {players.filter((player) => player.connected).length}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
            Tick #{tick} • {connectionStatus === 'connected' ? 'live' : 'reconnecting'}
          </span>
          <div className="w-48 h-2 bg-dark-card rounded-full overflow-hidden border border-dark-border">
            <div
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[9px] text-gray-500">
            {formatNumber(resources.computePower)} / {formatNumber(GAME_CONFIG.SINGULARITY_THRESHOLD)}
          </span>
        </div>
      </div>
    </div>
  )
}
