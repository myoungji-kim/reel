import { useCallback, useEffect } from 'react'
import { getTodaySession, sendMessage as sendMessageApi } from '../api/chatApi'
import { useChatStore } from '../stores/chatStore'
import { useToast } from './useToast'
import type { ChatMessage } from '../types/chat'

export function useChat() {
  const store = useChatStore()
  const { showToast } = useToast()

  // 진입 시 오늘 세션 초기화
  useEffect(() => {
    if (store.sessionId !== null) return

    getTodaySession()
      .then(({ data }) => {
        store.setSession(data.data.sessionId, data.data.messages, data.data.developed)
      })
      .catch(() => showToast('세션을 불러오지 못했어요.'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    async (content: string) => {
      if (!store.sessionId || store.isTyping) return

      const userMsg: ChatMessage = {
        id: Date.now(),
        role: 'USER',
        content,
        createdAt: new Date().toISOString(),
      }
      store.addMessage(userMsg)
      store.incrementCount()
      store.setTyping(true)

      try {
        const { data } = await sendMessageApi(store.sessionId, content)
        store.addMessage(data.data)
      } catch {
        store.markFailed(userMsg.id)
      } finally {
        store.setTyping(false)
      }
    },
    [store],
  )

  const retryMessage = useCallback(
    async (message: ChatMessage) => {
      if (!store.sessionId || store.isTyping) return

      store.clearFailed(message.id)
      store.setTyping(true)

      try {
        const { data } = await sendMessageApi(store.sessionId, message.content)
        store.addMessage(data.data)
      } catch {
        store.markFailed(message.id)
      } finally {
        store.setTyping(false)
      }
    },
    [store],
  )

  return {
    sessionId: store.sessionId,
    messages: store.messages,
    isTyping: store.isTyping,
    userMsgCount: store.userMsgCount,
    developed: store.developed,
    sendMessage,
    retryMessage,
  }
}
