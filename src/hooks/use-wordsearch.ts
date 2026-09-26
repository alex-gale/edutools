import { useState } from 'react'
import type { NoticeTone, SheetView, WordsearchDifficulty, WordsearchGridLines, WordsearchLetterCase, WordsearchPuzzle, WordsearchSize } from '@/types/puzzle'
import { COMFORTABLE_CELL, wordsearchCellSize } from '@/utils/fit-sheet'
import { fileSlug } from '@/utils/file-slug'
import { generateWordsearch } from '@/utils/generate-wordsearch'
import { parseWordList } from '@/utils/parse-word-list'
import { downloadPdf } from '@/utils/pdf/download'

export function useWordsearch () {
  const [title, setTitle] = useState('Word search')
  const [input, setInput] = useState('')
  const [difficulty, setDifficulty] = useState<WordsearchDifficulty>('medium')
  const [sheetSize, setSheetSize] = useState<WordsearchSize>('medium')
  const [gridLines, setGridLines] = useState<WordsearchGridLines>('show')
  const [letterCase, setLetterCase] = useState<WordsearchLetterCase>('upper')
  const [puzzle, setPuzzle] = useState<WordsearchPuzzle | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [messageTone, setMessageTone] = useState<NoticeTone>('info')
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

  function handleGridLinesChange (next: WordsearchGridLines) {
    setGridLines(next)
  }

  function handleLetterCaseChange (next: WordsearchLetterCase) {
    setLetterCase(next)
  }

  function handleDifficultyChange (next: WordsearchDifficulty) {
    setDifficulty(next)
    if (puzzle) build(next, sheetSize)
  }

  function handleSheetSizeChange (next: WordsearchSize) {
    setSheetSize(next)
    if (puzzle) build(difficulty, next)
  }

  function handleGenerate () {
    build(difficulty, sheetSize)
  }

  function build (level: WordsearchDifficulty, nextSize: WordsearchSize) {
    const parsed = parseWordList(input)
    if (parsed.words.length === 0) {
      setPuzzle(null)
      setMessageTone('warning')
      setMessage('Add at least one word of two letters or more, one per line.')
      return
    }

    const next = generateWordsearch(parsed.words, level, nextSize)
    if (next.grid.length === 0) {
      setPuzzle(null)
      setMessageTone('warning')
      setMessage(wordsearchNotes(parsed.skipped, next) ?? 'Could not build a sheet from these words.')
      return
    }

    setPuzzle(next)
    setView('puzzle')
    const notes = wordsearchNotes(parsed.skipped, next)
    setMessage(notes)
    setMessageTone(notes ? 'warning' : 'info')
  }

  async function download (kind: SheetView) {
    if (!puzzle) return
    setDownloading(kind)
    try {
      const { buildWordsearchPdf } = await import('@/utils/pdf/wordsearch-pdf')
      const bytes = await buildWordsearchPdf(puzzle, {
        title,
        answers: kind === 'answers',
        gridLines,
        letterCase
      })
      const suffix = kind === 'answers' ? '-answers' : ''
      downloadPdf(bytes, `${fileSlug(title, 'wordsearch')}${suffix}.pdf`)
    } catch {
      setMessageTone('warning')
      setMessage('The PDF could not be created. Try again in a moment.')
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
    difficulty,
    sheetSize,
    gridLines,
    letterCase,
    puzzle,
    message,
    messageTone,
    view,
    downloading,
    handleTitleChange,
    handleInputChange,
    handleDifficultyChange,
    handleSheetSizeChange,
    handleGridLinesChange,
    handleLetterCaseChange,
    handleViewChange,
    handleGenerate,
    handleDownloadPuzzle,
    handleDownloadAnswers
  }
}

function wordsearchNotes (skipped: number, puzzle: WordsearchPuzzle) {
  const notes: string[] = []

  if (skipped > 0) {
    notes.push(`Skipped ${skipped} ${skipped === 1 ? 'entry' : 'entries'} that were not single words.`)
  }

  if (puzzle.unsuitable.length > 0) {
    notes.push(`Left out ${puzzle.unsuitable.join(', ')}. Those words are not suitable for a classroom sheet.`)
  }

  if (puzzle.unplaced.length > 0) {
    notes.push(`Could not fit: ${puzzle.unplaced.join(', ')}. Try fewer or shorter words.`)
  }

  if (puzzle.size < 1) return notes.length > 0 ? notes.join(' ') : null

  const cell = wordsearchCellSize(puzzle.size, puzzle.placements.length)
  if (cell < COMFORTABLE_CELL) {
    notes.push('This will be cramped on one page. A shorter list will be easier to read and to edit in Canva.')
  }

  return notes.length > 0 ? notes.join(' ') : null
}
