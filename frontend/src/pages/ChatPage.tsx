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
import StreakBadge from '../components/chat/StreakBadge'
import DevelopingOverlay from '../components/overlays/DevelopingOverlay'
import PreviewOverlay from '../components/overlays/PreviewOverlay'
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
  const { isDevelopingOpen, setDevelopingOpen, isPreviewOpen, setPreviewOpen, setActiveTab, setQuickNoteOpen, setRollTitleOpen, setPendingRollNum } = useUIStore()
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
  const handleSave = async (frameId: number, title: string, content: string, mood: string, photos: File[], date: string) => {
    const isRedevelop = developed
    try {
      await saveFrame(frameId, title, content, mood, date)
      if (photos.length > 0) {
        await uploadPhotos(frameId, photos)
      }
      queryClient.invalidateQueries({ queryKey: ['streak'] })
      setPreviewOpen(false)
      setPreview(null)
      if (isRedevelop) {
        // 재현상: 기존 프레임 업데이트, 채팅 페이지 유지
        updateFrame(frameId, title, content, mood)
        resetNewMsgSinceDevelop()
        showToast('일기가 업데이트됐어요.')
      } else {
        // 첫 현상: 채팅 초기화 후 현상소로 이동
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
            const completedRollNum = stats.totalFrames / 24
            const rollLabel = String(completedRollNum).padStart(2, '0')
            showToast(
              `◆ ROLL ${rollLabel} 완성! 이름 붙이기 →`,
              'success',
              () => {
                setPendingRollNum(completedRollNum)
                setRollTitleOpen(true)
              }
            )
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
          ) : userMsgCount > 0 ? (
            <span style={styles.count}>{userMsgCount} lines</span>
          ) : null}
        </div>

        {/* 이날의 기억 배너 */}
        <OnThisDayBanner />

        {/* 연속 기록 배지 */}
        <StreakBadge />

        {/* 메시지 목록 */}
        <div style={styles.messages}>
          {userMsgCount === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyDate}>{formatChatDate(new Date())}</p>
              <p style={styles.emptyTitle}>오늘 하루의 한 장면을</p>
              <p style={styles.emptyTitle}>담아볼까요</p>
              <p style={styles.emptyDesc}>AI와 대화하거나, 짧게 직접 기록하세요</p>
              <button style={styles.emptyQuickBtn} onClick={() => setQuickNoteOpen(true)}>
                ✦ 빠른 현상
              </button>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onRetry={msg.failed ? () => retryMessage(msg) : undefined}
                />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}
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
  developedBadge: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--amber-pale)',
    border: '1px solid var(--amber-35)',
    borderRadius: 3,
    padding: '4px 10px',
    letterSpacing: '0.05em',
    background: 'rgba(212,130,42,0.08)',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingBottom: 40,
  },
  emptyDate: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--amber)',
    letterSpacing: '0.15em',
    opacity: 0.5,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 20,
    color: 'var(--cream-dim)',
    fontWeight: 300,
    lineHeight: 1.6,
    letterSpacing: '0.02em',
  },
  emptyDesc: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 12,
    color: 'var(--cream-muted)',
    fontWeight: 300,
    marginTop: 8,
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyQuickBtn: {
    background: 'transparent',
    border: '1px solid var(--amber-35)',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--amber)',
    letterSpacing: '0.1em',
    padding: '8px 20px',
    borderRadius: 2,
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
