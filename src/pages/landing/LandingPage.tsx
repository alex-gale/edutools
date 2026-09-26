import { Grid3x3, Puzzle } from 'lucide-react'
import { HeroGrid } from '@/pages/landing/HeroGrid'
import { ToolCard } from '@/pages/landing/ToolCard'

const steps = [
  {
    title: 'Paste',
    text: 'A word list, or a word followed by its clue.'
  },
  {
    title: 'Print',
    text: 'Download one A4 page. Open the PDF in Canva if you want to change the design.'
  },
  {
    title: 'Check',
    text: 'Read the answers on screen, or download an answer key.'
  }
]

export function LandingPage () {
  return (
    <div className='mx-auto max-w-6xl px-4 py-10 sm:py-14'>
      <div className='grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]'>
        <div>
          <h1 className='max-w-xl font-display text-5xl leading-tight text-ink sm:text-6xl'>
            Crossword and word search sheets
          </h1>
          <p className='mt-4 max-w-xl text-lg leading-7 text-muted'>
            Paste in some words and download one A4 page. You can print it, or open the PDF in Canva and change the design.
          </p>
        </div>
        <HeroGrid />
      </div>
      <div className='mt-12 grid gap-4 md:grid-cols-2'>
        <ToolCard
          to='/crossword'
          icon={<Puzzle size={22} aria-hidden='true' />}
          title='Crossword'
          description='Each line is a word, then its clue. The sheet has a numbered grid and the clues underneath.'
          detail='It works better when the words share some letters.'
        />
        <ToolCard
          to='/wordsearch'
          icon={<Grid3x3 size={22} aria-hidden='true' />}
          title='Word search'
          description='Paste a list of words. The sheet has a grid, the words to find, and a highlighted answer key.'
          detail='Words can go in any direction.'
        />
      </div>
      <ol className='mt-10 grid gap-4 sm:grid-cols-3'>
        {steps.map((step, index) => (
          <li key={step.title} className='rounded-3xl border border-line bg-card px-4 py-4'>
            <p className='font-display text-2xl text-marigold'>{index + 1}</p>
            <h2 className='mt-1 font-bold text-ink'>{step.title}</h2>
            <p className='mt-1 text-sm leading-5 text-muted'>{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
