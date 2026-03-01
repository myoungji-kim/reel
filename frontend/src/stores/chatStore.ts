import { create } from 'zustand'

interface ChatStore {
  // TODO: Phase 4
  // messages: Message[]
  // isTyping: boolean
  // userMessageCount: number
}

export const useChatStore = create<ChatStore>(() => ({}))
