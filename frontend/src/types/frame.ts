export interface Frame {
  id: number
  frameNum: number
  title: string
  content: string
  mood: string | null
  date: string
  createdAt: string
}

export interface DevelopPreview {
  frameId: number
  title: string
  content: string
}
