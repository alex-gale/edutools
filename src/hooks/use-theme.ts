import { useEffect, useState } from 'react'

const storageKey = 'edutools-theme'

type Theme = 'light' | 'dark'

function storedTheme () {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    return null
  }
  return null
}

function preferredTheme (): Theme {
  const stored = storedTheme()
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme () {
  const [theme, setTheme] = useState<Theme>(preferredTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function handleToggle () {
    setTheme(current => {
      const next = current === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(storageKey, next)
      } catch {
        return next
      }
      return next
    })
  }

  return { theme, handleToggle }
}
