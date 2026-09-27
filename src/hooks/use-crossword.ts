import { useState } from 'react'
import type { CopiesPerPage, CrosswordPageBorder, CrosswordPuzzle, NoticeTone, SheetView } from '@/types/puzzle'
import { generateCrossword } from '@/utils/generate-crossword'
import { parseCrosswordEntries } from '@/utils/parse-crossword-entries'
import { fileSlug } from '@/utils/file-slug'
import { downloadPdf } from '@/utils/pdf/download'

export function useCrossword () {
  const [title, setTitle] = useState('')
  const [input, setInput] = useState('')
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [messageTone, setMessageTone] = useState<NoticeTone>('info')
  const [pageBorder, setPageBorder] = useState<CrosswordPageBorder>('show')
  const [copies, setCopies] = useState<CopiesPerPage>('1')
  const [view, setView] = useState<SheetView>('puzzle')
  const [downloading, setDownloading] = useState<SheetView | null>(null)

  function handleTitleChange (value: string) {
    setTitle(value)
  }

  function handleInputChange (value: string) {
    setInput(value)
    setMessage(null)
  }

  function handleViewChange (next: SheetView) {
    setView(next)
  }

  function handlePageBorderChange (next: CrosswordPageBorder) {
    setPageBorder(next)
  }

  function handleCopiesChange (next: CopiesPerPage) {
    setCopies(next)
  }

  function handleGenerate () {
    const parsed = parseCrosswordEntries(input)
    if (parsed.entries.length === 0) {
      setPuzzle(null)
      setMessageTone('warning')
      setMessage('Add at least one line with an answer and a clue, like orbit the path a planet takes around a star.')
      return
    }

    const next = generateCrossword(parsed.entries)
    setPuzzle(next)
    setView('puzzle')
    const notes = crosswordNotes(parsed.skipped, next)
    setMessage(notes)
    setMessageTone(notes ? 'warning' : 'info')
  }

  async function download (kind: SheetView) {
    if (!puzzle) return
    setDownloading(kind)
    try {
      const { buildCrosswordPdf } = await import('@/utils/pdf/crossword-pdf')
      const bytes = await buildCrosswordPdf(puzzle, {
        title,
        answers: kind === 'answers',
        pageBorder,
        copies
      })
      const suffix = kind === 'answers' ? '-answers' : ''
      downloadPdf(bytes, `${fileSlug(title, 'crossword')}${suffix}.pdf`)
    } catch {
      setMessageTone('warning')
      setMessage('The PDF could not be created. Check the clues for unusual characters and try again.')
    } finally {
      setDownloading(null)
    }
  }

  function handleDownloadPuzzle () {
    return download('puzzle')
  }

  function handleDownloadAnswers () {
    return download('answers')
  }

  return {
    title,
    input,
    puzzle,
    pageBorder,
    copies,
    message,
    messageTone,
    view,
    downloading,
    handleTitleChange,
    handleInputChange,
    handleViewChange,
    handlePageBorderChange,
    handleCopiesChange,
    handleGenerate,
    handleDownloadPuzzle,
    handleDownloadAnswers
  }
}

function crosswordNotes (skipped: number, puzzle: CrosswordPuzzle) {
  const notes: string[] = []

  if (skipped > 0) {
    notes.push(`Skipped ${skipped} ${skipped === 1 ? 'line' : 'lines'} that need a single-word answer and a clue.`)
  }

  if (puzzle.unplaced.length > 0) {
    const words = puzzle.unplaced.map(entry => entry.answer).join(', ')
    notes.push(`Could not cross these in: ${words}. Each answer needs a shared letter with another word.`)
  }

  return notes.length > 0 ? notes.join(' ') : null
}
