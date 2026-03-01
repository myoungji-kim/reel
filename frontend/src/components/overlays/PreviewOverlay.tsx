import { useEffect, useState } from 'react'
import type { DevelopPreview } from '../../types/frame'

interface Props {
  isOpen: boolean
  preview: DevelopPreview | null
  onSave: (frameId: number, title: string, content: string) => void
  onCancel: () => void
}

const PERF_COUNT = 14

export default function PreviewOverlay({ isOpen, preview, onSave, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (preview) {
      setTitle(preview.title)
      setContent(preview.content)
    }
  }, [preview])

  const handleSave = () => {
    if (!preview) return
    onSave(preview.frameId, title, content)
  }

  return (
    <div
      style={{
        ...styles.overlay,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'all' : 'none',
      }}
    >
      <div
        style={{
          ...styles.sheet,
          transform: isOpen ? 'translateY(0)' : 'translateY(60px)',
        }}
      >
        {/* 헤더 */}
        <div style={styles.header}>
          <div style={styles.handle} />
          {/* 미니 필름스트립 */}
          <div style={styles.filmstrip}>
            {Array.from({ length: PERF_COUNT }, (_, i) => (
              <div key={i} style={styles.perf} />
            ))}
          </div>
          <div style={styles.labelRow}>
            <span style={styles.eyebrow}>◈ 현상 미리보기</span>
            <span style={styles.editHint}>
              <span style={styles.editDot} />
              직접 수정 가능해요
            </span>
          </div>
        </div>

        {/* 본문 */}
        <div style={styles.body}>
          <div style={styles.fieldTag}>제목</div>
          <input
            style={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div style={{ ...styles.fieldTag, marginTop: 4 }}>본문</div>
          <textarea
            style={styles.contentInput}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* 푸터 */}
        <div style={styles.footer}>
          <button style={styles.btnCancel} onClick={onCancel}>
            ✕ 취소
          </button>
          <button style={styles.btnSave} onClick={handleSave}>
            ◆ 이대로 현상하기
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 400,
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
    borderRadius: '20px 20px 0 0',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '92vh',
    transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
  },
  header: {
    flexShrink: 0,
    padding: '16px 20px 12px',
    borderBottom: '1px solid var(--border)',
  },
  handle: {
    width: 36,
    height: 3,
    background: 'var(--border-light)',
    borderRadius: 2,
    margin: '0 auto 16px',
  },
  filmstrip: {
    height: 18,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    padding: '0 6px',
    gap: 5,
    marginBottom: 14,
  },
  perf: {
    width: 9,
    height: 6,
    borderRadius: 1,
    background: 'var(--bg-mid)',
    border: '1px solid var(--border)',
    flexShrink: 0,
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--amber)',
    letterSpacing: '0.12em',
    opacity: 0.8,
  },
  editHint: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: 'var(--cream-muted)',
    letterSpacing: '0.06em',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  editDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: 'var(--amber)',
    opacity: 0.5,
    // devBlink 애니메이션은 index.css에 정의됨
    animation: 'devBlink 1.5s ease-in-out infinite',
    display: 'inline-block',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
  },
  fieldTag: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: 'var(--cream-muted)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  titleInput: {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-light)',
    borderRadius: 8,
    padding: '12px 14px',
    color: 'var(--cream)',
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 17,
    fontWeight: 400,
    outline: 'none',
    marginBottom: 14,
    lineHeight: 1.4,
    boxSizing: 'border-box',
  },
  contentInput: {
    width: '100%',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: 14,
    color: 'var(--cream-dim)',
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 14,
    fontWeight: 300,
    lineHeight: 2,
    resize: 'none',
    outline: 'none',
    minHeight: 200,
    boxSizing: 'border-box',
  },
  footer: {
    flexShrink: 0,
    padding: '12px 20px 28px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    gap: 10,
  },
  btnCancel: {
    flex: 1,
    padding: 13,
    background: 'transparent',
    border: '1px solid var(--border-light)',
    borderRadius: 10,
    cursor: 'pointer',
    color: 'var(--cream-muted)',
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    letterSpacing: '0.06em',
  },
  btnSave: {
    flex: 2,
    padding: 13,
    background: 'linear-gradient(135deg, var(--amber-light), var(--amber))',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    color: 'var(--bg)',
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    letterSpacing: '0.06em',
    fontWeight: 700,
    boxShadow: '0 3px 12px rgba(212,130,42,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
}
