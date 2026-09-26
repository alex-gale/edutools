import type { PDFPage } from 'pdf-lib'
import type { CrosswordPageBorder, CrosswordPlacement, CrosswordPuzzle, CrosswordWordList } from '../../types/puzzle'
import { A4, MARGIN } from '../fit-sheet'
import { drawCenteredText, drawHeader, ink, marigold, openSheet, pine, white, type SheetFonts } from './sheet'
import { pdfText, wrapText } from './text'

interface ColumnLayout {
  heading: string
  clues: string[][]
  height: number
}

interface CrosswordPdfOptions {
  title: string
  answers: boolean
  wordList: CrosswordWordList
  pageBorder: CrosswordPageBorder
}

interface BankLayout {
  words: string[]
  columns: number
  width: number
  fontSize: number
  lineHeight: number
  height: number
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
  const bank = bankLayout(options.wordList === 'show' ? answerWords(puzzle) : [])
  const layout = chooseLayout(puzzle, fonts, across, down, headerBottom, options.answers, bank)

  drawGrid(page, fonts, puzzle, options.answers, layout)
  if (options.pageBorder === 'show') drawGridBorder(page, puzzle, layout)
  drawClues(page, fonts, layout)
  drawWordBank(page, fonts, layout)

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
  answers: boolean,
  bank: BankLayout
) {
  const contentWidth = A4.width - MARGIN * 2
  const available = headerBottom - MARGIN
  const columns = [across, down].filter(items => items.length > 0)
  const gap = columns.length > 1 ? 16 : 0
  const columnWidth = columns.length > 1
    ? (contentWidth - gap) / 2
    : contentWidth

  let chosen = measure(fonts, across, down, columnWidth, 10, answers, available, contentWidth, puzzle, bank)

  for (const fontSize of [9, 8, 7]) {
    if (chosen.cell >= 14) break
    chosen = measure(fonts, across, down, columnWidth, fontSize, answers, available, contentWidth, puzzle, bank)
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
  puzzle: CrosswordPuzzle,
  bank: BankLayout
) {
  const lineHeight = fontSize + 3
  const left = columnOf('Across', across, fonts, fontSize, columnWidth, lineHeight, answers)
  const right = columnOf('Down', down, fonts, fontSize, columnWidth, lineHeight, answers)
  const clueHeight = Math.max(left?.height ?? 0, right?.height ?? 0)
  const room = available - clueHeight - 12
  const bankGap = bank.width > 0 ? 14 : 0
  const gridWidth = contentWidth - bank.width - bankGap
  const rawCell = Math.floor(Math.min(
    gridWidth / puzzle.cols,
    room / puzzle.rows
  ))
  const cell = Math.min(26, Math.max(rawCell, 8))
  const gridHeight = cell * puzzle.rows
  const band = Math.max(gridHeight, bank.height)
  const bandBottom = MARGIN + clueHeight + 12
  const bandY = bandBottom + Math.max(0, room - band) / 2
  const pairWidth = cell * puzzle.cols + bankGap + bank.width
  const pairX = MARGIN + Math.max(0, (contentWidth - pairWidth) / 2)

  return {
    fontSize,
    lineHeight,
    columnWidth,
    left,
    right,
    cell,
    gridX: pairX,
    gridY: bandY + band - gridHeight,
    clueTop: MARGIN + clueHeight,
    bankX: pairX + cell * puzzle.cols + bankGap,
    bankTop: bandY + band,
    bank
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

function drawWordBank (
  page: PDFPage,
  fonts: SheetFonts,
  layout: ReturnType<typeof measure>
) {
  const bank = layout.bank
  if (bank.words.length === 0) return

  page.drawText('Words', {
    x: layout.bankX,
    y: layout.bankTop - 12,
    size: 12,
    font: fonts.bold,
    color: marigold
  })

  const rows = Math.ceil(bank.words.length / bank.columns)
  const colWidth = bank.width / bank.columns
  bank.words.forEach((word, index) => {
    const column = Math.floor(index / rows)
    const row = index % rows
    page.drawText(word, {
      x: layout.bankX + column * colWidth,
      y: layout.bankTop - 18 - row * bank.lineHeight - bank.fontSize,
      size: bank.fontSize,
      font: fonts.regular,
      color: ink
    })
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

function answerWords (puzzle: CrosswordPuzzle) {
  return [...puzzle.placements.map(item => pdfText(item.answer))].filter(Boolean).sort((a, b) => a.localeCompare(b))
}

function bankLayout (words: string[]): BankLayout {
  if (words.length === 0) {
    return { words, columns: 1, width: 0, fontSize: 10, lineHeight: 13, height: 0 }
  }

  const columns = words.length > 14 ? 2 : 1
  const fontSize = words.length > 22 ? 8 : 10
  const lineHeight = fontSize + 3
  const rows = Math.ceil(words.length / columns)
  return {
    words,
    columns,
    width: columns === 2 ? 156 : 100,
    fontSize,
    lineHeight,
    height: 18 + rows * lineHeight
  }
}

function isColumn (column: ColumnLayout | null): column is ColumnLayout {
  return column !== null
}
