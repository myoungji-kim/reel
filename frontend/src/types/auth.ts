export interface User {
  id: number
  email: string | null
  nickname: string | null
  provider: 'GOOGLE' | 'KAKAO'
}

export interface TokenResponse {
  accessToken: string
}
