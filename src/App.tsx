import { useGameStore } from './store'
import GameMap from './map/GameMap'
import HUD from './ui/HUD'
import NewsTicker from './ui/NewsTicker'
import ProductPanel from './ui/ProductPanel'
import RivalTracker from './ui/RivalTracker'
import ToastNotification from './ui/ToastNotification'
import StartScreen from './ui/StartScreen'
import WinLossScreen from './ui/WinLossScreen'

export default function App() {
  const gamePhase = useGameStore((s) => s.gamePhase)
  const isInMatch = gamePhase !== 'start'

  return (
    <div className="w-full h-full relative">
      {/* Map is always visible as background */}
      <GameMap />

      {/* Game UI overlays */}
      {isInMatch && (
        <>
          <HUD />
          <ProductPanel />
          <RivalTracker />
          <NewsTicker />
          <ToastNotification />
        </>
      )}

      {/* Screens */}
      {gamePhase === 'start' && <StartScreen />}
      {(gamePhase === 'won' || gamePhase === 'lost') && <WinLossScreen />}
    </div>
  )
}
