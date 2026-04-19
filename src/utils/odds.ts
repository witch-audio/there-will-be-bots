import type { MultiplayerPlayer } from '../multiplayer/contracts'

/**
 * Softmax over AGI scores with a tunable temperature.
 * Lower temperature = sharper odds (the leader dominates).
 * Returns a Map of labId → probability in [0, 1], summing to 1.
 */
export function computeWinOdds(
  labs: MultiplayerPlayer[],
  temperature = 12,
): Map<string, number> {
  const out = new Map<string, number>()
  if (labs.length === 0) return out

  const scores = labs.map((l) => l.sourceBackedStats.agiScore ?? 0)
  const maxScore = Math.max(...scores)
  const exps = scores.map((s) => Math.exp((s - maxScore) / temperature))
  const sum = exps.reduce((acc, v) => acc + v, 0) || 1

  labs.forEach((lab, i) => {
    out.set(lab.id, exps[i] / sum)
  })
  return out
}

export function formatOdds(p: number): string {
  if (p >= 0.995) return '99%'
  if (p < 0.01) return '<1%'
  return `${Math.round(p * 100)}%`
}
