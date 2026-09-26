import { rgb } from 'pdf-lib'
import type { WordsearchLetterCase, WordsearchGridLines, WordsearchPuzzle } from '../../types/puzzle'
import { A4, MARGIN } from '../fit-sheet'
import { wordColors } from '../word-colors'
import { drawCenteredText, drawHeader, openSheet, line } from './sheet'
import { pdfText } from './text'

export async function buildWordsearchPdf (
  puzzle: WordsearchPuzzle,
  options: {
    title: string
    answers: boolean
    gridLines: WordsearchGridLines
    letterCase: WordsearchLetterCase
  }
) {
  const { doc, page, fonts } = await openSheet()
  const headerBottom = drawHeader(
    page,
    fonts,
    pdfText(options.title) || 'Word search',
    options.answers ? 'Answer key' : 'Word search'
  )

  const words = puzzle.placements.map(item => cased(item.word, options.letterCase)).sort()
  const columns = words.length > 18 ? 4 : 3
  const bankFont = words.length > 24 ? 8 : 10
  const rowHeight = bankFont + 4
  const bankRows = Math.max(1, Math.ceil(words.length / columns))
  const bankHeight = 20 + bankRows * rowHeight
  const contentWidth = A4.width - MARGIN * 2
  const room = headerBottom - MARGIN - bankHeight - 12
  const cell = Math.max(8, Math.floor(Math.min(contentWidth, room) / puzzle.size))
  const gridSize = cell * puzzle.size
  const gridX = MARGIN + (contentWidth - gridSize) / 2
  const gridY = MARGIN + bankHeight + 12 + Math.max(0, room - gridSize) / 2

  drawGrid(page, fonts, puzzle, options, gridX, gridY, cell)
  drawBank(
    page,
    fonts,
    words,
    columns,
    bankFont,
    rowHeight,
    bankHeight,
    options.answers ? 'Words' : 'Find these words'
  )

  return doc.save()
}

function drawGrid (
  page: Awaited<ReturnType<typeof openSheet>>['page'],
  fonts: Awaited<ReturnType<typeof openSheet>>['fonts'],
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
  page: Awaited<ReturnType<typeof openSheet>>['page'],
  fonts: Awaited<ReturnType<typeof openSheet>>['fonts'],
  words: string[],
  columns: number,
  bankFont: number,
  rowHeight: number,
  bankHeight: number,
  heading: string
) {
  const colWidth = (A4.width - MARGIN * 2) / columns
  page.drawText(heading, {
    x: MARGIN,
    y: MARGIN + bankHeight - 12,
    size: 11,
    font: fonts.bold,
    color: rgb(0.11, 0.16, 0.13)
  })

  words.forEach((word, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    page.drawText(word, {
      x: MARGIN + column * colWidth,
      y: MARGIN + bankHeight - 28 - row * rowHeight,
      size: bankFont,
      font: fonts.regular,
      color: rgb(0.11, 0.16, 0.13)
    })
  })
}
