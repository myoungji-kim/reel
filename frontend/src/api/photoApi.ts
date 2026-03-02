import axios from './axiosInstance'
import type { Photo } from '../types/frame'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}

export const uploadPhotos = (frameId: number, files: File[]) => {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  return axios.post<ApiResponse<Photo[]>>(`/api/frames/${frameId}/photos`, form)
}

export const deletePhoto = (frameId: number, photoId: number) =>
  axios.delete(`/api/frames/${frameId}/photos/${photoId}`)
