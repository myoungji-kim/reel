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
  setPreview: (preview) => set({ preview }),
  setIsDeveloping: (isDeveloping) => set({ isDeveloping }),
  reset: () => set({ frames: [], preview: null, isDeveloping: false }),
}))
