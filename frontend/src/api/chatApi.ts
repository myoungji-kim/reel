import axiosInstance from './axiosInstance'
import type { ChatSession, ChatMessage } from '../types/chat'

export const getTodaySession = () =>
  axiosInstance.get<{ data: ChatSession }>('/api/chat/session/today')

export const getMessages = (sessionId: number) =>
  axiosInstance.get<{ data: ChatMessage[] }>(`/api/chat/session/${sessionId}/messages`)

export const sendMessage = (sessionId: number, content: string) =>
  axiosInstance.post<{ data: ChatMessage }>(`/api/chat/session/${sessionId}/message`, { content })
