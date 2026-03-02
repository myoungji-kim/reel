export type MessageRole = 'USER' | 'AI'

export interface ChatMessage {
  id: number
  role: MessageRole
  content: string
  createdAt: string
  failed?: boolean
}

export interface ChatSession {
  sessionId: number
  date: string
  developed: boolean
  messages: ChatMessage[]
}
