import { ToolPage } from '@/components/layout/ToolPage'
import { PreviewPanel } from '@/components/puzzle/PreviewPanel'
import { WordsearchGrid } from '@/components/puzzle/WordsearchGrid'
import { WordsearchForm } from '@/components/wordsearch/WordsearchForm'
import { useWordsearch } from '@/hooks/use-wordsearch'
import { wordsearchExample } from '@/pages/wordsearch/example'

export function WordsearchPage () {
  const sheet = useWordsearch()
  const puzzle = sheet.puzzle
  const copyKeys = sheet.copies === '2' ? ['left', 'right'] : ['only']

  return (
    <ToolPage
      eyebrow='Word search'
      title='Build a word search'
      lede='Paste a list of words. Download the sheet or the answer key when it looks right.'
      editor={(
        <WordsearchForm
          title={sheet.title}
          input={sheet.input}
          difficulty={sheet.difficulty}
          sheetSize={sheet.sheetSize}
          gridLines={sheet.gridLines}
          letterCase={sheet.letterCase}
          copies={sheet.copies}
          message={sheet.message}
          messageTone={sheet.messageTone}
          onTitleChange={value => sheet.handleTitleChange(value)}
          onInputChange={value => sheet.handleInputChange(value)}
          onDifficultyChange={value => sheet.handleDifficultyChange(value)}
          onSheetSizeChange={value => sheet.handleSheetSizeChange(value)}
          onGridLinesChange={value => sheet.handleGridLinesChange(value)}
          onLetterCaseChange={value => sheet.handleLetterCaseChange(value)}
          onCopiesChange={value => sheet.handleCopiesChange(value)}
          onGenerate={() => sheet.handleGenerate()}
          onExample={() => sheet.handleInputChange(wordsearchExample)}
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
                    <WordsearchGrid
                      puzzle={puzzle}
                      showAnswers={sheet.view === 'answers'}
                      gridLines={sheet.gridLines}
                      letterCase={sheet.letterCase}
                    />
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
