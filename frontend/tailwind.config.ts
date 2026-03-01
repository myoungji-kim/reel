import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-mid': 'var(--bg-mid)',
        'bg-card': 'var(--bg-card)',
        border: 'var(--border)',
        'border-light': 'var(--border-light)',
        amber: 'var(--amber)',
        'amber-light': 'var(--amber-light)',
        'amber-pale': 'var(--amber-pale)',
        cream: 'var(--cream)',
        'cream-dim': 'var(--cream-dim)',
        'cream-muted': 'var(--cream-muted)',
        'fade-green': 'var(--fade-green)',
      },
      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
        vt323: ['VT323', 'monospace'],
        sans: ['Noto Sans KR', 'sans-serif'],
        serif: ['Noto Serif KR', 'serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
