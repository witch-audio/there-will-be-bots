import { useGameStore } from '../store'

export default function NewsTicker() {
  const headlines = useGameStore((s) => s.headlines)

  const tickerText = headlines.join('  ///  ')

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-dark-bg/90 backdrop-blur-sm border-t border-dark-border overflow-hidden h-7 flex items-center">
      <div className="flex-shrink-0 bg-neon-magenta text-dark-bg text-[10px] font-bold px-2 py-1 uppercase tracking-wider z-10">
        Live Feed
      </div>
      <div className="overflow-hidden whitespace-nowrap flex-1">
        <span className="ticker-text inline-block text-[11px] text-gray-400 pl-4">
          {tickerText}
        </span>
      </div>
    </div>
  )
}
