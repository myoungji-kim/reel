import { useEffect, useRef, useState } from 'react'
import type { DevelopPreview } from '../../types/frame'

interface Props {
  isOpen: boolean
  preview: DevelopPreview | null
  onSave: (frameId: number, title: string, content: string, photos: File[]) => void
  onCancel: () => void
}

const PERF_COUNT = 14
const MAX_PHOTOS = 5

export default function PreviewOverlay({ isOpen, preview, onSave, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (preview) {
      setTitle(preview.title)
      setContent(preview.content)
    }
  }, [preview])

  // cleanup object URLs on unmount or when photos change
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const remaining = MAX_PHOTOS - photos.length
    const toAdd = files.slice(0, remaining)

    const newUrls = toAdd.map((f) => URL.createObjectURL(f))
    setPhotos((prev) => [...prev, ...toAdd])
    setPreviewUrls((prev) => [...prev, ...newUrls])
    // reset input so same file can be re-selected
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (!preview) return
    onSave(preview.frameId, title, content, photos)
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

          {/* 사진 섹션 */}
          <div style={{ ...styles.fieldTag, marginTop: 16 }}>
            사진 ({photos.length}/{MAX_PHOTOS})
          </div>
          <div style={styles.photoGrid}>
            {previewUrls.map((url, i) => (
              <div key={i} style={styles.photoThumb}>
                <img src={url} alt={`photo-${i}`} style={styles.thumbImg} />
                <button style={styles.removeBtn} onClick={() => removePhoto(i)}>
                  ✕
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button style={styles.addBtn} onClick={() => fileInputRef.current?.click()}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                <span style={{ fontSize: 9, marginTop: 2 }}>추가</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
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
  photoGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoThumb: {
    position: 'relative',
    width: 72,
    height: 56,
    borderRadius: 4,
    overflow: 'hidden',
    border: '1px solid var(--border)',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: 'rgba(10,8,5,0.8)',
    border: 'none',
    color: 'var(--cream)',
    fontSize: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  addBtn: {
    width: 72,
    height: 56,
    borderRadius: 4,
    border: '1px dashed var(--border-light)',
    background: 'rgba(255,255,255,0.02)',
    color: 'var(--cream-muted)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Space Mono', monospace",
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
