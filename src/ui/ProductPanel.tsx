import { useState } from 'react'
import { useGameStore } from '../store'
import { formatNumber } from '../utils/formatters'

export default function ProductPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const localPlayer = useGameStore((s) => s.localPlayer)
  const launchProduct = useGameStore((s) => s.launchProduct)

  if (!localPlayer) {
    return null
  }

  const products = localPlayer.products
  const resources = localPlayer.resources
  const availableProducts = products.filter((product) => product.unlocked && !product.launched)
  const launchedProducts = products.filter((product) => product.launched)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-4 top-20 z-20 bg-dark-panel border border-dark-border rounded-lg px-3 py-2 text-xs font-bold text-neon-green hover:border-neon-green transition-all cursor-pointer"
      >
        🚀 Products {launchedProducts.length > 0 && `(${launchedProducts.length})`}
      </button>

      {isOpen && (
        <div className="absolute left-4 top-32 z-20 w-72 max-h-[60vh] overflow-y-auto bg-dark-panel/95 backdrop-blur-sm border border-dark-border rounded-xl p-3">
          <h3 className="text-sm font-bold text-neon-green mb-3">🚀 AI Products Lab</h3>

          {availableProducts.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Available</p>
              {availableProducts.map((product) => {
                const canAfford = resources.computePower >= product.cost
                return (
                  <div
                    key={product.id}
                    className="bg-dark-card border border-dark-border rounded-lg p-2.5 mb-2"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-white">{product.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">{product.description}</p>
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex gap-2 text-[10px] flex-wrap">
                        <span className="text-neon-cyan">⚡ {formatNumber(product.cost)}</span>
                        <span className="text-neon-green">+{product.revenuePerTick}/s</span>
                        <span className={product.opinionEffect >= 0 ? 'text-neon-green' : 'text-neon-red'}>
                          😊 {product.opinionEffect > 0 ? '+' : ''}{product.opinionEffect}
                        </span>
                      </div>
                      <button
                        onClick={() => launchProduct(product.id)}
                        disabled={!canAfford}
                        className={`text-[10px] px-2 py-1 rounded font-bold transition-all ${
                          canAfford
                            ? 'bg-neon-green text-dark-bg hover:brightness-110 cursor-pointer'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        LAUNCH
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {launchedProducts.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Launched</p>
              {launchedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-dark-card/50 border border-neon-green/20 rounded-lg p-2 mb-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-neon-green">{product.name}</span>
                    <span className="text-[10px] text-neon-green">+{product.revenuePerTick}/s</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {availableProducts.length === 0 && launchedProducts.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">
              Build more farms and stack more compute to unlock products.
            </p>
          )}
        </div>
      )}
    </>
  )
}
