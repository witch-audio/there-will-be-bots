export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return Math.floor(n).toString()
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export function formatShortDateTime(timestamp: number | null) {
  if (!timestamp) {
    return 'waiting for sync'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp)
}

export function formatHoursUntil(timestamp: number | null) {
  if (!timestamp) {
    return 'soon'
  }

  const diff = Math.max(0, timestamp - Date.now())
  const hours = diff / (60 * 60 * 1000)
  if (hours < 1) {
    return '<1h'
  }

  return `${hours.toFixed(1)}h`
}
