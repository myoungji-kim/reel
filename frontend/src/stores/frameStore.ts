import { create } from 'zustand'
import type { DevelopPreview, Frame, Photo } from '../types/frame'

interface FrameStore {
  frames: Frame[]
  preview: DevelopPreview | null
  isDeveloping: boolean
  setFrames: (frames: Frame[]) => void
  addFrame: (frame: Frame) => void
  updateFrame: (id: number, title: string, content: string, mood: string) => void
  updateFramePhotos: (id: number, photos: Photo[]) => void
  removeFrame: (id: number) => void
  restoreFrame: (frame: Frame) => void
  toggleBookmarkFrame: (id: number, isBookmarked: boolean) => void
  setPreview: (preview: DevelopPreview | null) => void
  setIsDeveloping: (v: boolean) => void
  reset: () => void
}

export const useFrameStore = create<FrameStore>((set) => ({
  frames: [],
  preview: null,
  isDeveloping: false,
  setFrames: (frames) => set({ frames }),
  addFrame: (frame) => set((s) => ({ frames: [frame, ...s.frames] })),
  updateFrame: (id, title, content, mood) =>
    set((s) => ({
      frames: s.frames.map((f) => (f.id === id ? { ...f, title, content, mood } : f)),
    })),
  updateFramePhotos: (id, photos) =>
    set((s) => ({
      frames: s.frames.map((f) => (f.id === id ? { ...f, photos } : f)),
    })),
  removeFrame: (id) =>
    set((s) => ({ frames: s.frames.filter((f) => f.id !== id) })),
  restoreFrame: (frame) =>
    set((s) => {
      const frames = [...s.frames, frame].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      return { frames }
    }),
  toggleBookmarkFrame: (id, isBookmarked) =>
    set((s) => ({
      frames: s.frames.map((f) => (f.id === id ? { ...f, isBookmarked } : f)),
    })),
  setPreview: (preview) => set({ preview }),
  setIsDeveloping: (isDeveloping) => set({ isDeveloping }),
  reset: () => set({ frames: [], preview: null, isDeveloping: false }),
}))
