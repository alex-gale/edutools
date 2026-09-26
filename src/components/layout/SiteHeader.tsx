import { Link } from '@tanstack/react-router'
import { ThemeSwitch } from '@/components/layout/ThemeSwitch'

const links = [
  { to: '/crossword', label: 'Crossword' },
  { to: '/wordsearch', label: 'Word search' }
] as const

export function SiteHeader () {
  return (
    <header className='sticky top-0 z-10 border-b border-line bg-paper'>
      <div className='mx-auto flex max-w-6xl items-center gap-4 px-4 py-3'>
        <Link to='/' className='mr-auto inline-flex items-center gap-2 font-display text-xl text-ink'>
          <img src='/favicon.svg' alt='' width={36} height={36} className='h-9 w-9' />
          Quire
        </Link>
        <nav aria-label='Tools' className='flex items-center gap-1'>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className='rounded-full px-3 py-1.5 text-sm font-bold text-muted hover:text-ink'
              activeProps={{
                className: 'rounded-full bg-card px-3 py-1.5 text-sm font-bold text-pine shadow-sm hover:text-pine'
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <ThemeSwitch />
      </div>
    </header>
  )
}
