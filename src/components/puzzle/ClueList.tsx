import type { CrosswordPlacement } from '@/types/puzzle'

interface ClueListProps {
  placements: CrosswordPlacement[]
  showAnswers: boolean
}

export function ClueList ({ placements, showAnswers }: ClueListProps) {
  const across = placements
    .filter(item => item.direction === 'across')
    .sort((a, b) => a.number - b.number)
  const down = placements
    .filter(item => item.direction === 'down')
    .sort((a, b) => a.number - b.number)

  return (
    <div className='mt-6 grid gap-5 sm:grid-cols-2'>
      <ClueColumn title='Across' items={across} showAnswers={showAnswers} />
      <ClueColumn title='Down' items={down} showAnswers={showAnswers} />
    </div>
  )
}

function ClueColumn ({
  title,
  items,
  showAnswers
}: {
  title: string
  items: CrosswordPlacement[]
  showAnswers: boolean
}) {
  return (
    <section>
      <h2 className='font-display text-xl text-ink'>{title}</h2>
      {items.length === 0
        ? <p className='mt-2 text-sm text-muted'>None this time.</p>
        : (
          <ol className='mt-2 space-y-1.5 text-sm leading-5'>
            {items.map(item => (
              <li key={`${item.direction}-${item.number}`}>
                <span className='font-bold'>{item.number}.</span>
                {' '}
                {item.clue}
                {showAnswers ? <span className='font-bold text-pine'> {item.answer}</span> : null}
              </li>
            ))}
          </ol>
          )}
    </section>
  )
}
