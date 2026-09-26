import type { ChangeEvent, ReactNode } from 'react'
import { Field } from '@/ui/Field'

interface TextAreaProps {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: ReactNode
  placeholder?: string
  rows?: number
}

export function TextArea ({
  label,
  value,
  onChange,
  hint,
  placeholder,
  rows = 12
}: TextAreaProps) {
  function handleChange (event: ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value)
  }

  return (
    <Field label={label} hint={hint}>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={handleChange}
        className='w-full resize-y rounded-2xl border border-line bg-card px-3 py-2 leading-6 text-ink outline-none focus-visible:border-pine focus-visible:ring-2 focus-visible:ring-pine/30'
      />
    </Field>
  )
}
