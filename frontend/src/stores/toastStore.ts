import { create } from 'zustand'

export type ToastType = 'success' | 'error'

interface ToastStore {
  message: string
  type: ToastType
  visible: boolean
  show: (message: string, type: ToastType) => void
  hide: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  message: '',
  type: 'success',
  visible: false,
  show: (message, type) => set({ message, type, visible: true }),
  hide: () => set({ visible: false }),
}))
