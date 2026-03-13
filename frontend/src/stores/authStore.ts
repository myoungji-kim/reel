import { create } from 'zustand'
import type { User } from '../types/auth'

const TOKEN_KEY = 'reel_at'
const TOKEN_EXPIRY_KEY = 'reel_at_exp'
// 서버 Access Token 만료(30분)보다 1분 일찍 만료 처리
const TOKEN_LIFETIME_MS = 29 * 60 * 1000

function loadTokenFromStorage(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
    if (token && expiry && Date.now() < Number(expiry)) return token
  } catch {
    // localStorage 접근 불가 환경 무시
  }
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
  return null
}

interface AuthStore {
  accessToken: string | null
  user: User | null
  setAuth: (token: string, user?: User) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: loadTokenFromStorage(),
  user: null,

  setAuth: (token, user) => {
    try {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + TOKEN_LIFETIME_MS))
    } catch {
      // localStorage 접근 불가 환경 무시
    }
    set({ accessToken: token, user: user ?? get().user })
  },

  clearAuth: () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(TOKEN_EXPIRY_KEY)
    } catch {
      // localStorage 접근 불가 환경 무시
    }
    set({ accessToken: null, user: null })
  },

  isAuthenticated: () => get().accessToken !== null,
}))
