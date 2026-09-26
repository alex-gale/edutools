import type { CrosswordEntry } from '../types/puzzle'

export interface CrosswordParse {
  entries: CrosswordEntry[]
  skipped: number
}

export function parseCrosswordEntries (raw: string): CrosswordParse {
  const seen = new Set<string>()
  const entries: CrosswordEntry[] = []
  let skipped = 0

  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const parsed = parseLine(trimmed)
    if (!parsed) {
      skipped += 1
      continue
    }

    if (seen.has(parsed.answer)) continue
    seen.add(parsed.answer)
    entries.push(parsed)
  }

  return { entries, skipped }
}

function parseLine (line: string): CrosswordEntry | null {
  const parts = line.split(/\s+/)
  return entryFrom(parts[0] ?? '', parts.slice(1).join(' '))
}

function entryFrom (answerText: string, clueText: string): CrosswordEntry | null {
  const answer = readAnswer(answerText)
  const clue = clueText.trim()
  if (!answer || clue.length === 0) return null
  return { answer, clue }
}

function readAnswer (value: string) {
  const trimmed = value.trim()
  if (!/^[A-Za-z]{2,}$/.test(trimmed)) return null
  return trimmed.toUpperCase()
}
