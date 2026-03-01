import { create } from 'zustand'

interface ToastStore {
  message: string
  visible: boolean
  show: (message: string) => void
  hide: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  message: '',
  visible: false,
  show: (message) => set({ message, visible: true }),
  hide: () => set({ visible: false }),
}))
