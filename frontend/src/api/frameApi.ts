import axios from './axiosInstance'
import type { DevelopPreview, Frame, OnThisDayItem, RollStats } from '../types/frame'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
}

export const developPreview = (sessionId: number) =>
  axios.post<ApiResponse<DevelopPreview>>(`/api/frames/develop/${sessionId}`)

export const saveFrame = (frameId: number, title: string, content: string, mood: string) =>
  axios.put<ApiResponse<Frame>>(`/api/frames/${frameId}`, { title, content, mood })

export const getFrames = (page = 0, size = 20) =>
  axios.get<ApiResponse<PageResponse<Frame>>>(`/api/frames`, { params: { page, size } })

export const getFrame = (frameId: number) =>
  axios.get<ApiResponse<Frame>>(`/api/frames/${frameId}`)

export const getOnThisDay = () =>
  axios.get<ApiResponse<OnThisDayItem[]>>('/api/frames/on-this-day').then(r => r.data.data)

export const getRollStats = () =>
  axios.get<ApiResponse<RollStats>>('/api/frames/roll-stats').then(r => r.data.data)
