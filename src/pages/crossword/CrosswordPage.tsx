import { CrosswordForm } from '@/components/crossword/CrosswordForm'
import { ToolPage } from '@/components/layout/ToolPage'
import { ClueList } from '@/components/puzzle/ClueList'
import { CrosswordGrid } from '@/components/puzzle/CrosswordGrid'
import { PreviewPanel } from '@/components/puzzle/PreviewPanel'
import { useCrossword } from '@/hooks/use-crossword'
import { crosswordExample } from '@/pages/crossword/example'

export function CrosswordPage () {
  const sheet = useCrossword()
  const puzzle = sheet.puzzle
  const copyKeys = sheet.copies === '2' ? ['left', 'right'] : ['only']

  return (
    <ToolPage
      eyebrow='Crossword'
      title='Build a crossword'
      lede='Each line is a word, then its clue. Download the sheet or the answer key when it looks right.'
      editor={(
        <CrosswordForm
          title={sheet.title}
          input={sheet.input}
          pageBorder={sheet.pageBorder}
          copies={sheet.copies}
          message={sheet.message}
          messageTone={sheet.messageTone}
          onTitleChange={value => sheet.handleTitleChange(value)}
          onInputChange={value => sheet.handleInputChange(value)}
          onPageBorderChange={value => sheet.handlePageBorderChange(value)}
          onCopiesChange={value => sheet.handleCopiesChange(value)}
          onGenerate={() => sheet.handleGenerate()}
          onExample={() => sheet.handleInputChange(crosswordExample)}
        />
      )}
      preview={(
        <PreviewPanel
          ready={puzzle !== null}
          view={sheet.view}
          downloading={sheet.downloading}
          onViewChange={value => sheet.handleViewChange(value)}
          onDownloadPuzzle={() => { sheet.handleDownloadPuzzle() }}
          onDownloadAnswers={() => { sheet.handleDownloadAnswers() }}
        >
          {puzzle
            ? (
              <div className={sheet.copies === '2' ? 'relative grid grid-cols-2 items-start gap-3' : undefined}>
                {sheet.copies === '2'
                  ? <div className='pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dotted border-ink' aria-hidden='true' />
                  : null}
                {copyKeys.map(key => (
                  <div key={key} className={sheet.copies === '2' ? 'min-w-0 border-2 border-ink p-2' : undefined}>
                    <CrosswordGrid
                      puzzle={puzzle}
                      showAnswers={sheet.view === 'answers'}
                      bordered={sheet.pageBorder === 'show'}
                    />
                    <ClueList placements={puzzle.placements} showAnswers={sheet.view === 'answers'} />
                  </div>
                ))}
              </div>
              )
            : null}
        </PreviewPanel>
      )}
    />
  )
}
