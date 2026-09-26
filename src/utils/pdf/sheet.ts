import * as fontkit from '@pdf-lib/fontkit'
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { A4, MARGIN } from '../fit-sheet'

const didactGothicUrl = new URL('../../assets/fonts/DidactGothic-Regular.ttf', import.meta.url)

export const ink = rgb(0.11, 0.16, 0.13)
export const pine = rgb(0.16, 0.42, 0.28)
export const line = rgb(0.45, 0.4, 0.32)
export const white = rgb(1, 1, 1)

export interface SheetFonts {
  regular: PDFFont
  bold: PDFFont
}

export async function openSheet () {
  const doc = await PDFDocument.create()
  doc.registerFontkit(sheetFontkit())
  const page = doc.addPage([A4.width, A4.height])
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
