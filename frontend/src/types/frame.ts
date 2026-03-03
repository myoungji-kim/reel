export interface Photo {
  id: number
  url: string
  orderNum: number
}

export interface Frame {
  id: number
  frameNum: number
  title: string
  content: string
  mood: string | null
  frameType: 'DEVELOPED' | 'QUICK'
  date: string
  createdAt: string
  photos: Photo[]
  isArchived: boolean
}

export interface DevelopPreview {
  frameId: number
  title: string
  content: string
}

export interface OnThisDayItem {
  frameId: number
  frameNum: number
  title: string
  mood: string | null
  frameDate: string
  yearsAgo: number
}

export interface RollStats {
  currentRollNum: number
  currentRollProgress: number
  rollSize: number
  totalFrames: number
}
