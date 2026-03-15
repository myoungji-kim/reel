import axiosInstance from './axiosInstance'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}

export interface HomeSummaryResponse {
  today: {
    date: string
    dayOfWeek: string
    hasRecord: boolean
    mood: string | null
  }
  streak: {
    count: number
    recentDays: Array<{
      date: string
      mood: string | null
    }>
  }
  monthStats: {
    year: number
    month: number
    frameCount: number
  }
  recentFrames: Array<{
    id: number
    title: string
    date: string
    mood: string | null
    frameNum: number
  }>
}

export const getHomeSummary = () =>
  axiosInstance.get<ApiResponse<HomeSummaryResponse>>('/api/home/summary').then(r => r.data.data)
