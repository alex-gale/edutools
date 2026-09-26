import type {
  CrosswordCell,
  CrosswordDirection,
  CrosswordEntry,
  CrosswordPlacement,
  CrosswordPuzzle
} from '../types/puzzle'

interface OpenPlacement {
  answer: string
  clue: string
  row: number
  col: number
  direction: CrosswordDirection
}

interface Spot {
  row: number
  col: number
  direction: CrosswordDirection
  overlaps: number
  area: number
}

export function generateCrossword (entries: CrosswordEntry[]): CrosswordPuzzle {
  if (entries.length === 0) {
    return { rows: 0, cols: 0, grid: [], placements: [], unplaced: [] }
  }

  const sorted = [...entries].sort((a, b) => b.answer.length - a.answer.length)
  const limit = Math.min(sorted.length, 12)
  let best = layout(sorted)

  for (let seed = 1; seed < limit; seed += 1) {
    const ordered = [...sorted.slice(seed), ...sorted.slice(0, seed)]
    const puzzle = layout(ordered)
    if (better(puzzle, best)) best = puzzle
    if (best.unplaced.length === 0) break
  }

  return best
}

function layout (entries: CrosswordEntry[]) {
  const letters = new Map<string, string>()
  const placed: OpenPlacement[] = []
  const unplaced: CrosswordEntry[] = []

  entries.forEach((entry, index) => {
    const spot = findBest(letters, entry.answer, index === 0)
    if (!spot) {
      unplaced.push(entry)
      return
    }

    writeWord(letters, entry.answer, spot)
    placed.push({
      answer: entry.answer,
      clue: entry.clue,
      row: spot.row,
      col: spot.col,
      direction: spot.direction
    })
  })

  return buildPuzzle(letters, placed, unplaced)
}

function findBest (letters: Map<string, string>, word: string, isolated: boolean) {
  if (isolated) {
    return { row: 0, col: 0, direction: 'across' as const, overlaps: 0, area: word.length }
  }

  let best: Spot | null = null

  for (const [cellKey, letter] of letters) {
    const [rowText, colText] = cellKey.split(',')
    const row = Number(rowText)
    const col = Number(colText)

    for (let index = 0; index < word.length; index += 1) {
      if (word[index] !== letter) continue

      for (const direction of ['across', 'down'] as const) {
        const startRow = direction === 'down' ? row - index : row
        const startCol = direction === 'across' ? col - index : col
        const overlaps = canPlace(letters, word, startRow, startCol, direction)
        if (overlaps === null) continue

        const candidate: Spot = {
          row: startRow,
          col: startCol,
          direction,
          overlaps,
          area: areaWith(letters, word, startRow, startCol, direction)
        }

        if (
          !best ||
          candidate.overlaps > best.overlaps ||
          (candidate.overlaps === best.overlaps && candidate.area < best.area)
        ) {
          best = candidate
        }
      }
    }
  }

  return best
}

function canPlace (
  letters: Map<string, string>,
  word: string,
  row: number,
  col: number,
  direction: CrosswordDirection
) {
  const across = direction === 'across'
  const dRow = across ? 0 : 1
  const dCol = across ? 1 : 0
  const sideRow = across ? 1 : 0
  const sideCol = across ? 0 : 1

  if (read(letters, row - dRow, col - dCol)) return null
  if (read(letters, row + dRow * word.length, col + dCol * word.length)) return null

  let overlaps = 0
  let previousFilled = false

  for (let index = 0; index < word.length; index += 1) {
    const cellRow = row + dRow * index
    const cellCol = col + dCol * index
    const existing = read(letters, cellRow, cellCol)
    const letter = word[index]
    if (!letter) return null

    if (existing) {
      if (existing !== letter || previousFilled) return null
      overlaps += 1
      previousFilled = true
    } else {
      previousFilled = false
      if (read(letters, cellRow + sideRow, cellCol + sideCol)) return null
      if (read(letters, cellRow - sideRow, cellCol - sideCol)) return null
    }
  }

  if (overlaps === 0) return null
  return overlaps
}

function areaWith (
  letters: Map<string, string>,
  word: string,
  row: number,
  col: number,
  direction: CrosswordDirection
) {
  let minRow = row
  let maxRow = row
  let minCol = col
  let maxCol = col

  for (const cellKey of letters.keys()) {
    const [cellRow, cellCol] = cellKey.split(',').map(Number)
    minRow = Math.min(minRow, cellRow)
    maxRow = Math.max(maxRow, cellRow)
    minCol = Math.min(minCol, cellCol)
    maxCol = Math.max(maxCol, cellCol)
  }

  const end = word.length - 1
  if (direction === 'across') {
    maxCol = Math.max(maxCol, col + end)
  } else {
    maxRow = Math.max(maxRow, row + end)
  }

  return (maxRow - minRow + 1) * (maxCol - minCol + 1)
}

function writeWord (letters: Map<string, string>, word: string, spot: Spot) {
  const dRow = spot.direction === 'down' ? 1 : 0
  const dCol = spot.direction === 'across' ? 1 : 0

  for (let index = 0; index < word.length; index += 1) {
    const letter = word[index]
    if (!letter) continue
    letters.set(key(spot.row + dRow * index, spot.col + dCol * index), letter)
  }
}

function buildPuzzle (
  letters: Map<string, string>,
  placed: OpenPlacement[],
  unplaced: CrosswordEntry[]
): CrosswordPuzzle {
  if (placed.length === 0) {
    return { rows: 0, cols: 0, grid: [], placements: [], unplaced }
  }

  let minRow = Infinity
  let maxRow = -Infinity
  let minCol = Infinity
  let maxCol = -Infinity

  for (const cellKey of letters.keys()) {
    const [row, col] = cellKey.split(',').map(Number)
    minRow = Math.min(minRow, row)
    maxRow = Math.max(maxRow, row)
    minCol = Math.min(minCol, col)
    maxCol = Math.max(maxCol, col)
  }

  const rows = maxRow - minRow + 1
  const cols = maxCol - minCol + 1
  const grid: CrosswordCell[][] = Array.from({ length: rows }, () => (
    Array.from({ length: cols }, () => ({ letter: null, number: null }))
  ))

  for (const [cellKey, letter] of letters) {
    const [row, col] = cellKey.split(',').map(Number)
    const cell = grid[row - minRow]?.[col - minCol]
    if (cell) cell.letter = letter
  }

  const placements: CrosswordPlacement[] = placed.map(item => ({
    ...item,
    row: item.row - minRow,
    col: item.col - minCol,
    number: 0
  }))

  let number = 1
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const across = startsWord(grid, row, col, 'across')
      const down = startsWord(grid, row, col, 'down')
      if (!across && !down) continue

      const cell = grid[row]?.[col]
      if (cell) cell.number = number

      for (const placement of placements) {
        if (placement.row === row && placement.col === col) placement.number = number
      }

      number += 1
    }
  }

  return { rows, cols, grid, placements, unplaced }
}

function startsWord (
  grid: CrosswordCell[][],
  row: number,
  col: number,
  direction: CrosswordDirection
) {
  if (!grid[row]?.[col]?.letter) return false
  const dRow = direction === 'down' ? 1 : 0
  const dCol = direction === 'across' ? 1 : 0
  const before = grid[row - dRow]?.[col - dCol]?.letter
  const after = grid[row + dRow]?.[col + dCol]?.letter
  return !before && Boolean(after)
}

function better (next: CrosswordPuzzle, current: CrosswordPuzzle) {
  if (next.placements.length !== current.placements.length) {
    return next.placements.length > current.placements.length
  }
  return next.rows * next.cols < current.rows * current.cols
}

function read (letters: Map<string, string>, row: number, col: number) {
  return letters.get(key(row, col)) ?? null
}

function key (row: number, col: number) {
  return `${row},${col}`
}
