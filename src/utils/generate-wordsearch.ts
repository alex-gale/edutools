import type { WordsearchCell, WordsearchDifficulty, WordsearchPlacement, WordsearchPuzzle, WordsearchSize } from '../types/puzzle'
import { findRudeSpan, isUnsuitableWord } from './rude-words'

const forward = [
  { row: 0, col: 1 },
  { row: 1, col: 0 }
] as const

const diagonal = [
  { row: 1, col: 1 },
  { row: 1, col: -1 }
] as const

const backward = [
  { row: 0, col: -1 },
  { row: -1, col: 0 },
  { row: -1, col: 1 },
  { row: -1, col: -1 }
] as const

interface Direction {
  row: number
  col: number
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function generateWordsearch (
  words: string[],
  difficulty: WordsearchDifficulty,
  sheetSize: WordsearchSize
): WordsearchPuzzle {
  const suitable: string[] = []
  const unsuitable: string[] = []
  for (const word of words) {
    if (isUnsuitableWord(word)) unsuitable.push(word)
    else suitable.push(word)
  }

  if (suitable.length === 0) {
    return { size: 0, grid: [], placements: [], unplaced: [], unsuitable }
  }

  const directions = directionsFor(difficulty)
  const longest = suitable.reduce((max, word) => Math.max(max, word.length), 0)
  const smallest = findSmallest(suitable, directions, longest, unsuitable)
  const target = gridSize(smallest.size, sheetSize)

  if (sheetSize === 'small' && smallest.puzzle) return smallest.puzzle
  if (target === smallest.size && smallest.puzzle) return smallest.puzzle

  const grown = placeBest(suitable, target, directions, unsuitable)
  if (grown && (!smallest.puzzle || grown.unplaced.length <= smallest.puzzle.unplaced.length)) return grown
  if (smallest.puzzle) return smallest.puzzle

  return {
    size: 0,
    grid: [],
    placements: [],
    unplaced: suitable,
    unsuitable
  }
}

function findSmallest (
  words: string[],
  directions: Direction[],
  longest: number,
  unsuitable: string[]
) {
  let best: WordsearchPuzzle | null = null
  const start = Math.max(longest, 2)

  for (let size = start; size <= 20; size += 1) {
    const puzzle = placeBest(words, size, directions, unsuitable)
    if (!puzzle) continue
    if (!best || puzzle.unplaced.length < best.unplaced.length) best = puzzle
    if (puzzle.unplaced.length === 0) return { size, puzzle }
  }

  return { size: best?.size ?? start, puzzle: best }
}

function placeBest (
  words: string[],
  size: number,
  directions: Direction[],
  unsuitable: string[]
) {
  let best: WordsearchPuzzle | null = null

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const puzzle = placeAttempt(shuffle(words), size, directions, unsuitable)
    if (!puzzle) continue
    if (!best || puzzle.unplaced.length < best.unplaced.length) best = puzzle
    if (best.unplaced.length === 0) return best
  }

  return best
}

function gridSize (minimum: number, sheetSize: WordsearchSize) {
  if (sheetSize === 'medium') return Math.min(22, minimum + 2)
  if (sheetSize === 'large') return Math.min(24, minimum + 4)
  return minimum
}

function directionsFor (difficulty: WordsearchDifficulty): Direction[] {
  if (difficulty === 'easy') return [...forward]
  if (difficulty === 'medium') return [...forward, ...diagonal]
  return [...forward, ...diagonal, ...backward]
}

function placeAttempt (
  words: string[],
  size: number,
  directions: Direction[],
  unsuitable: string[]
): WordsearchPuzzle | null {
  if (words.length === 0 || size < 1) return null

  const draft = Array.from({ length: size }, () => Array.from({ length: size }, () => ''))
  const placements: WordsearchPlacement[] = []
  const unplaced: string[] = []

  for (const word of words) {
    const spot = findSpot(draft, word, directions)
    if (!spot) {
      unplaced.push(word)
      continue
    }
    writeWord(draft, word, spot)
    placements.push(spot)
  }

  const letters = cleanFillers(draft, placements)
  if (!letters) return null

  const grid: WordsearchCell[][] = letters.map(row => row.map(letter => ({
    letter,
    wordIndexes: []
  })))

  placements.forEach((placement, index) => {
    for (let step = 0; step < placement.word.length; step += 1) {
      const row = placement.row + placement.deltaRow * step
      const col = placement.col + placement.deltaCol * step
      grid[row]?.[col]?.wordIndexes.push(index)
    }
  })

  return { size, grid, placements, unplaced, unsuitable }
}

function cleanFillers (draft: string[][], placements: WordsearchPlacement[]) {
  const letters = draft.map(row => row.map(letter => letter || randomLetter()))
  const owners = placementOwners(letters.length, placements)

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const span = findRudeSpan(letters, owners)
    if (!span) return letters

    const fillers = span.filter(cell => (owners[cell.row]?.[cell.col]?.length ?? 0) === 0)
    if (fillers.length === 0) return null

    for (const cell of fillers) {
      const row = letters[cell.row]
      if (!row) continue
      row[cell.col] = differentLetter(row[cell.col] ?? 'A')
    }
  }

  return null
}

function placementOwners (size: number, placements: WordsearchPlacement[]) {
  const owners: number[][][] = Array.from({ length: size }, () => (
    Array.from({ length: size }, () => [])
  ))

  placements.forEach((placement, index) => {
    for (let step = 0; step < placement.word.length; step += 1) {
      const row = placement.row + placement.deltaRow * step
      const col = placement.col + placement.deltaCol * step
      owners[row]?.[col]?.push(index)
    }
  })

  return owners
}

function differentLetter (current: string) {
  let next = randomLetter()
  while (next === current) next = randomLetter()
  return next
}

function findSpot (grid: string[][], word: string, directions: Direction[]) {
  const size = grid.length
  const spots: WordsearchPlacement[] = []

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      for (const direction of shuffle(directions)) {
        if (!canPlace(grid, word, row, col, direction.row, direction.col)) continue
        spots.push({
          word,
          row,
          col,
          deltaRow: direction.row,
          deltaCol: direction.col
        })
      }
    }
  }

  if (spots.length === 0) return null
  return spots[Math.floor(Math.random() * spots.length)] ?? null
}

function canPlace (
  grid: string[][],
  word: string,
  row: number,
  col: number,
  deltaRow: number,
  deltaCol: number
) {
  const size = grid.length
  let overlaps = 0

  for (let index = 0; index < word.length; index += 1) {
    const nextRow = row + deltaRow * index
    const nextCol = col + deltaCol * index
    if (nextRow < 0 || nextCol < 0 || nextRow >= size || nextCol >= size) return false

    const existing = grid[nextRow]?.[nextCol] ?? ''
    const letter = word[index]
    if (!letter || (existing && existing !== letter)) return false
    if (existing) overlaps += 1
  }

  return overlaps < word.length
}

function writeWord (
  grid: string[][],
  word: string,
  spot: Pick<WordsearchPlacement, 'row' | 'col' | 'deltaRow' | 'deltaCol'>
) {
  for (let index = 0; index < word.length; index += 1) {
    const letter = word[index]
    const row = grid[spot.row + spot.deltaRow * index]
    if (!letter || !row) continue
    row[spot.col + spot.deltaCol * index] = letter
  }
}

function randomLetter () {
  return alphabet[Math.floor(Math.random() * alphabet.length)] ?? 'A'
}

function shuffle<T> (items: readonly T[]) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = copy[index]
    const swap = copy[swapIndex]
    if (current === undefined || swap === undefined) continue
    copy[index] = swap
    copy[swapIndex] = current
  }
  return copy
}
