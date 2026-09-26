export const A4 = { width: 595.28, height: 841.89 }
export const MARGIN = 40
export const COMFORTABLE_CELL = 16

export function wordsearchCellSize (gridSize: number, wordCount: number) {
  const contentWidth = A4.width - MARGIN * 2
  const header = 56
  const bankRows = Math.max(1, Math.ceil(wordCount / 3))
  const bankHeight = 18 + bankRows * 14
  const room = A4.height - MARGIN * 2 - header - bankHeight - 16
  if (gridSize < 1) return 0
  return Math.floor(Math.min(contentWidth, room) / gridSize)
}

export function crosswordCellSize (rows: number, cols: number, clueCount: number) {
  if (rows < 1 || cols < 1) return 0
  const contentWidth = A4.width - MARGIN * 2
  const header = 56
  const clueRows = Math.max(1, Math.ceil(clueCount / 2))
  const clueHeight = 24 + clueRows * 30
  const room = A4.height - MARGIN * 2 - header - clueHeight - 12
  const byWidth = Math.floor(contentWidth / cols)
  const byHeight = Math.floor(room / rows)
  return Math.min(byWidth, byHeight)
}
