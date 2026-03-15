import { create } from 'zustand'

type Tab = 'home' | 'roll' | 'favorites'
type HomeView = 'bento' | 'chat'

interface UIStore {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  homeView: HomeView
  setHomeView: (view: HomeView) => void
  isDevelopingOpen: boolean
  setDevelopingOpen: (open: boolean) => void
  isPreviewOpen: boolean
  setPreviewOpen: (open: boolean) => void
  isFrameDetailOpen: boolean
  setFrameDetailOpen: (open: boolean) => void
  isQuickNoteOpen: boolean
  setQuickNoteOpen: (open: boolean) => void
  isArchivedOpen: boolean
  setArchivedOpen: (open: boolean) => void
  isRollTitleOpen: boolean
  setRollTitleOpen: (open: boolean) => void
  pendingRollNum: number | null
  setPendingRollNum: (num: number | null) => void
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
  homeView: 'bento',
  setHomeView: (view) => set({ homeView: view }),
  isDevelopingOpen: false,
  setDevelopingOpen: (open) => set({ isDevelopingOpen: open }),
  isPreviewOpen: false,
  setPreviewOpen: (open) => set({ isPreviewOpen: open }),
  isFrameDetailOpen: false,
  setFrameDetailOpen: (open) => set({ isFrameDetailOpen: open }),
  isQuickNoteOpen: false,
  setQuickNoteOpen: (open) => set({ isQuickNoteOpen: open }),
  isArchivedOpen: false,
  setArchivedOpen: (open) => set({ isArchivedOpen: open }),
  isRollTitleOpen: false,
  setRollTitleOpen: (open) => set({ isRollTitleOpen: open }),
  pendingRollNum: null,
  setPendingRollNum: (num) => set({ pendingRollNum: num }),
}))
