import { Outlet } from '@tanstack/react-router'
import { SiteHeader } from '@/components/layout/SiteHeader'

export function RootLayout () {
  return (
    <div className='flex min-h-screen flex-col'>
      <a
        href='#main'
        className='sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-20 focus:rounded-full focus:bg-card focus:px-3 focus:py-2 focus:text-ink'
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id='main' className='flex-1'>
        <Outlet />
      </main>
    </div>
  )
}
