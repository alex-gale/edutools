import {
  RegExpMatcher,
  SyntaxKind,
  englishDataset,
  toAsciiLowerCaseTransformer,
  type ParsedPattern
} from 'obscenity'

const minimumMatch = 3

const axes = [
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 1, col: 1 },
  { row: 1, col: -1 }
] as const

interface CellRef {
  row: number
  col: number
}

const dataset = englishDataset.build()

const matcher = new RegExpMatcher({
  blacklistedTerms: dataset.blacklistedTerms.flatMap(term => {
    if (minimumLength(term.pattern) < minimumMatch) return []
    return [{
      id: term.id,
      pattern: {
        nodes: term.pattern.nodes,
        requireWordBoundaryAtStart: false,
        requireWordBoundaryAtEnd: false
      }
    }]
  }),
  whitelistedTerms: dataset.whitelistedTerms,
  blacklistMatcherTransformers: [toAsciiLowerCaseTransformer()]
})

export function isUnsuitableWord (word: string) {
  const text = word.toLowerCase()
  return matcher.getAllMatches(text).some(match => {
    return match.startIndex === 0 && match.endIndex === text.length - 1
  })
}

export function findRudeSpan (letters: string[][], owners: number[][][]) {
  for (const line of readLines(letters)) {
    for (const match of matcher.getAllMatches(line.text)) {
      if (match.matchLength < minimumMatch) continue
      const cells = line.cells.slice(match.startIndex, match.endIndex + 1)
      if (coveredByOneWord(cells, owners)) continue
      return cells
    }
  }

  return null
}

function minimumLength (pattern: ParsedPattern) {
  let length = 0
  for (const node of pattern.nodes) {
    if (node.kind === SyntaxKind.Literal) length += node.chars.length
    if (node.kind === SyntaxKind.Wildcard) length += 1
  }
  return length
}

function readLines (letters: string[][]) {
  const size = letters.length
  const lines: Array<{ text: string, cells: CellRef[] }> = []

  for (const delta of axes) {
    for (const start of lineStarts(size, delta.row, delta.col)) {
      const cells: CellRef[] = []
      let row = start.row
      let col = start.col
      while (row >= 0 && col >= 0 && row < size && col < size) {
        cells.push({ row, col })
        row += delta.row
        col += delta.col
      }
      if (cells.length < minimumMatch) continue
      const text = cells.map(cell => letters[cell.row]?.[cell.col] ?? '').join('')
      lines.push({ text, cells })
      lines.push({
        text: [...text].reverse().join(''),
        cells: [...cells].reverse()
      })
    }
  }

  return lines
}

function lineStarts (size: number, deltaRow: number, deltaCol: number) {
  const starts: CellRef[] = []
  if (deltaRow === 0) {
    for (let row = 0; row < size; row += 1) starts.push({ row, col: 0 })
    return starts
  }
  if (deltaCol === 0) {
    for (let col = 0; col < size; col += 1) starts.push({ row: 0, col })
    return starts
  }
  if (deltaCol === 1) {
    for (let col = 0; col < size; col += 1) starts.push({ row: 0, col })
    for (let row = 1; row < size; row += 1) starts.push({ row, col: 0 })
    return starts
  }
  for (let col = 0; col < size; col += 1) starts.push({ row: 0, col })
  for (let row = 1; row < size; row += 1) starts.push({ row, col: size - 1 })
  return starts
}

function coveredByOneWord (cells: CellRef[], owners: number[][][]) {
  let shared: number[] | null = null
  for (const cell of cells) {
    const ids = owners[cell.row]?.[cell.col] ?? []
    if (ids.length === 0) return false
    shared = shared === null ? [...ids] : shared.filter(id => ids.includes(id))
    if (shared.length === 0) return false
  }
  return shared !== null
}
