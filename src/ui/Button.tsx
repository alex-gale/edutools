import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { classes } from '@/utils/classes'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-pine text-white hover:bg-pine-dark dark:bg-pine-dark dark:hover:bg-[#2c8a58]',
  secondary: 'border border-line bg-card text-ink hover:border-pine',
  ghost: 'text-pine hover:bg-card'
}

export function Button ({
  variant = 'primary',
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
