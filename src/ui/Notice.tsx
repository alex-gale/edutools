import type { ReactNode } from 'react'
import { classes } from '@/utils/classes'
import type { NoticeTone } from '@/types/puzzle'

interface NoticeProps {
  tone?: NoticeTone
  children: ReactNode
}

const tones: Record<NoticeTone, string> = {
  info: 'border-[color-mix(in_srgb,var(--color-pine)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-pine)_14%,transparent)] text-pine',
  warning: 'border-[color-mix(in_srgb,var(--color-clay)_45%,transparent)] bg-[color-mix(in_srgb,var(--color-clay)_16%,transparent)] text-clay'
}

export function Notice ({ tone = 'info', children }: NoticeProps) {
  return (
    <p className={classes('rounded-2xl border px-3 py-2 text-sm leading-5', tones[tone])}>
      {children}
    </p>
  )
}
