interface SegmentOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  label: string
  value: T
  options: Array<SegmentOption<T>>
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string> ({
  label,
  value,
  options,
  onChange
}: SegmentedControlProps<T>) {
  return (
    <div role='group' aria-label={label} className='inline-flex rounded-full bg-paper p-1'>
      {options.map(option => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type='button'
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={selected
              ? 'rounded-full bg-card px-3 py-1.5 text-sm font-bold text-pine shadow-sm'
              : 'rounded-full px-3 py-1.5 text-sm font-bold text-muted'}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
