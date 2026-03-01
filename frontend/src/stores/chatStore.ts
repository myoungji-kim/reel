import { create } from 'zustand'
import type { ChatMessage } from '../types/chat'

interface ChatStore {
  sessionId: number | null
  messages: ChatMessage[]
  userMsgCount: number
  isTyping: boolean
  developed: boolean

  setSession: (sessionId: number, messages: ChatMessage[], developed: boolean) => void
  addMessage: (message: ChatMessage) => void
  setTyping: (typing: boolean) => void
  incrementCount: () => void
  reset: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  sessionId: null,
  messages: [],
  userMsgCount: 0,
  isTyping: false,
  developed: false,

  setSession: (sessionId, messages, developed) =>
    set({
      sessionId,
      messages,
      developed,
      userMsgCount: messages.filter((m) => m.role === 'USER').length,
    }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setTyping: (typing) => set({ isTyping: typing }),

  incrementCount: () => set((state) => ({ userMsgCount: state.userMsgCount + 1 })),

  reset: () =>
    set({ sessionId: null, messages: [], userMsgCount: 0, isTyping: false, developed: false }),
}))
