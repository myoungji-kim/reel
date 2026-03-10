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
  frameType: 'DEVELOPED' | 'QUICK' | 'RETROSPECTIVE'
  date: string
  createdAt: string
  photos: Photo[]
  isArchived: boolean
  isBookmarked: boolean
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

export interface RollInfo {
  rollNum: number
  title: string | null
}

export interface RetrospectiveAvailable {
  available: boolean
  frameCount: number
  alreadyGenerated: boolean
}

export interface CalendarFrame {
  frameId: number
  date: string   // "YYYY-MM-DD"
  mood: string | null
  title: string
  contentPreview: string | null
  thumbnailUrl: string | null
  frameType: FrameType
}
