import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Notice } from '@/ui/Notice'
import { SegmentedControl } from '@/ui/SegmentedControl'
import { TextArea } from '@/ui/TextArea'
import { TextField } from '@/ui/TextField'
import type { NoticeTone, WordsearchDifficulty, WordsearchGridLines, WordsearchLetterCase, WordsearchSize } from '@/types/puzzle'

const difficulties: Array<{ value: WordsearchDifficulty, label: string }> = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' }
]

const sizes: Array<{ value: WordsearchSize, label: string }> = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }
]

const sizeHint: Record<WordsearchSize, string> = {
  small: 'The smallest grid that fits these words.',
  medium: 'A roomier grid.',
  large: 'The roomiest grid.'
}

const gridLineOptions: Array<{ value: WordsearchGridLines, label: string }> = [
  { value: 'show', label: 'Show' },
  { value: 'hide', label: 'Hide' }
]

const letterCaseOptions: Array<{ value: WordsearchLetterCase, label: string }> = [
  { value: 'upper', label: 'Uppercase' },
  { value: 'lower', label: 'Lowercase' }
]

const difficultyHint: Record<WordsearchDifficulty, string> = {
  easy: 'Forwards only, across and down.',
  medium: 'Forwards, including diagonals.',
  hard: 'Any direction, including backwards.'
}

interface WordsearchFormProps {
  title: string
  input: string
  difficulty: WordsearchDifficulty
  sheetSize: WordsearchSize
  gridLines: WordsearchGridLines
  letterCase: WordsearchLetterCase
  message: string | null
  messageTone: NoticeTone
  onTitleChange: (value: string) => void
  onInputChange: (value: string) => void
  onDifficultyChange: (value: WordsearchDifficulty) => void
  onSheetSizeChange: (value: WordsearchSize) => void
  onGridLinesChange: (value: WordsearchGridLines) => void
  onLetterCaseChange: (value: WordsearchLetterCase) => void
  onGenerate: () => void
  onExample: () => void
}

export function WordsearchForm ({
  title,
  input,
  difficulty,
  sheetSize,
  gridLines,
  letterCase,
  message,
  messageTone,
  onTitleChange,
  onInputChange,
  onDifficultyChange,
  onSheetSizeChange,
  onGridLinesChange,
  onLetterCaseChange,
  onGenerate,
  onExample
}: WordsearchFormProps) {
  return (
    <Card>
      <div className='space-y-4'>
        <TextField
          label='Sheet title'
          value={title}
          onChange={value => onTitleChange(value)}
        />
        <TextArea
          label='Words'
          value={input}
          onChange={value => onInputChange(value)}
          placeholder={'planet\norbit\ngravity'}
          hint='One word per line, or separate them with commas.'
        />
        <div>
          <span className='text-sm font-bold text-ink'>Difficulty</span>
          <span className='mt-1 block text-sm leading-5 text-muted'>{difficultyHint[difficulty]}</span>
          <div className='mt-2'>
            <SegmentedControl
              label='Difficulty'
              value={difficulty}
              options={difficulties}
              onChange={value => onDifficultyChange(value)}
            />
          </div>
        </div>
        <div>
          <span className='text-sm font-bold text-ink'>Size</span>
          <span className='mt-1 block text-sm leading-5 text-muted'>{sizeHint[sheetSize]}</span>
          <div className='mt-2'>
            <SegmentedControl
              label='Size'
              value={sheetSize}
              options={sizes}
              onChange={value => onSheetSizeChange(value)}
            />
          </div>
        </div>
        <div>
          <span className='text-sm font-bold text-ink'>Grid</span>
          <div className='mt-2'>
            <SegmentedControl
              label='Grid'
              value={gridLines}
              options={gridLineOptions}
              onChange={value => onGridLinesChange(value)}
            />
          </div>
        </div>
        <div>
          <span className='text-sm font-bold text-ink'>Letters</span>
          <div className='mt-2'>
            <SegmentedControl
              label='Letters'
              value={letterCase}
              options={letterCaseOptions}
              onChange={value => onLetterCaseChange(value)}
            />
          </div>
        </div>
        {message ? <Notice tone={messageTone}>{message}</Notice> : null}
        <div className='flex flex-wrap gap-2'>
          <Button onClick={() => onGenerate()}>Make word search</Button>
          <Button variant='ghost' onClick={() => onExample()}>Use an example</Button>
        </div>
        <p className='text-sm leading-5 text-muted'>
          Both PDFs are a single A4 page of text and shapes, ready to open in Canva.
        </p>
      </div>
    </Card>
  )
}
