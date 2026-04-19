export const CHAPTER_TITLES: string[] = [
  'Chapter 1: The Race Begins',
  'Chapter 2: The Scaling Wars',
  'Chapter 3: The Frontier Freeze',
  'Chapter 4: The Open Model Revolt',
  'Chapter 5: The Compute Crunch',
  'Chapter 6: The Agent Awakening',
  'Chapter 7: The Silicon Summit',
  'Chapter 8: The Alignment Gauntlet',
  'Chapter 9: The Capital Reckoning',
  'Chapter 10: The Last Benchmark',
]

export function pickChapterTitle(seasonNumber: number): string {
  const index = (seasonNumber - 1) % CHAPTER_TITLES.length
  return CHAPTER_TITLES[index]
}
