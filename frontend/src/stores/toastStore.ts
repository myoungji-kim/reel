import { create } from 'zustand'

export type ToastType = 'success' | 'error'

interface ToastStore {
  message: string
  type: ToastType
  visible: boolean
  undoAction: (() => void) | null
  show: (message: string, type: ToastType, undoAction?: (() => void) | null) => void
  hide: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  message: '',
  type: 'success',
  visible: false,
  undoAction: null,
  show: (message, type, undoAction = null) => set({ message, type, visible: true, undoAction }),
  hide: () => set({ visible: false, undoAction: null }),
}))
