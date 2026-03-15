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

interface Props {
  onBack?: () => void
}

export default function ChatPage({ onBack }: Props) {
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
          <span style={styles.logo}>reel</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {developed ? (
              <span style={styles.developedBadge}>◈ 현상 완료</span>
            ) : userMsgCount > 0 ? (
              <span style={styles.count}>{userMsgCount} lines</span>
            ) : null}
            <span style={styles.date}>{formatChatDate(new Date())}</span>
          </div>
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
    padding: '10px 16px 9px',
    borderBottom: '1px solid var(--border-default)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontFamily: "var(--font-display)",
    fontSize: 18,
    fontWeight: 600,
    fontStyle: 'italic',
    color: 'var(--text-primary)',
  },
  date: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: 'var(--text-muted)',
    background: 'var(--surface-muted)',
    border: '1px solid var(--border-default)',
    padding: '3px 8px',
    borderRadius: 8,
    letterSpacing: '0.04em',
  },
  count: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
  },
  developedBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: 'var(--gold)',
    border: '1px solid rgba(122,92,32,0.35)',
    borderRadius: 6,
    padding: '3px 8px',
    letterSpacing: '0.06em',
    background: 'rgba(122,92,32,0.07)',
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
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 20,
    color: 'var(--text-primary)',
    fontWeight: 300,
    lineHeight: 1.6,
    letterSpacing: '0.02em',
  },
  emptyDesc: {
    fontFamily: "var(--font-body)",
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 300,
    marginTop: 8,
    marginBottom: 20,
  },
  emptyQuickBtn: {
    background: 'transparent',
    border: '1px solid var(--border-mid)',
    cursor: 'pointer',
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    padding: '8px 20px',
    borderRadius: 8,
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    WebkitTapHighlightColor: 'transparent',
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
