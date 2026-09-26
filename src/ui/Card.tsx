import type { ReactNode } from 'react'
import { classes } from '@/utils/classes'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card ({ children, className }: CardProps) {
  return (
    <div className={classes(
      'rounded-3xl border border-line bg-card p-5 shadow-[0_18px_40px_-28px_rgba(28,40,34,0.55)]',
      className
    )}
    >
      {children}
    </div>
  )
}
