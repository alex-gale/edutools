export const wordColors = [
  { hex: '#f6c7b8', r: 0.965, g: 0.78, b: 0.722 },
  { hex: '#f6e2a8', r: 0.965, g: 0.886, b: 0.659 },
  { hex: '#b7e4cb', r: 0.718, g: 0.894, b: 0.796 },
  { hex: '#c9d6f5', r: 0.788, g: 0.839, b: 0.961 },
  { hex: '#e4c8f3', r: 0.894, g: 0.784, b: 0.953 },
  { hex: '#f8d0dc', r: 0.973, g: 0.816, b: 0.863 }
]

export function wordHex (index: number) {
  return wordColors[index % wordColors.length]?.hex ?? '#f6c7b8'
}
