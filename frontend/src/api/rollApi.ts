import axios from './axiosInstance'
import type { RollInfo } from '../types/frame'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}

export const getRolls = () =>
  axios.get<ApiResponse<RollInfo[]>>('/api/rolls').then(r => r.data.data)

export const updateRollTitle = (rollNum: number, title: string) =>
  axios.patch<ApiResponse<RollInfo>>(`/api/rolls/${rollNum}/title`, { title }).then(r => r.data.data)

export const suggestRollTitle = (rollNum: number) =>
  axios.post<ApiResponse<{ suggested: string }>>(`/api/rolls/${rollNum}/title-suggest`).then(r => r.data.data)
