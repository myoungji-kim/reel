export interface DiaryResponse {
  id: number
  frameNum: number
  title: string
  content: string
  mood: string | null
  diaryDate: string
  createdAt: string
}

export interface DevelopPreviewResponse {
  title: string
  content: string
}

export interface SaveDiaryRequest {
  sessionId: number
  title: string
  content: string
  mood?: string
}
