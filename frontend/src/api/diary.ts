import axiosInstance from './axiosInstance'
import type { DiaryResponse, DevelopPreviewResponse, SaveDiaryRequest } from '../types/diary'

// TODO: Phase 5
export const developDiary = (sessionId: number) =>
  axiosInstance.post<DevelopPreviewResponse>('/api/diary/develop', { sessionId })

export const getDiaries = () =>
  axiosInstance.get<DiaryResponse[]>('/api/diary')

export const saveDiary = (data: SaveDiaryRequest) =>
  axiosInstance.post<DiaryResponse>('/api/diary', data)

export const getDiary = (id: number) =>
  axiosInstance.get<DiaryResponse>(`/api/diary/${id}`)
