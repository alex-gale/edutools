import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { CrosswordPage } from '@/pages/crossword/CrosswordPage'
import { LandingPage } from '@/pages/landing/LandingPage'
import { WordsearchPage } from '@/pages/wordsearch/WordsearchPage'

const rootRoute = createRootRoute({
  component: RootLayout
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage
})

const crosswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crossword',
  component: CrosswordPage
})

const wordsearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wordsearch',
  component: WordsearchPage
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  crosswordRoute,
  wordsearchRoute
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
