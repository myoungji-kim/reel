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
    case '기쁨': case '설렘':   return 'var(--emotion-joy)'
    case '감사':                return 'var(--emotion-warm)'
    case '슬픔': case '외로움': return 'var(--emotion-sad)'
    case '평온':                return 'var(--emotion-calm)'
    case '피곤': case '무기력': return 'var(--emotion-tired)'
    default:                   return 'var(--border-default)'
  }
}

export function getMoodBarColor(mood: string | null | undefined): string {
  switch (mood) {
    case '기쁨': case '설렘':          return '#c8a96e'
    case '감사':                        return '#c4866a'
    case '피곤': case '무기력':        return '#9a9a8e'
    case '슬픔': case '외로움':        return '#7a8fa6'
    case '평온':                        return '#8aaa8a'
    default:                            return 'transparent'
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
