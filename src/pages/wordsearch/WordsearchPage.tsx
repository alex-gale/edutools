import { ToolPage } from '@/components/layout/ToolPage'
import { PreviewPanel } from '@/components/puzzle/PreviewPanel'
import { WordsearchGrid } from '@/components/puzzle/WordsearchGrid'
import { WordsearchForm } from '@/components/wordsearch/WordsearchForm'
import { useWordsearch } from '@/hooks/use-wordsearch'
import { wordsearchExample } from '@/pages/wordsearch/example'

export function WordsearchPage () {
  const sheet = useWordsearch()

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
          message={sheet.message}
          messageTone={sheet.messageTone}
          onTitleChange={value => sheet.handleTitleChange(value)}
          onInputChange={value => sheet.handleInputChange(value)}
          onDifficultyChange={value => sheet.handleDifficultyChange(value)}
          onSheetSizeChange={value => sheet.handleSheetSizeChange(value)}
          onGridLinesChange={value => sheet.handleGridLinesChange(value)}
          onLetterCaseChange={value => sheet.handleLetterCaseChange(value)}
          onGenerate={() => sheet.handleGenerate()}
          onExample={() => sheet.handleInputChange(wordsearchExample)}
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
              <WordsearchGrid
                puzzle={sheet.puzzle}
                showAnswers={sheet.view === 'answers'}
                gridLines={sheet.gridLines}
                letterCase={sheet.letterCase}
              />
              )
            : null}
        </PreviewPanel>
      )}
    />
  )
}
