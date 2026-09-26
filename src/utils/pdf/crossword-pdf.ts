import type { PDFPage } from 'pdf-lib'
import type { CrosswordPageBorder, CrosswordPlacement, CrosswordPuzzle } from '../../types/puzzle'
import { A4, MARGIN } from '../fit-sheet'
import { drawCenteredText, drawHeader, ink, openSheet, pine, white, type SheetFonts } from './sheet'
import { pdfText, wrapText } from './text'

interface ColumnLayout {
  heading: string
  clues: string[][]
  height: number
}

interface CrosswordPdfOptions {
  title: string
  answers: boolean
  pageBorder: CrosswordPageBorder
}

export async function buildCrosswordPdf (
  puzzle: CrosswordPuzzle,
  options: CrosswordPdfOptions
) {
  const { doc, page, fonts } = await openSheet()
  const headerBottom = drawHeader(
    page,
    fonts,
    pdfText(options.title) || 'Crossword',
    options.answers ? 'Answer key' : 'Crossword'
  )

  const across = byNumber(puzzle, 'across')
  const down = byNumber(puzzle, 'down')
  const layout = chooseLayout(puzzle, fonts, across, down, headerBottom, options.answers)

  drawGrid(page, fonts, puzzle, options.answers, layout)
  if (options.pageBorder === 'show') drawGridBorder(page, puzzle, layout)
  drawClues(page, fonts, layout)

  return doc.save()
}

function byNumber (puzzle: CrosswordPuzzle, direction: 'across' | 'down') {
  return puzzle.placements
    .filter(item => item.direction === direction)
    .sort((a, b) => a.number - b.number)
}

function chooseLayout (
  puzzle: CrosswordPuzzle,
  fonts: SheetFonts,
  across: CrosswordPlacement[],
  down: CrosswordPlacement[],
  headerBottom: number,
  answers: boolean
) {
  const contentWidth = A4.width - MARGIN * 2
  const available = headerBottom - MARGIN
  const columns = [across, down].filter(items => items.length > 0)
  const gap = columns.length > 1 ? 16 : 0
  const columnWidth = columns.length > 1
    ? (contentWidth - gap) / 2
    : contentWidth

  let chosen = measure(fonts, across, down, columnWidth, 10, answers, available, contentWidth, puzzle)

  for (const fontSize of [9, 8, 7]) {
    if (chosen.cell >= 14) break
    chosen = measure(fonts, across, down, columnWidth, fontSize, answers, available, contentWidth, puzzle)
  }

  return chosen
}

function measure (
  fonts: SheetFonts,
  across: CrosswordPlacement[],
  down: CrosswordPlacement[],
  columnWidth: number,
  fontSize: number,
  answers: boolean,
  available: number,
  contentWidth: number,
  puzzle: CrosswordPuzzle
) {
  const lineHeight = fontSize + 3
  const left = columnOf('Across', across, fonts, fontSize, columnWidth, lineHeight, answers)
  const right = columnOf('Down', down, fonts, fontSize, columnWidth, lineHeight, answers)
  const clueHeight = Math.max(left?.height ?? 0, right?.height ?? 0)
  const room = available - clueHeight - 12
  const rawCell = Math.floor(Math.min(
    contentWidth / puzzle.cols,
    room / puzzle.rows
  ))
  const cell = Math.min(26, Math.max(rawCell, 8))
  const gridSize = { width: cell * puzzle.cols, height: cell * puzzle.rows }
  const gridX = MARGIN + (contentWidth - gridSize.width) / 2
  const gridY = MARGIN + clueHeight + 12 + Math.max(0, room - gridSize.height) / 2

  return {
    fontSize,
    lineHeight,
    columnWidth,
    left,
    right,
    cell,
    gridX,
    gridY,
    clueTop: MARGIN + clueHeight
  }
}

function columnOf (
  heading: string,
  items: CrosswordPlacement[],
  fonts: SheetFonts,
  fontSize: number,
  columnWidth: number,
  lineHeight: number,
  answers: boolean
): ColumnLayout | null {
  if (items.length === 0) return null

  const clues = items.map(item => {
    const answer = answers ? ` (${item.answer})` : ''
    return wrapText(`${item.number}. ${item.clue}${answer}`, fonts.regular, fontSize, columnWidth)
  })
  const height = 16 + clues.reduce((sum, lines) => sum + lines.length * lineHeight + 3, 0)
  return { heading, clues, height }
}

function drawGrid (
  page: PDFPage,
  fonts: SheetFonts,
  puzzle: CrosswordPuzzle,
  answers: boolean,
  layout: ReturnType<typeof measure>
) {
  for (let row = 0; row < puzzle.rows; row += 1) {
    for (let col = 0; col < puzzle.cols; col += 1) {
      const x = layout.gridX + col * layout.cell
      const y = layout.gridY + (puzzle.rows - 1 - row) * layout.cell
      const data = puzzle.grid[row]?.[col]

      if (!data?.letter) continue

      page.drawRectangle({
        x,
        y,
        width: layout.cell,
        height: layout.cell,
        color: white,
        borderColor: ink,
        borderWidth: 0.8
      })

      if (data.number) {
        page.drawText(String(data.number), {
          x: x + 1.4,
          y: y + layout.cell - Math.min(8, layout.cell * 0.32),
          size: Math.min(8, layout.cell * 0.28),
          font: fonts.bold,
          color: ink
        })
      }

      if (answers) {
        drawCenteredText(
          page,
          data.letter,
          fonts,
          { x, y, size: layout.cell },
          Math.max(8, layout.cell * 0.42)
        )
      }
    }
  }
}

function drawClues (
  page: PDFPage,
  fonts: SheetFonts,
  layout: ReturnType<typeof measure>
) {
  const columns = [layout.left, layout.right].filter(isColumn)
  columns.forEach((column, index) => {
    const x = MARGIN + index * (layout.columnWidth + 16)
    let y = layout.clueTop
    page.drawText(column.heading, {
      x,
      y: y - 12,
      size: 12,
      font: fonts.bold,
      color: pine
    })
    y -= 18

    for (const clue of column.clues) {
      for (const text of clue) {
        page.drawText(text, {
          x,
          y: y - layout.fontSize,
          size: layout.fontSize,
          font: fonts.regular,
          color: ink
        })
        y -= layout.lineHeight
      }
      y -= 3
    }
  })
}

function drawGridBorder (
  page: PDFPage,
  puzzle: CrosswordPuzzle,
  layout: ReturnType<typeof measure>
) {
  page.drawRectangle({
    x: layout.gridX,
    y: layout.gridY,
    width: layout.cell * puzzle.cols,
    height: layout.cell * puzzle.rows,
    borderColor: ink,
    borderWidth: 1.6
  })
}

function isColumn (column: ColumnLayout | null): column is ColumnLayout {
  return column !== null
}
