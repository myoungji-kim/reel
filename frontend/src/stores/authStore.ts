import { create } from 'zustand'
import type { User } from '../types/auth'

interface AuthStore {
  accessToken: string | null
  user: User | null
  setAuth: (token: string, user?: User) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  user: null,

  setAuth: (token, user) =>
    set({ accessToken: token, user: user ?? get().user }),

  clearAuth: () => set({ accessToken: null, user: null }),

  isAuthenticated: () => get().accessToken !== null,
}))
