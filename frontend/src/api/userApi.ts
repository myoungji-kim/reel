import axiosInstance from './axiosInstance'
import type { StreakInfo } from '../types/user'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}

export const getStreak = () =>
  axiosInstance.get<ApiResponse<StreakInfo>>('/api/user/streak').then(r => r.data.data)
