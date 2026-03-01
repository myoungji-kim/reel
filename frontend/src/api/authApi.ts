import axiosInstance from './axiosInstance'
import type { TokenResponse } from '../types/auth'

export const refreshToken = () =>
  axiosInstance.post<{ data: TokenResponse }>('/api/auth/refresh')

export const logout = () =>
  axiosInstance.post('/api/auth/logout')
