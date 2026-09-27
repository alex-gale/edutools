import { rgb, type PDFPage } from 'pdf-lib'
import type { CopiesPerPage, WordsearchLetterCase, WordsearchGridLines, WordsearchPuzzle } from '../../types/puzzle'
import { SECTION_HEADING_GAP, SECTION_HEADING_SIZE } from '../fit-sheet'
import { wordColors } from '../word-colors'
import { contentBoxes, drawCenteredText, drawSectionHeading, ink, line, openSheet, type ContentBox, type SheetFonts } from './sheet'
import { pdfText } from './text'

interface WordsearchPdfOptions {
  title: string
  answers: boolean
  gridLines: WordsearchGridLines
  letterCase: WordsearchLetterCase
  copies: CopiesPerPage
}

export async function buildWordsearchPdf (
  puzzle: WordsearchPuzzle,
  options: WordsearchPdfOptions
) {
  const { doc, page, fonts } = await openSheet(options.copies)
  const title = pdfText(options.title) || 'Word search'
  const subtitle = options.answers ? 'Answer key' : 'Word search'
  const boxes = contentBoxes(page, fonts, options.copies, title, subtitle)

  for (const box of boxes) {
    drawPuzzle(page, fonts, puzzle, options, box)
  }

  return doc.save()
}

function drawPuzzle (
  page: PDFPage,
  fonts: SheetFonts,
  puzzle: WordsearchPuzzle,
  options: WordsearchPdfOptions,
  box: ContentBox
) {
  const words = puzzle.placements.map(item => cased(item.word, options.letterCase)).sort()
  const columns = box.width < 340 ? 2 : words.length > 18 ? 4 : 3
  const bankFont = words.length > 24 ? 8 : 10
  const rowHeight = bankFont + 4
  const bankRows = Math.max(1, Math.ceil(words.length / columns))
  const bankHeight = SECTION_HEADING_SIZE + SECTION_HEADING_GAP + bankRows * rowHeight
  const room = box.top - box.bottom - bankHeight - 12
  const cell = Math.max(8, Math.floor(Math.min(box.width, room) / Math.max(puzzle.size, 1)))
  const gridSize = cell * puzzle.size
  const gridX = box.x + (box.width - gridSize) / 2
  const gridY = box.bottom + bankHeight + 12 + Math.max(0, room - gridSize) / 2

  drawGrid(page, fonts, puzzle, options, gridX, gridY, cell)
  drawBank(
    page,
    fonts,
    words,
    columns,
    bankFont,
    rowHeight,
    box,
    bankHeight,
    options.answers ? 'Words' : 'Find these words'
  )
}

function drawGrid (
  page: PDFPage,
  fonts: SheetFonts,
  puzzle: WordsearchPuzzle,
  options: {
    answers: boolean
    gridLines: WordsearchGridLines
    letterCase: WordsearchLetterCase
  },
  gridX: number,
  gridY: number,
  cell: number
) {
  for (let row = 0; row < puzzle.size; row += 1) {
    for (let col = 0; col < puzzle.size; col += 1) {
      const x = gridX + col * cell
      const y = gridY + (puzzle.size - 1 - row) * cell
      const data = puzzle.grid[row]?.[col]
      const wordIndex = data?.wordIndexes[0]

      if (options.answers && wordIndex !== undefined) {
        const color = wordColors[wordIndex % wordColors.length]
        if (color) {
          page.drawRectangle({
            x: x + 0.6,
            y: y + 0.6,
            width: cell - 1.2,
            height: cell - 1.2,
            color: rgb(color.r, color.g, color.b)
          })
        }
      }

      if (options.gridLines === 'show') {
        page.drawRectangle({
          x,
          y,
          width: cell,
          height: cell,
          borderColor: line,
          borderWidth: 0.6
        })
      }

      if (data?.letter) {
        drawCenteredText(
          page,
          cased(data.letter, options.letterCase),
          fonts,
          { x, y, size: cell },
          Math.max(8, cell * 0.46)
        )
      }
    }
  }
}

function cased (value: string, letterCase: WordsearchLetterCase) {
  return letterCase === 'lower' ? value.toLowerCase() : value.toUpperCase()
}

function drawBank (
  page: PDFPage,
  fonts: SheetFonts,
  words: string[],
  columns: number,
  bankFont: number,
  rowHeight: number,
  box: ContentBox,
  bankHeight: number,
  heading: string
) {
  const colWidth = box.width / columns
  const headingBaseline = box.bottom + bankHeight - SECTION_HEADING_SIZE
  drawSectionHeading(page, fonts, heading, box.x, headingBaseline)

  words.forEach((word, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    page.drawText(word, {
      x: box.x + column * colWidth,
      y: headingBaseline - SECTION_HEADING_GAP - bankFont - row * rowHeight,
      size: bankFont,
      font: fonts.regular,
      color: ink
    })
  })
}
