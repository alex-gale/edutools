import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  hint?: ReactNode
  children: ReactNode
}

export function Field ({ label, hint, children }: FieldProps) {
  return (
    <label className='block'>
      <span className='text-sm font-bold text-ink'>{label}</span>
      {hint ? <span className='mt-1 block text-sm leading-5 text-muted'>{hint}</span> : null}
      <div className='mt-2'>{children}</div>
    </label>
  )
}
