export type MessageRole = 'USER' | 'AI'

export interface TodaySessionResponse {
  sessionId: number
  date: string
  developed: boolean
  messages: ChatMessage[]
}

export interface ChatMessageResponse {
  id: number
  role: MessageRole
  content: string
  createdAt: string
}

export interface ChatMessage {
  id: number
  role: MessageRole
  content: string
  createdAt: string
  failed?: boolean
  suggestText?: string
}

export interface ChatSession {
  sessionId: number
  date: string
  developed: boolean
  messages: ChatMessage[]
}
