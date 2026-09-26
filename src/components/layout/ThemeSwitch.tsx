import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'

export function ThemeSwitch () {
  const { theme, handleToggle } = useTheme()
  const dark = theme === 'dark'
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type='button'
      aria-pressed={dark}
      aria-label={label}
      title={label}
      onClick={() => handleToggle()}
      className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-card text-ink hover:border-pine'
    >
      {dark
        ? <Sun size={18} aria-hidden='true' />
        : <Moon size={18} aria-hidden='true' />}
    </button>
  )
}
