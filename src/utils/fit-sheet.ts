import type { CopiesPerPage } from '../types/puzzle'

export const A4 = { width: 595.28, height: 841.89 }
export const MARGIN = 40
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
