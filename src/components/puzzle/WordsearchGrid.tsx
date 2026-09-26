import type { WordsearchLetterCase, WordsearchGridLines, WordsearchPuzzle } from '@/types/puzzle'
import { wordHex } from '@/utils/word-colors'

interface WordsearchGridProps {
  puzzle: WordsearchPuzzle
  showAnswers: boolean
  gridLines: WordsearchGridLines
  letterCase: WordsearchLetterCase
}

export function WordsearchGrid ({ puzzle, showAnswers, gridLines, letterCase }: WordsearchGridProps) {
  const words = [...puzzle.placements.map(item => item.word)].sort()
  const showLines = gridLines === 'show'

  return (
    <div>
      <div
        className={showLines ? 'mx-auto grid w-full max-w-xl gap-px bg-line' : 'mx-auto grid w-full max-w-xl'}
        style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}
        aria-label={showAnswers ? 'Word search answer grid' : 'Word search grid'}
      >
        {puzzle.grid.flatMap((row, rowIndex) => row.map((cell, colIndex) => {
          const highlighted = showAnswers && cell.wordIndexes.length > 0
          const color = highlighted ? wordHex(cell.wordIndexes[0] ?? 0) : undefined
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={highlighted
                ? 'flex aspect-square items-center justify-center text-[10px] font-bold text-[#1c2822] sm:text-xs'
                : 'flex aspect-square items-center justify-center text-[10px] font-bold text-ink sm:text-xs'}
              style={{ backgroundColor: color ?? (showLines ? 'var(--color-card)' : 'transparent') }}
            >
              {cased(cell.letter, letterCase)}
            </div>
          )
        }))}
      </div>
      <h2 className='mt-6 font-display text-xl text-ink'>Find these words</h2>
      <ul className='mt-2 flex flex-wrap gap-2'>
        {words.map(word => {
          const index = puzzle.placements.findIndex(item => item.word === word)
          return (
            <li
              key={word}
              className={showAnswers
                ? 'rounded-full px-2.5 py-1 text-sm font-bold text-[#1c2822]'
                : 'rounded-full bg-paper px-2.5 py-1 text-sm font-bold'}
              style={showAnswers ? { backgroundColor: wordHex(index) } : undefined}
            >
              {cased(word, letterCase)}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function cased (value: string, letterCase: WordsearchLetterCase) {
  return letterCase === 'lower' ? value.toLowerCase() : value.toUpperCase()
}
