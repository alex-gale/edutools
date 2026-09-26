import type { CrosswordPuzzle } from '@/types/puzzle'

interface CrosswordGridProps {
  puzzle: CrosswordPuzzle
  showAnswers: boolean
  bordered: boolean
}

export function CrosswordGrid ({ puzzle, showAnswers, bordered }: CrosswordGridProps) {
  return (
    <div
      className={bordered
        ? 'mx-auto grid w-full max-w-xl gap-px border-2 border-ink bg-line'
        : 'mx-auto grid w-full max-w-xl gap-px bg-line'}
      style={{ gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))` }}
      aria-label={showAnswers ? 'Crossword answer grid' : 'Crossword grid'}
    >
      {puzzle.grid.flatMap((row, rowIndex) => row.map((cell, colIndex) => (
        <div
          key={`${rowIndex}-${colIndex}`}
          className={cell.letter
            ? 'relative aspect-square bg-card'
            : 'aspect-square bg-block'}
        >
          {cell.number
            ? <span className='absolute top-0.5 left-0.5 text-[10px] leading-none font-bold'>{cell.number}</span>
            : null}
          {showAnswers && cell.letter
            ? (
              <span className='flex h-full items-center justify-center text-sm font-bold sm:text-base'>
                {cell.letter}
              </span>
              )
            : null}
        </div>
      )))}
    </div>
  )
}
