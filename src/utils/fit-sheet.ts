import type { CopiesPerPage } from '../types/puzzle'

export const A4 = { width: 595.28, height: 841.89 }
export const MARGIN = 40
export const COMFORTABLE_CELL = 16
export const SECTION_HEADING_SIZE = 12
export const SECTION_HEADING_GAP = 16
export const A5_INSET = 12
export const A5_PAD = 12

export interface PageFrame {
  x: number
  y: number
  width: number
  height: number
}

export function pageSize (copies: CopiesPerPage) {
  if (copies === '2') return { width: A4.height, height: A4.width }
  return { width: A4.width, height: A4.height }
}

export function pairFrames (): PageFrame[] {
  const page = pageSize('2')
  const half = page.width / 2
  const width = half - A5_INSET * 2
  const height = page.height - A5_INSET * 2
  return [0, 1].map(index => ({
    x: index * half + A5_INSET,
    y: A5_INSET,
    width,
    height
  }))
}

function contentBox (copies: CopiesPerPage) {
  if (copies === '2') {
    const frame = pairFrames()[0]
    return {
      width: (frame?.width ?? 0) - A5_PAD * 2,
      height: (frame?.height ?? 0) - A5_PAD * 2
    }
  }
  return {
    width: A4.width - MARGIN * 2,
    height: A4.height - MARGIN * 2
  }
}

export function wordsearchCellSize (gridSize: number, wordCount: number, copies: CopiesPerPage) {
  const box = contentBox(copies)
  const header = copies === '2' ? 48 : 56
  const columns = 3
  const bankRows = Math.max(1, Math.ceil(wordCount / columns))
  const bankHeight = SECTION_HEADING_SIZE + SECTION_HEADING_GAP + bankRows * 14
  const room = box.height - header - bankHeight - 16
  if (gridSize < 1) return 0
  return Math.floor(Math.min(box.width, room) / gridSize)
}

export function crosswordCellSize (rows: number, cols: number, clueCount: number, copies: CopiesPerPage) {
  if (rows < 1 || cols < 1) return 0
  const box = contentBox(copies)
  const header = copies === '2' ? 48 : 56
  const clueRows = Math.max(1, Math.ceil(clueCount / 2))
  const clueHeight = SECTION_HEADING_SIZE + SECTION_HEADING_GAP + clueRows * 30
  const room = box.height - header - clueHeight - 12
  const byWidth = Math.floor(box.width / cols)
  const byHeight = Math.floor(room / rows)
  return Math.min(byWidth, byHeight)
}
