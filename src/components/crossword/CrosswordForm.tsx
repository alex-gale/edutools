import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Notice } from '@/ui/Notice'
import { TextArea } from '@/ui/TextArea'
import { TextField } from '@/ui/TextField'
import type { NoticeTone } from '@/types/puzzle'

interface CrosswordFormProps {
  title: string
  input: string
  message: string | null
  messageTone: NoticeTone
  onTitleChange: (value: string) => void
  onInputChange: (value: string) => void
  onGenerate: () => void
  onExample: () => void
}

export function CrosswordForm ({
  title,
  input,
  message,
  messageTone,
  onTitleChange,
  onInputChange,
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
