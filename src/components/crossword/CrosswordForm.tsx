import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Notice } from '@/ui/Notice'
import { SegmentedControl } from '@/ui/SegmentedControl'
import { TextArea } from '@/ui/TextArea'
import { TextField } from '@/ui/TextField'
import type { CrosswordPageBorder, CrosswordWordList, NoticeTone } from '@/types/puzzle'

const showHide = [
  { value: 'hide', label: 'Hide' },
  { value: 'show', label: 'Show' }
] as const

interface CrosswordFormProps {
  title: string
  input: string
  wordList: CrosswordWordList
  pageBorder: CrosswordPageBorder
  message: string | null
  messageTone: NoticeTone
  onTitleChange: (value: string) => void
  onInputChange: (value: string) => void
  onWordListChange: (value: CrosswordWordList) => void
  onPageBorderChange: (value: CrosswordPageBorder) => void
  onGenerate: () => void
  onExample: () => void
}

export function CrosswordForm ({
  title,
  input,
  wordList,
  pageBorder,
  message,
  messageTone,
  onTitleChange,
  onInputChange,
  onWordListChange,
  onPageBorderChange,
  onGenerate,
  onExample
}: CrosswordFormProps) {
  return (
    <Card>
      <div className='space-y-4'>
        <TextField
          label='Sheet title'
          value={title}
          onChange={value => onTitleChange(value)}
        />
        <TextArea
          label='Answers and clues'
          value={input}
          onChange={value => onInputChange(value)}
          placeholder='orbit the path a planet takes around a star'
          hint='One line per clue: the answer word, a space, then the clue.'
        />
        <div>
          <span className='text-sm font-bold text-ink'>Word list</span>
          <span className='mt-1 block text-sm leading-5 text-muted'>The answers beside the grid.</span>
          <div className='mt-2'>
            <SegmentedControl
              label='Word list'
              value={wordList}
              options={[...showHide]}
              onChange={value => onWordListChange(value)}
            />
          </div>
        </div>
        <div>
          <span className='text-sm font-bold text-ink'>Grid border</span>
          <span className='mt-1 block text-sm leading-5 text-muted'>A line around the crossword grid.</span>
          <div className='mt-2'>
            <SegmentedControl
              label='Grid border'
              value={pageBorder}
              options={[...showHide]}
              onChange={value => onPageBorderChange(value)}
            />
          </div>
        </div>
        {message ? <Notice tone={messageTone}>{message}</Notice> : null}
        <div className='flex flex-wrap gap-2'>
          <Button onClick={() => onGenerate()}>Make crossword</Button>
          <Button variant='ghost' onClick={() => onExample()}>Use an example</Button>
        </div>
        <p className='text-sm leading-5 text-muted'>
          Both PDFs are a single A4 page of text and shapes, ready to open in Canva.
        </p>
      </div>
    </Card>
  )
}
