export type NoticeTone = 'info' | 'warning'

export type SheetView = 'puzzle' | 'answers'

export type CrosswordWordList = 'show' | 'hide'

export type CrosswordPageBorder = 'show' | 'hide'

export interface CrosswordEntry {
  answer: string
  clue: string
}

export type CrosswordDirection = 'across' | 'down'

export interface CrosswordPlacement {
  answer: string
  clue: string
  row: number
  col: number
  direction: CrosswordDirection
  number: number
}

export interface CrosswordCell {
  letter: string | null
  number: number | null
}

export interface CrosswordPuzzle {
  rows: number
  cols: number
  grid: CrosswordCell[][]
  placements: CrosswordPlacement[]
  unplaced: CrosswordEntry[]
}

export type WordsearchDifficulty = 'easy' | 'medium' | 'hard'

export type WordsearchSize = 'small' | 'medium' | 'large'

export type WordsearchGridLines = 'show' | 'hide'

export type WordsearchLetterCase = 'upper' | 'lower'

export interface WordsearchPlacement {
  word: string
  row: number
  col: number
  deltaRow: number
  deltaCol: number
}

export interface WordsearchCell {
  letter: string
  wordIndexes: number[]
}

export interface WordsearchPuzzle {
  size: number
  grid: WordsearchCell[][]
  placements: WordsearchPlacement[]
  unplaced: string[]
  unsuitable: string[]
}
