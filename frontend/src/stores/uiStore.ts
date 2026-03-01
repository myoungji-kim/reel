import { create } from 'zustand'

type Tab = 'chat' | 'roll'

interface UIStore {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  isDevelopingOpen: boolean
  setDevelopingOpen: (open: boolean) => void
  isPreviewOpen: boolean
  setPreviewOpen: (open: boolean) => void
  isFrameDetailOpen: boolean
  setFrameDetailOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isDevelopingOpen: false,
  setDevelopingOpen: (open) => set({ isDevelopingOpen: open }),
  isPreviewOpen: false,
  setPreviewOpen: (open) => set({ isPreviewOpen: open }),
  isFrameDetailOpen: false,
  setFrameDetailOpen: (open) => set({ isFrameDetailOpen: open }),
}))
