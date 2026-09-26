import type { ReactNode } from 'react'

interface ToolPageProps {
  eyebrow: string
  title: string
  lede: string
  editor: ReactNode
  preview: ReactNode
}

export function ToolPage ({ eyebrow, title, lede, editor, preview }: ToolPageProps) {
  return (
    <div className='mx-auto max-w-6xl px-4 py-8 sm:py-10'>
      <p className='text-sm font-bold tracking-wide text-pine uppercase'>{eyebrow}</p>
      <h1 className='mt-1 font-display text-4xl text-ink sm:text-5xl'>{title}</h1>
      <p className='mt-3 max-w-2xl text-lg leading-7 text-muted'>{lede}</p>
      <div className='mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]'>
        {editor}
        {preview}
      </div>
    </div>
  )
}
