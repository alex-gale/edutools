import neostandard from 'neostandard'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  ...neostandard({
    ts: true,
    env: ['browser'],
    ignores: ['dist']
  }),
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error'
    }
  }
]
