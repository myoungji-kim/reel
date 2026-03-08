import type React from 'react'

export const MOOD_OPTIONS = [
  { value: '기쁨',   emoji: '😊' },
  { value: '설렘',   emoji: '✨' },
  { value: '평온',   emoji: '🌿' },
  { value: '감사',   emoji: '🤍' },
  { value: '슬픔',   emoji: '🌧' },
  { value: '외로움', emoji: '🌙' },
  { value: '피곤',   emoji: '😴' },
  { value: '무기력', emoji: '🫥' },
] as const

export function getMoodTintColor(mood: string | null | undefined): string {
  switch (mood) {
    case '기쁨': case '설렘':   return 'rgba(251,191,36,0.14)'
    case '슬픔': case '외로움': return 'rgba(96,125,139,0.20)'
    case '평온': case '감사':   return 'rgba(134,171,141,0.14)'
    case '피곤': case '무기력': return 'rgba(80,60,40,0.24)'
    default:                    return 'rgba(0,0,0,0)'
  }
}

export function getMoodDotColor(mood: string | null | undefined): string {
  switch (mood) {
    case '기쁨': case '설렘':   return 'var(--amber)'
    case '슬픔': case '외로움': return '#607d8b'
    case '평온': case '감사':   return 'var(--fade-green)'
    case '피곤': case '무기력': return 'var(--cream-muted)'
    default:                   return 'var(--border-light)'
  }
}

export function getMoodToneStyle(mood: string | null | undefined): React.CSSProperties {
  if (!mood) return {}

  switch (mood) {
    case '기쁨':
    case '설렘':
      return {
        '--film-tint': 'rgba(251,191,36,0.12)',
        '--film-grain-opacity': '0.4',
      } as React.CSSProperties

    case '슬픔':
    case '외로움':
      return {
        '--film-tint': 'rgba(96,125,139,0.18)',
        '--film-grain-opacity': '0.55',
      } as React.CSSProperties

    case '평온':
    case '감사':
      return {
        '--film-tint': 'rgba(134,171,141,0.12)',
        '--film-grain-opacity': '0.35',
      } as React.CSSProperties

    case '피곤':
    case '무기력':
      return {
        '--film-tint': 'rgba(80,60,40,0.22)',
        '--film-grain-opacity': '0.65',
      } as React.CSSProperties

    default:
      return {}
  }
}
