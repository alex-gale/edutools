import { CrosswordForm } from '@/components/crossword/CrosswordForm'
import { ToolPage } from '@/components/layout/ToolPage'
import { ClueList } from '@/components/puzzle/ClueList'
import { CrosswordGrid } from '@/components/puzzle/CrosswordGrid'
import { CrosswordWordList } from '@/components/puzzle/CrosswordWordList'
import { PreviewPanel } from '@/components/puzzle/PreviewPanel'
import { useCrossword } from '@/hooks/use-crossword'
import { crosswordExample } from '@/pages/crossword/example'

export function CrosswordPage () {
  const sheet = useCrossword()

  return (
    <ToolPage
      eyebrow='Crossword'
      title='Build a crossword'
      lede='Each line is a word, then its clue. Download the sheet or the answer key when it looks right.'
      editor={(
        <CrosswordForm
          title={sheet.title}
          input={sheet.input}
          wordList={sheet.wordList}
          pageBorder={sheet.pageBorder}
          message={sheet.message}
          messageTone={sheet.messageTone}
          onTitleChange={value => sheet.handleTitleChange(value)}
          onInputChange={value => sheet.handleInputChange(value)}
          onWordListChange={value => sheet.handleWordListChange(value)}
          onPageBorderChange={value => sheet.handlePageBorderChange(value)}
          onGenerate={() => sheet.handleGenerate()}
          onExample={() => sheet.handleInputChange(crosswordExample)}
        />
      )}
      preview={(
        <PreviewPanel
          ready={sheet.puzzle !== null}
          view={sheet.view}
          downloading={sheet.downloading}
          onViewChange={value => sheet.handleViewChange(value)}
          onDownloadPuzzle={() => { sheet.handleDownloadPuzzle() }}
          onDownloadAnswers={() => { sheet.handleDownloadAnswers() }}
        >
          {sheet.puzzle
            ? (
              <>
                <div className='flex items-start gap-4'>
                  <div className='min-w-0 flex-1'>
                    <CrosswordGrid
                      puzzle={sheet.puzzle}
                      showAnswers={sheet.view === 'answers'}
                      bordered={sheet.pageBorder === 'show'}
                    />
                  </div>
                  {sheet.wordList === 'show'
                    ? <CrosswordWordList placements={sheet.puzzle.placements} />
                    : null}
                </div>
                <ClueList placements={sheet.puzzle.placements} showAnswers={sheet.view === 'answers'} />
              </>
              )
            : null}
        </PreviewPanel>
      )}
    />
  )
}
