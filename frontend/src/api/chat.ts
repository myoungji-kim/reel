import axiosInstance from './axiosInstance'
import type { TodaySessionResponse, ChatMessageResponse } from '../types/chat'

// TODO: Phase 4
export const getTodaySession = () =>
  axiosInstance.get<TodaySessionResponse>('/api/chat/today')

export const sendMessage = (content: string) =>
  axiosInstance.post<ChatMessageResponse>('/api/chat/messages', { content })
