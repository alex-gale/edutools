import type { ChangeEvent } from 'react'
import { Field } from '@/ui/Field'

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
}

export function TextField ({ label, value, onChange, hint }: TextFieldProps) {
  function handleChange (event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value)
  }

  return (
    <Field label={label} hint={hint}>
      <input
        value={value}
        onChange={handleChange}
        className='w-full rounded-2xl border border-line bg-card px-3 py-2 text-ink outline-none focus-visible:border-pine focus-visible:ring-2 focus-visible:ring-pine/30'
      />
    </Field>
  )
}
