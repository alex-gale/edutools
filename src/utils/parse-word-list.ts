export interface WordListParse {
  words: string[]
  skipped: number
}

export function parseWordList (raw: string): WordListParse {
  const seen = new Set<string>()
  const words: string[] = []
  let skipped = 0

  for (const chunk of raw.split(/[\n,]+/)) {
    const trimmed = chunk.trim()
    if (!trimmed) continue

    if (!/^[A-Za-z]+$/.test(trimmed) || trimmed.length < 2) {
      skipped += 1
      continue
    }

    const word = trimmed.toUpperCase()
    if (seen.has(word)) continue
    seen.add(word)
    words.push(word)
  }

  return { words, skipped }
}
