export interface User {
  id: number
  provider: 'google' | 'kakao'
  email: string | null
  nickname: string | null
}
