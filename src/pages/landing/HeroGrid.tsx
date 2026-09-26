const rows = [
  '....E..S',
  'M.PLANET',
  'O...R..A',
  'ORBIT..R',
  'N...H...'
]

export function HeroGrid () {
  return (
    <div
      aria-hidden='true'
      className='mx-auto grid w-full max-w-sm gap-1 rounded-3xl border border-line bg-card p-4 shadow-[0_18px_40px_-28px_rgba(28,40,34,0.55)]'
      style={{ gridTemplateColumns: `repeat(${rows[0]?.length ?? 1}, minmax(0, 1fr))` }}
    >
      {rows.flatMap((row, rowIndex) => [...row].map((letter, colIndex) => (
        <span
          key={`${rowIndex}-${colIndex}`}
          className={letter === '.'
            ? 'aspect-square rounded-md bg-paper'
            : 'flex aspect-square items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--color-pine)_16%,transparent)] text-xs font-bold text-pine'}
        >
          {letter === '.' ? '' : letter}
        </span>
      )))}
    </div>
  )
}
