import { useState, useEffect } from 'react'
import type { Frame } from '../../types/frame'
import { formatChatDate } from '../../utils/dateFormat'
import { saveFrame } from '../../api/frameApi'
import { useFrameStore } from '../../stores/frameStore'
import { useToast } from '../../hooks/useToast'

interface Props {
  isOpen: boolean
  frame: Frame | null
  onClose: () => void
}

const PERF_COUNT = 8

export default function FrameOverlay({ isOpen, frame, onClose }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const updateFrame = useFrameStore((s) => s.updateFrame)
  const { showToast } = useToast()

  useEffect(() => {
    if (frame) {
      setTitle(frame.title)
      setContent(frame.content)
    }
    setIsEditing(false)
  }, [frame])

  const handleSave = async () => {
    if (!frame || !title.trim() || !content.trim()) return
    setIsSaving(true)
    try {
      await saveFrame(frame.id, title.trim(), content.trim())
      updateFrame(frame.id, title.trim(), content.trim())
      setIsEditing(false)
      showToast('수정됐어요.')
    } catch {
      showToast('수정에 실패했어요.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (frame) {
      setTitle(frame.title)
      setContent(frame.content)
    }
    setIsEditing(false)
  }

  return (
    <div
      style={{
        ...styles.overlay,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'all' : 'none',
      }}
      onClick={onClose}
    >
      <div
        style={{
          ...styles.sheet,
          transform: isOpen ? 'translateY(0)' : 'translateY(60px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.handle} />

        {/* 닫기 / 수정 버튼 */}
        <div style={styles.headerBtns}>
          {!isEditing ? (
            <button style={styles.editBtn} onClick={() => setIsEditing(true)}>✏</button>
          ) : (
            <>
              <button style={styles.cancelBtn} onClick={handleCancel}>취소</button>
              <button
                style={{ ...styles.saveBtn, opacity: isSaving ? 0.5 : 1 }}
                onClick={handleSave}
                disabled={isSaving}
              >
                저장
              </button>
            </>
          )}
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* 상단 필름스트립 */}
        <div style={styles.frameTop}>
          {Array.from({ length: PERF_COUNT }, (_, i) => (
            <div key={i} style={styles.overlayPerf} />
          ))}
          {frame && (
            <span style={styles.overlayNum}>
              ♦{String(frame.frameNum).padStart(2, '0')}
            </span>
          )}
        </div>

        {frame && (
          <>
            {isEditing ? (
              <input
                style={styles.titleInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
              />
            ) : (
              <div style={styles.title}>{title}</div>
            )}
            <div style={styles.date}>{formatChatDate(new Date(frame.date))}</div>
            {isEditing ? (
              <textarea
                style={styles.contentInput}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용"
              />
            ) : (
              <div style={styles.content}>{content}</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    background: 'rgba(10,8,5,0.97)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    transition: 'opacity 0.25s',
  },
  sheet: {
    width: '100%',
    maxWidth: 440,
    background: 'var(--bg-mid)',
    border: '1.5px solid var(--border)',
    borderBottom: 'none',
    borderRadius: '16px 16px 0 0',
    padding: '24px 24px 48px',
    maxHeight: '85vh',
    overflowY: 'auto',
    transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
    position: 'relative',
  },
  handle: {
    width: 36,
    height: 3,
    background: 'var(--border-light)',
    borderRadius: 2,
    margin: '0 auto 20px',
  },
  headerBtns: {
    position: 'absolute',
    top: 20,
    right: 20,
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  closeBtn: {
    background: 'transparent',
    border: '1px solid var(--border-light)',
    color: 'var(--cream-muted)',
    width: 28,
    height: 28,
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    background: 'transparent',
    border: '1px solid var(--border-light)',
    color: 'var(--cream-muted)',
    width: 28,
    height: 28,
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    background: 'transparent',
    border: '1px solid var(--border-light)',
    color: 'var(--cream-muted)',
    padding: '4px 10px',
    borderRadius: 3,
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
  },
  saveBtn: {
    background: 'var(--amber)',
    border: 'none',
    color: 'var(--bg)',
    padding: '4px 10px',
    borderRadius: 3,
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
  },
  frameTop: {
    height: 18,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
    padding: '0 6px',
    gap: 6,
  },
  overlayPerf: {
    width: 10,
    height: 7,
    borderRadius: 1,
    background: 'var(--bg-mid)',
    border: '1px solid var(--border)',
    flexShrink: 0,
  },
  overlayNum: {
    fontFamily: "'VT323', monospace",
    fontSize: 18,
    color: 'var(--amber)',
    marginLeft: 'auto',
    opacity: 0.6,
  },
  title: {
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 20,
    color: 'var(--cream)',
    marginBottom: 4,
  },
  titleInput: {
    width: '100%',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: 4,
    padding: '8px 12px',
    color: 'var(--cream)',
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 18,
    marginBottom: 4,
    outline: 'none',
    boxSizing: 'border-box',
  },
  date: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--amber-light)',
    opacity: 0.6,
    marginBottom: 16,
  },
  content: {
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 14,
    color: 'var(--cream-dim)',
    lineHeight: 2,
    fontWeight: 300,
    whiteSpace: 'pre-wrap',
    borderTop: '1px solid var(--border)',
    paddingTop: 16,
  },
  contentInput: {
    width: '100%',
    minHeight: 200,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: 4,
    padding: '12px',
    color: 'var(--cream-dim)',
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 14,
    lineHeight: 2,
    fontWeight: 300,
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    borderTop: '1px solid var(--border)',
    paddingTop: 16,
  },
}
