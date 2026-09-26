import type { CrosswordPlacement } from '@/types/puzzle'

interface CrosswordWordListProps {
  placements: CrosswordPlacement[]
}

export function CrosswordWordList ({ placements }: CrosswordWordListProps) {
  const words = [...placements.map(item => item.answer)].sort((a, b) => a.localeCompare(b))
  if (words.length === 0) return null

  return (
    <aside className='w-28 shrink-0'>
      <h2 className='font-display text-xl text-ink'>Words</h2>
      <ul className='mt-2 space-y-1 text-sm font-bold'>
        {words.map(word => <li key={word}>{word}</li>)}
      </ul>
    </aside>
  )
}
