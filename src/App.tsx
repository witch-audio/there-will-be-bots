import { useEffect, useState } from 'react'
import { useGameStore } from './store'
import GameMap from './map/GameMap'
import Leaderboard from './ui/Leaderboard'
import LabSpotlight from './ui/LabSpotlight'
import LiveStatusBar from './ui/LiveStatusBar'
import NewsTicker from './ui/NewsTicker'
import ToastNotification from './ui/ToastNotification'
import DraftPicker from './ui/DraftPicker'
import MarketsPanel from './ui/MarketsPanel'
import HumanLeaderboard from './ui/HumanLeaderboard'

export default function App() {
  const connectionStatus = useGameStore((s) => s.connectionStatus)
  const players = useGameStore((s) => s.players)
  const tick = useGameStore((s) => s.tick)
  const worldSnapshotMeta = useGameStore((s) => s.worldSnapshotMeta)
  const connectPlayer = useGameStore((s) => s.connectPlayer)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    if (connectionStatus === 'idle') {
      connectPlayer()
    }
  }, [connectPlayer, connectionStatus])

  useEffect(() => {
    if (connectionStatus !== 'error') {
      return
    }
    const timeoutId = window.setTimeout(() => {
      connectPlayer()
    }, 1500)
    return () => window.clearTimeout(timeoutId)
  }, [connectPlayer, connectionStatus])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const debugWindow = window as Window & {
      render_game_to_text?: () => string
    }

    debugWindow.render_game_to_text = () =>
      JSON.stringify({
        tick,
        connectionStatus,
        worldSnapshotMeta,
        leaderboard: [...players]
          .filter((p) => p.isBot)
          .sort(
            (a, b) =>
              (b.sourceBackedStats.agiScore ?? 0) -
              (a.sourceBackedStats.agiScore ?? 0),
          )
          .map((p) => ({
            name: p.name,
            agiScore: p.sourceBackedStats.agiScore,
            trend: p.sourceBackedStats.agiScoreTrend,
            aa: p.sourceBackedStats.artificialAnalysisRank,
            arena: p.sourceBackedStats.arenaRank,
          })),
      })
  }, [connectionStatus, players, tick, worldSnapshotMeta])

  const hasData = players.length > 0

  return (
    <div className="w-full h-full relative overflow-hidden">
      <GameMap />

      {hasData ? (
        <>
          <Leaderboard onOpenDraftPicker={() => setPickerOpen(true)} />
          <MarketsPanel />
          <LabSpotlight />
          <HumanLeaderboard />
          <LiveStatusBar />
          <NewsTicker />
          <DraftPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
        </>
      ) : (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <div className="rounded-2xl border border-dark-border bg-dark-panel/88 px-5 py-4 text-center shadow-[0_18px_42px_rgba(0,0,0,0.26)] backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">
              agigame.live
            </p>
            <p className="mt-2 text-sm font-bold text-white">
              {connectionStatus === 'error'
                ? 'Reconnecting to the live room...'
                : 'Tuning into the AI race...'}
            </p>
          </div>
        </div>
      )}

      <ToastNotification />
    </div>
  )
}
