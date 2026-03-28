import { useEffect } from 'react'
import { useGameStore } from '../store'
import { GAME_CONFIG } from '../data/config'

export default function ToastNotification() {
  const toasts = useGameStore((s) => s.toasts)
  const removeToast = useGameStore((s) => s.removeToast)

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), GAME_CONFIG.TOAST_DURATION_MS)
    )
    return () => timers.forEach(clearTimeout)
  }, [toasts, removeToast])

  if (toasts.length === 0) return null

  const typeStyles = {
    info: 'border-blue-400/50 bg-blue-900/30',
    warning: 'border-yellow-400/50 bg-yellow-900/30',
    success: 'border-neon-green/50 bg-green-900/30',
    chaos: 'border-neon-magenta/50 bg-purple-900/30',
  }

  return (
    <div className="fixed bottom-10 right-4 z-40 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter px-3 py-2 rounded-lg border text-xs text-gray-200 backdrop-blur-sm ${typeStyles[toast.type]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
