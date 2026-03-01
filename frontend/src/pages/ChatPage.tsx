import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../hooks/useChat'
import { useToast } from '../hooks/useToast'
import MessageBubble from '../components/chat/MessageBubble'
import TypingIndicator from '../components/chat/TypingIndicator'
import ChatInput from '../components/chat/ChatInput'
import DevelopBanner from '../components/chat/DevelopBanner'
import DevelopingOverlay from '../components/overlays/DevelopingOverlay'
import PreviewOverlay from '../components/overlays/PreviewOverlay'
import { formatChatDate } from '../utils/dateFormat'
import { useUIStore } from '../stores/uiStore'
import { useFrameStore } from '../stores/frameStore'
import { useChatStore } from '../stores/chatStore'
import { developPreview, saveFrame } from '../api/frameApi'

export default function ChatPage() {
  const { messages, isTyping, userMsgCount, developed, sendMessage, sessionId } = useChat()
  const { isDevelopingOpen, setDevelopingOpen, isPreviewOpen, setPreviewOpen, setActiveTab } =
    useUIStore()
  const { preview, setPreview } = useFrameStore()
  const resetChat = useChatStore((s) => s.reset)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const bottomRef = useRef<HTMLDivElement>(null)

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // 현상 시작
  const handleDevelop = async () => {
    if (!sessionId) return
    setDevelopingOpen(true)
    const startTime = Date.now()

    try {
      const { data } = await developPreview(sessionId)
      setPreview(data.data)

      // 최소 2.2초 대기 (진행바 완료)
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 2200 - elapsed)
      await new Promise((resolve) => setTimeout(resolve, remaining))
    } catch {
      setDevelopingOpen(false)
      showToast('현상에 실패했어요. 다시 시도해줘요.')
      return
    }

    setDevelopingOpen(false)
    setPreviewOpen(true)
  }

  // 최종 저장
  const handleSave = async (frameId: number, title: string, content: string) => {
    try {
      await saveFrame(frameId, title, content)
      setPreviewOpen(false)
      setPreview(null)
      resetChat()
      setActiveTab('roll')
      navigate('/home')
    } catch {
      showToast('저장에 실패했어요. 다시 시도해줘요.')
    }
  }

  // 미리보기 취소
  const handleCancelPreview = () => {
    setPreviewOpen(false)
    setPreview(null)
  }

  // 현상 완료된 세션
  if (developed) {
    return (
      <div style={styles.view}>
        <div style={styles.header}>
          <span style={styles.date}>{formatChatDate(new Date())}</span>
        </div>
        <div style={styles.developedWrap}>
          <p style={styles.developedText}>
            현상 완료! 🎞️
            <br />
            오늘 일기가 필름 롤에 저장됐어요.
            <br />
            내일 또 이야기해줘요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={styles.view}>
        {/* 헤더 */}
        <div style={styles.header}>
          <span style={styles.date}>{formatChatDate(new Date())}</span>
          <span style={styles.count}>{userMsgCount} lines</span>
        </div>

        {/* 메시지 목록 */}
        <div style={styles.messages}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* 현상 배너 (userMsgCount >= 3) */}
        {userMsgCount >= 3 && sessionId !== null && (
          <DevelopBanner onDevelop={handleDevelop} />
        )}

        {/* 입력창 */}
        <ChatInput onSend={sendMessage} disabled={isTyping} />
      </div>

      {/* 현상 오버레이 */}
      <DevelopingOverlay isOpen={isDevelopingOpen} />

      {/* 미리보기 오버레이 */}
      <PreviewOverlay
        isOpen={isPreviewOpen}
        preview={preview}
        onSave={handleSave}
        onCancel={handleCancelPreview}
      />
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  view: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    flexShrink: 0,
    padding: '12px 20px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    color: 'var(--amber)',
    letterSpacing: '0.1em',
  },
  count: {
    fontFamily: "'VT323', monospace",
    fontSize: 18,
    color: 'var(--cream-muted)',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 16px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    scrollBehavior: 'smooth',
  },
  developedWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  developedText: {
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 15,
    color: 'var(--cream-dim)',
    fontWeight: 300,
    lineHeight: 2,
    textAlign: 'center',
  },
}
