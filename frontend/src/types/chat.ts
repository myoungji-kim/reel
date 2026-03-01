export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface TodaySessionResponse {
  sessionId: number
  date: string
  messages: ChatMessage[]
}

export type ChatMessageResponse = ChatMessage
