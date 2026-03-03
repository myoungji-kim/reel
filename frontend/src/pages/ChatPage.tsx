import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../hooks/useChat'
import { useToast } from '../hooks/useToast'
import MessageBubble from '../components/chat/MessageBubble'
import TypingIndicator from '../components/chat/TypingIndicator'
import ChatInput from '../components/chat/ChatInput'
import DevelopBanner from '../components/chat/DevelopBanner'
import RedevelopBanner from '../components/chat/RedevelopBanner'
import OnThisDayBanner from '../components/chat/OnThisDayBanner'
import DevelopingOverlay from '../components/overlays/DevelopingOverlay'
import PreviewOverlay from '../components/overlays/PreviewOverlay'
import QuickNoteSheet from '../components/overlays/QuickNoteSheet'
import { formatChatDate } from '../utils/dateFormat'
import { useUIStore } from '../stores/uiStore'
import { useFrameStore } from '../stores/frameStore'
import { useChatStore } from '../stores/chatStore'
import { developPreview, saveFrame, getRollStats } from '../api/frameApi'
import { uploadPhotos } from '../api/photoApi'
import { useQueryClient } from '@tanstack/react-query'

export default function ChatPage() {
  const {
    messages, isTyping, userMsgCount, developed, newMsgSinceDevelop,
    sendMessage, retryMessage, resetNewMsgSinceDevelop, sessionId,
  } = useChat()
  const { isDevelopingOpen, setDevelopingOpen, isPreviewOpen, setPreviewOpen, setActiveTab,
    isQuickNoteOpen, setQuickNoteOpen } = useUIStore()
  const { preview, setPreview, updateFrame } = useFrameStore()
  const resetChat = useChatStore((s) => s.reset)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
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
      showToast('현상에 실패했어요. 다시 시도해줘요.', 'error')
      return
    }

    setDevelopingOpen(false)
    setPreviewOpen(true)
  }

  // 최종 저장
  const handleSave = async (frameId: number, title: string, content: string, mood: string, photos: File[]) => {
    const isRedevelop = developed
    try {
      await saveFrame(frameId, title, content, mood)
      if (photos.length > 0) {
        await uploadPhotos(frameId, photos)
      }
      setPreviewOpen(false)
      setPreview(null)
      if (isRedevelop) {
        // 재현상: 기존 프레임 업데이트, 채팅 페이지 유지
        updateFrame(frameId, title, content, mood)
        resetNewMsgSinceDevelop()
        showToast('일기가 업데이트됐어요.')
      } else {
        // 첫 현상: 채팅 초기화 후 필름 롤로 이동
        resetChat()
        setActiveTab('roll')
        navigate('/home')
      }
      if (!isRedevelop) {
        // 롤 완성 여부 확인
        try {
          const stats = await getRollStats()
          queryClient.invalidateQueries({ queryKey: ['roll-stats'] })
          if (stats.totalFrames % 24 === 0 && stats.totalFrames > 0) {
            const rollNum = String(stats.totalFrames / 24).padStart(2, '0')
            showToast(`◆ ROLL ${rollNum} 완성! 🎞 새 롤이 시작됩니다`)
          }
        } catch {
          // 롤 통계 실패는 무시
        }
      }
    } catch {
      showToast('저장에 실패했어요. 다시 시도해줘요.', 'error')
    }
  }

  // 미리보기 취소
  const handleCancelPreview = () => {
    setPreviewOpen(false)
    setPreview(null)
  }

  return (
    <>
      <div style={styles.view}>
        {/* 헤더 */}
        <div style={styles.header}>
          <span style={styles.date}>{formatChatDate(new Date())}</span>
          {developed ? (
            <span style={styles.developedBadge}>◈ 현상 완료</span>
          ) : (
            <span style={styles.count}>{userMsgCount} lines</span>
          )}
          <button style={styles.quickNoteBtn} onClick={() => setQuickNoteOpen(true)}>
            ✦
          </button>
        </div>

        {/* 이날의 기억 배너 */}
        <OnThisDayBanner />

        {/* 메시지 목록 */}
        <div style={styles.messages}>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onRetry={msg.failed ? () => retryMessage(msg) : undefined}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* 현상 배너 */}
        {!developed && userMsgCount >= 3 && sessionId !== null && (
          <DevelopBanner onDevelop={handleDevelop} />
        )}
        {developed && newMsgSinceDevelop >= 1 && sessionId !== null && (
          <RedevelopBanner onRedevelop={handleDevelop} />
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

      {/* 빠른 기록 시트 */}
      <QuickNoteSheet
        isOpen={isQuickNoteOpen}
        onClose={() => setQuickNoteOpen(false)}
        onSaved={() => {
          setQuickNoteOpen(false)
          setActiveTab('roll')
          navigate('/home')
        }}
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
  quickNoteBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    color: 'var(--cream-muted)',
    padding: '2px 4px',
    opacity: 0.5,
    lineHeight: 1,
    marginLeft: 8,
  },
  developedBadge: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: 'var(--amber)',
    border: '1px solid rgba(212,130,42,0.3)',
    borderRadius: 3,
    padding: '3px 8px',
    letterSpacing: '0.05em',
    opacity: 0.8,
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
}
