import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/ui/Card'

interface ToolCardProps {
  to: '/crossword' | '/wordsearch'
  icon: ReactNode
  title: string
  description: string
  detail: string
}

export function ToolCard ({ to, icon, title, description, detail }: ToolCardProps) {
  return (
    <Link to={to} className='group block h-full rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pine'>
      <Card className='h-full transition duration-200 group-hover:-translate-y-0.5'>
        <span className='inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-pine)_14%,transparent)] text-pine'>
          {icon}
        </span>
        <h2 className='mt-4 font-display text-3xl text-ink'>{title}</h2>
        <p className='mt-2 text-base leading-6 text-muted'>{description}</p>
        <p className='mt-4 text-sm font-bold text-ink'>{detail}</p>
        <span className='mt-5 inline-flex items-center gap-1 font-bold text-pine'>
          Open
          <ArrowRight size={16} aria-hidden='true' />
        </span>
      </Card>
    </Link>
  )
}
