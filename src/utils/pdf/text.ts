import type { PDFFont } from 'pdf-lib'

const swaps: Record<string, string> = {
  '\u2018': "'",
  '\u2019': "'",
  '\u201C': '"',
  '\u201D': '"',
  '\u2013': '-',
  '\u2014': '-',
  '\u2026': '...',
  '\u00A0': ' '
}

export function pdfText (value: string) {
  const mapped = Array.from(value, char => swaps[char] ?? char).join('')
  const ascii = mapped.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  return ascii.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim()
}

export function wrapText (text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = pdfText(text).split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next
      continue
    }
    if (current) lines.push(current)
    current = word
  }

  if (current) lines.push(current)
  return lines.length > 0 ? lines : ['']
}
