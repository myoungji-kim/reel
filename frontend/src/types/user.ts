export interface User {
  id: number
  provider: 'google' | 'kakao'
  email: string | null
  nickname: string | null
}

export interface StreakInfo {
  streakCount: number
  lastFrameDate: string | null
  recordedToday: boolean
}
