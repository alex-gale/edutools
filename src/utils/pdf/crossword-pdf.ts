import type { PDFPage } from 'pdf-lib'
import type { CopiesPerPage, CrosswordPageBorder, CrosswordPlacement, CrosswordPuzzle } from '../../types/puzzle'
import { SECTION_HEADING_GAP, SECTION_HEADING_SIZE } from '../fit-sheet'
import { contentBoxes, drawCenteredText, drawSectionHeading, ink, openSheet, white, type ContentBox, type SheetFonts } from './sheet'
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
  copies: CopiesPerPage
}

interface PuzzleLayout {
  fontSize: number
  lineHeight: number
  columnWidth: number
  columnGap: number
  boxX: number
  left: ColumnLayout | null
  right: ColumnLayout | null
  cell: number
  gridX: number
  gridY: number
  clueTop: number
}

export async function buildCrosswordPdf (
  puzzle: CrosswordPuzzle,
  options: CrosswordPdfOptions
) {
  const { doc, page, fonts } = await openSheet(options.copies)
  const title = pdfText(options.title) || 'Crossword'
  const subtitle = options.answers ? 'Answer key' : 'Crossword'
  const boxes = contentBoxes(page, fonts, options.copies, title, subtitle)

  for (const box of boxes) {
    const across = byNumber(puzzle, 'across')
    const down = byNumber(puzzle, 'down')
    const layout = chooseLayout(puzzle, fonts, across, down, box, options.answers)
    drawGrid(page, fonts, puzzle, options.answers, layout)
    if (options.pageBorder === 'show') drawGridBorder(page, puzzle, layout)
    drawClues(page, fonts, layout)
  }

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
  box: ContentBox,
  answers: boolean
) {
  const columns = [across, down].filter(items => items.length > 0)
  const columnGap = columns.length > 1 ? 16 : 0
  const columnWidth = columns.length > 1
    ? (box.width - columnGap) / 2
    : box.width

  let chosen = measure(fonts, across, down, columnWidth, columnGap, 10, answers, box, puzzle)

  for (const fontSize of [9, 8, 7]) {
    if (chosen.cell >= 14) break
    chosen = measure(fonts, across, down, columnWidth, columnGap, fontSize, answers, box, puzzle)
  }

  return chosen
}

function measure (
  fonts: SheetFonts,
  across: CrosswordPlacement[],
  down: CrosswordPlacement[],
  columnWidth: number,
  columnGap: number,
  fontSize: number,
  answers: boolean,
  box: ContentBox,
  puzzle: CrosswordPuzzle
): PuzzleLayout {
  const lineHeight = fontSize + 3
  const left = columnOf('Across', across, fonts, fontSize, columnWidth, lineHeight, answers)
  const right = columnOf('Down', down, fonts, fontSize, columnWidth, lineHeight, answers)
  const clueHeight = Math.max(left?.height ?? 0, right?.height ?? 0)
  const available = box.top - box.bottom
  const room = available - clueHeight - 12
  const rawCell = Math.floor(Math.min(
    box.width / puzzle.cols,
    room / puzzle.rows
  ))
  const cell = Math.min(26, Math.max(rawCell, 8))
  const gridSize = { width: cell * puzzle.cols, height: cell * puzzle.rows }
  const gridX = box.x + (box.width - gridSize.width) / 2
  const gridY = box.bottom + clueHeight + 12 + Math.max(0, room - gridSize.height) / 2

  return {
    fontSize,
    lineHeight,
    columnWidth,
    columnGap,
    boxX: box.x,
    left,
    right,
    cell,
    gridX,
    gridY,
    clueTop: box.bottom + clueHeight
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
  const height = SECTION_HEADING_SIZE + SECTION_HEADING_GAP + clues.reduce((sum, lines) => sum + lines.length * lineHeight + 3, 0)
  return { heading, clues, height }
}

function drawGrid (
  page: PDFPage,
  fonts: SheetFonts,
  puzzle: CrosswordPuzzle,
  answers: boolean,
  layout: PuzzleLayout
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
  layout: PuzzleLayout
) {
  const columns = [layout.left, layout.right].filter(isColumn)
  columns.forEach((column, index) => {
    const x = layout.boxX + index * (layout.columnWidth + layout.columnGap)
    const headingBaseline = layout.clueTop - SECTION_HEADING_SIZE
    drawSectionHeading(page, fonts, column.heading, x, headingBaseline)
    let y = headingBaseline - SECTION_HEADING_GAP

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
  layout: PuzzleLayout
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
