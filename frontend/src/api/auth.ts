import axiosInstance from './axiosInstance'

// TODO: Phase 3
export const refreshToken = () =>
  axiosInstance.post('/api/auth/refresh')

export const logout = () =>
  axiosInstance.post('/api/auth/logout')
