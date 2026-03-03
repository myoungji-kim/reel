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

export const searchFrames = (q: string, page = 0) =>
  axios.get<ApiResponse<PageResponse<Frame>>>('/api/frames/search', { params: { q, page, size: 20 } })
    .then(r => r.data.data.content)

export const createQuickFrame = (data: { title: string; content: string; date: string }) =>
  axios.post<ApiResponse<{ frameId: number; frameNum: number; title: string; frameType: string }>>('/api/frames/quick', data)
    .then(r => r.data.data)

export const archiveFrame = (frameId: number) =>
  axios.patch(`/api/frames/${frameId}/archive`).then(r => r.data)

export const unarchiveFrame = (frameId: number) =>
  axios.patch(`/api/frames/${frameId}/unarchive`).then(r => r.data)

export const getArchivedFrames = () =>
  axios.get<ApiResponse<Frame[]>>('/api/frames/archived').then(r => r.data.data)
