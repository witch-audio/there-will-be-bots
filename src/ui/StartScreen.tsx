import { useGameStore } from '../store'

export default function StartScreen() {
  const pendingName = useGameStore((s) => s.pendingName)
  const connectionStatus = useGameStore((s) => s.connectionStatus)
  const error = useGameStore((s) => s.error)
  const setPendingName = useGameStore((s) => s.setPendingName)
  const connectPlayer = useGameStore((s) => s.connectPlayer)

  const isConnecting = connectionStatus === 'connecting'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div className="start-screen-shade" aria-hidden="true" />
      <div className="start-screen-aura" aria-hidden="true" />

      <div className="relative z-10 flex w-full justify-center px-4 py-8 sm:px-6">
        <div className="start-screen-stage">
          <div className="start-screen-copy">
            <p className="start-screen-kicker">
              Same World Multiplayer
            </p>

            <div className="start-screen-rule" aria-hidden="true" />

            <h1 className="start-screen-title text-5xl font-bold leading-none tracking-[-0.04em] sm:text-7xl">
              <span className="text-neon-cyan">THERE WILL</span>
              <br />
              <span className="text-neon-magenta">BE BOTS</span>
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-gray-300 sm:text-base">
              One shared map. Everyone builds at once.
              <br />
              First to 20K wins. Try not to get cooked.
            </p>

            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.26em] text-white/72">
              Build cities <span className="text-white/35">•</span> Ship nonsense <span className="text-white/35">•</span> Win the race
            </p>
          </div>

          <form
            className="start-screen-action-bar mt-8"
            onSubmit={(event) => {
              event.preventDefault()
              connectPlayer()
            }}
          >
            <label className="sr-only" htmlFor="player-name">
              Your name
            </label>

            <input
              id="player-name"
              value={pendingName}
              onChange={(event) => setPendingName(event.target.value)}
              placeholder="Your name"
              maxLength={18}
              className="start-screen-input"
            />

            <button
              type="submit"
              disabled={isConnecting}
              className="start-screen-button"
            >
              {isConnecting ? 'CONNECTING...' : 'PLAY NOW'}
            </button>
          </form>

          <p className="mt-3 text-xs text-white/52">
            Used on the leaderboard.
          </p>

          {error && (
            <p className="mt-3 text-sm text-neon-red">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
