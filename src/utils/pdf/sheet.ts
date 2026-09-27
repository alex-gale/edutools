import * as fontkit from '@pdf-lib/fontkit'
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type { CopiesPerPage } from '../../types/puzzle'
import { A4, A5_PAD, MARGIN, SECTION_HEADING_SIZE, pageSize, pairFrames } from '../fit-sheet'
import { wrapText } from './text'

const didactGothicUrl = new URL('../../assets/fonts/DidactGothic-Regular.ttf', import.meta.url)

export const ink = rgb(0.11, 0.16, 0.13)
export const pine = rgb(0.16, 0.42, 0.28)
export const line = rgb(0.45, 0.4, 0.32)
export const white = rgb(1, 1, 1)

export interface SheetFonts {
  regular: PDFFont
  bold: PDFFont
}

export async function openSheet (copies: CopiesPerPage) {
  const doc = await PDFDocument.create()
  doc.registerFontkit(sheetFontkit())
  const size = pageSize(copies)
  const page = doc.addPage([size.width, size.height])
  const face = await doc.embedFont(await loadDidactGothic(), { subset: true })
  return { doc, page, fonts: { regular: face, bold: face } }
}

function sheetFontkit () {
  const loaded = fontkit as typeof fontkit & { default?: typeof fontkit }
  return typeof loaded.create === 'function' ? loaded : loaded.default ?? loaded
}

async function loadDidactGothic () {
  const response = await fetch(didactGothicUrl)
  if (!response.ok) throw new Error('Could not load the sheet font')
  return new Uint8Array(await response.arrayBuffer())
}

export function drawHeader (
  page: PDFPage,
  fonts: SheetFonts,
  title: string,
  subtitle: string
) {
  const top = A4.height - MARGIN
  page.drawText(title, {
    x: MARGIN,
    y: top - 20,
    size: 22,
    font: fonts.bold,
    color: ink
  })
  page.drawText(subtitle, {
    x: MARGIN,
    y: top - 40,
    size: 12,
    font: fonts.regular,
    color: pine
  })

  return top - 56
}

export interface ContentBox {
  x: number
  bottom: number
  width: number
  top: number
}

export function drawPageFrame (
  page: PDFPage,
  frame: { x: number, y: number, width: number, height: number }
) {
  page.drawRectangle({
    x: frame.x,
    y: frame.y,
    width: frame.width,
    height: frame.height,
    borderColor: ink,
    borderWidth: 1.6
  })
}

export function drawFrameHeader (
  page: PDFPage,
  fonts: SheetFonts,
  box: ContentBox,
  title: string,
  subtitle: string
) {
  const size = 14
  const lines = wrapText(title, fonts.bold, size, box.width).slice(0, 2)
  let y = box.top

  for (const line of lines) {
    y -= size
    page.drawText(line, {
      x: box.x,
      y,
      size,
      font: fonts.bold,
      color: ink
    })
  }

  y -= 14
  page.drawText(subtitle, {
    x: box.x,
    y,
    size: 10,
    font: fonts.regular,
    color: pine
  })

  return y - 10
}

export function contentBoxes (
  page: PDFPage,
  fonts: SheetFonts,
  copies: CopiesPerPage,
  title: string,
  subtitle: string
) {
  if (copies === '1') {
    const headerBottom = drawHeader(page, fonts, title, subtitle)
    return [{
      x: MARGIN,
      bottom: MARGIN,
      width: A4.width - MARGIN * 2,
      top: headerBottom
    }]
  }

  const frames = pairFrames()
  drawCutLine(page)
  return frames.map(frame => {
    drawPageFrame(page, frame)
    const box: ContentBox = {
      x: frame.x + A5_PAD,
      bottom: frame.y + A5_PAD,
      width: frame.width - A5_PAD * 2,
      top: frame.y + frame.height - A5_PAD
    }
    return {
      ...box,
      top: drawFrameHeader(page, fonts, box, title, subtitle)
    }
  })
}

function drawCutLine (page: PDFPage) {
  const size = pageSize('2')
  const x = size.width / 2
  page.drawLine({
    start: { x, y: 6 },
    end: { x, y: size.height - 6 },
    thickness: 0.9,
    color: ink,
    dashArray: [1, 3]
  })
}

export function drawSectionHeading (
  page: PDFPage,
  fonts: SheetFonts,
  text: string,
  x: number,
  baseline: number
) {
  page.drawText(text, {
    x,
    y: baseline,
    size: SECTION_HEADING_SIZE,
    font: fonts.bold,
    color: pine
  })
  page.drawText(text, {
    x: x + 0.35,
    y: baseline,
    size: SECTION_HEADING_SIZE,
    font: fonts.bold,
    color: pine
  })
}

export function drawCenteredText (
  page: PDFPage,
  text: string,
  fonts: SheetFonts,
  box: { x: number, y: number, size: number },
  fontSize: number
) {
  const width = fonts.bold.widthOfTextAtSize(text, fontSize)
  page.drawText(text, {
    x: box.x + (box.size - width) / 2,
    y: box.y + (box.size - fontSize) / 2 + 1,
    size: fontSize,
    font: fonts.bold,
    color: ink
  })
}
