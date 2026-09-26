import type { ReactNode } from 'react'
import { Download, KeyRound } from 'lucide-react'
import type { SheetView } from '@/types/puzzle'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { SegmentedControl } from '@/ui/SegmentedControl'

interface PreviewPanelProps {
  ready: boolean
  view: SheetView
  downloading: SheetView | null
  onViewChange: (view: SheetView) => void
  onDownloadPuzzle: () => void
  onDownloadAnswers: () => void
  children: ReactNode
}

const viewOptions: Array<{ value: SheetView, label: string }> = [
  { value: 'puzzle', label: 'Puzzle' },
  { value: 'answers', label: 'Answers' }
]

export function PreviewPanel ({
  ready,
  view,
  downloading,
  onViewChange,
  onDownloadPuzzle,
  onDownloadAnswers,
  children
}: PreviewPanelProps) {
  return (
    <Card className='min-h-80'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <SegmentedControl
          label='Sheet view'
          value={view}
          options={viewOptions}
          onChange={value => onViewChange(value)}
        />
        <div className='flex flex-wrap gap-2'>
          <Button
            variant='secondary'
            disabled={!ready || downloading !== null}
            onClick={() => onDownloadPuzzle()}
          >
            <Download size={16} aria-hidden='true' />
            Puzzle PDF
          </Button>
          <Button
            disabled={!ready || downloading !== null}
            onClick={() => onDownloadAnswers()}
          >
            <KeyRound size={16} aria-hidden='true' />
            Answer PDF
          </Button>
        </div>
      </div>
      <div className='mt-5'>
        {ready
          ? children
          : (
            <div className='flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-line bg-paper/60 px-6 text-center text-muted'>
              Your sheet will show up here.
            </div>
            )}
      </div>
    </Card>
  )
}
