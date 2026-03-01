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

      // 유저 메시지 낙관적 업데이트
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
        showToast('메시지 전송에 실패했어요.')
      } finally {
        store.setTyping(false)
      }
    },
    [store, showToast],
  )

  return {
    sessionId: store.sessionId,
    messages: store.messages,
    isTyping: store.isTyping,
    userMsgCount: store.userMsgCount,
    developed: store.developed,
    sendMessage,
  }
}
