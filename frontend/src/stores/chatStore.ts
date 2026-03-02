import { create } from 'zustand'
import type { ChatMessage } from '../types/chat'

interface ChatStore {
  sessionId: number | null
  messages: ChatMessage[]
  userMsgCount: number
  isTyping: boolean
  developed: boolean
  newMsgSinceDevelop: number

  setSession: (sessionId: number, messages: ChatMessage[], developed: boolean) => void
  addMessage: (message: ChatMessage) => void
  markFailed: (id: number) => void
  clearFailed: (id: number) => void
  setTyping: (typing: boolean) => void
  incrementCount: () => void
  incrementNewMsgSinceDevelop: () => void
  resetNewMsgSinceDevelop: () => void
  reset: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  sessionId: null,
  messages: [],
  userMsgCount: 0,
  isTyping: false,
  developed: false,
  newMsgSinceDevelop: 0,

  setSession: (sessionId, messages, developed) =>
    set({
      sessionId,
      messages,
      developed,
      userMsgCount: messages.filter((m) => m.role === 'USER').length,
      newMsgSinceDevelop: 0,
    }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  markFailed: (id) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, failed: true } : m)),
    })),

  clearFailed: (id) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, failed: false } : m)),
    })),

  setTyping: (typing) => set({ isTyping: typing }),

  incrementCount: () => set((state) => ({ userMsgCount: state.userMsgCount + 1 })),

  incrementNewMsgSinceDevelop: () =>
    set((state) => ({ newMsgSinceDevelop: state.newMsgSinceDevelop + 1 })),

  resetNewMsgSinceDevelop: () => set({ newMsgSinceDevelop: 0 }),

  reset: () =>
    set({
      sessionId: null,
      messages: [],
      userMsgCount: 0,
      isTyping: false,
      developed: false,
      newMsgSinceDevelop: 0,
    }),
}))
