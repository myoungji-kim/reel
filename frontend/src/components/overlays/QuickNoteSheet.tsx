import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { createQuickFrame } from '../../api/frameApi'
import { uploadPhotos } from '../../api/photoApi'
import { useToast } from '../../hooks/useToast'
import { useQueryClient } from '@tanstack/react-query'
import OverlaySheet from './OverlaySheet'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

const MAX_PHOTOS = 5
const today = () => new Date().toISOString().split('T')[0]

export default function QuickNoteSheet({ isOpen, onClose, onSaved }: Props) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [date, setDate] = useState(today())
  const [photos, setPhotos] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  const reset = () => {
    setTitle('')
    setContent('')
    setDate(today())
    previewUrls.forEach((url) => URL.revokeObjectURL(url))
    setPhotos([])
    setPreviewUrls([])
    setSaving(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const toAdd = files.slice(0, MAX_PHOTOS - photos.length)
    setPhotos((prev) => [...prev, ...toAdd])
    setPreviewUrls((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))])
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || saving) return
    setSaving(true)
    try {
      const { frameId } = await createQuickFrame({ title: title.trim(), content: content.trim(), date })
      if (photos.length > 0) {
        await uploadPhotos(frameId, photos)
      }
      queryClient.invalidateQueries({ queryKey: ['streak'] })
      reset()
      onSaved()
    } catch {
      showToast('저장에 실패했어요. 다시 시도해줘요.', 'error')
      setSaving(false)
    }
  }

  const canSave = title.trim().length > 0 && content.trim().length > 0 && !saving

  return (
    <OverlaySheet isOpen={isOpen} zIndex={400}>
      <div>
        {/* 헤더 */}
        <div style={styles.header}>
          <div style={styles.handle} />
          <div style={styles.titleRow}>
            <span style={styles.eyebrow}>✦ 빠른 현상</span>
            <button style={styles.closeBtn} onClick={handleClose} aria-label="닫기"><X size={14} /></button>
          </div>
        </div>

        {/* 본문 */}
        <div style={styles.body}>
          <div style={styles.fieldTag}>날짜</div>
          <input
            type="date"
            style={styles.dateInput}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div style={{ ...styles.fieldTag, marginTop: 14 }}>제목</div>
          <input
            style={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="오늘의 한 장면"
          />

          <div style={{ ...styles.fieldTag, marginTop: 4 }}>내용</div>
          <textarea
            style={styles.contentInput}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="지금 이 순간을 기록하세요"
            rows={4}
          />

          {/* 사진 */}
          <div style={{ ...styles.fieldTag, marginTop: 16 }}>
            사진 ({photos.length}/{MAX_PHOTOS})
          </div>
          <div style={styles.photoGrid}>
            {previewUrls.map((url, i) => (
              <div key={i} style={styles.photoThumb}>
                <img src={url} alt={`photo-${i}`} style={styles.thumbImg} />
                <button style={styles.removeBtn} onClick={() => removePhoto(i)} aria-label="사진 제거"><X size={8} /></button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button style={styles.addBtn} onClick={() => fileInputRef.current?.click()}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                <span style={{ fontSize: 10, marginTop: 2 }}>추가</span>
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
          <button style={styles.btnCancel} onClick={handleClose}>
            ✕ 취소
          </button>
          <button
            style={{ ...styles.btnSave, ...(!canSave ? styles.btnSaveDisabled : {}) }}
            onClick={handleSave}
            disabled={!canSave}
          >
            {saving ? '현상 중...' : '✦ 즉시 현상'}
          </button>
        </div>
      </div>
    </OverlaySheet>
  )
}

const styles: Record<string, React.CSSProperties> = {
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
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: 'var(--amber)',
    letterSpacing: '0.12em',
    opacity: 0.8,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: 'var(--cream-muted)',
    padding: '4px',
    opacity: 0.6,
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
  },
  fieldTag: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: 'var(--cream-muted)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  dateInput: {
    width: '100%',
    background: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    color: 'var(--text-muted)',
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: '0.06em',
    outline: 'none',
    boxSizing: 'border-box',
    colorScheme: 'light',
  },
  titleInput: {
    width: '100%',
    background: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 14px',
    color: 'var(--text-primary)',
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
    background: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: 14,
    color: 'var(--text-secondary)',
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 14,
    fontWeight: 300,
    lineHeight: 2,
    resize: 'none',
    outline: 'none',
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
    background: 'var(--overlay-dim)',
    border: 'none',
    color: 'var(--cream)',
    fontSize: 10,
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
    border: '1px dashed var(--border-default)',
    background: 'var(--surface-muted)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "var(--font-mono)",
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
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: '0.06em',
  },
  btnSave: {
    flex: 2,
    padding: 13,
    background: 'var(--surface-inverse)',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    color: 'var(--accent-gold)',
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: '0.06em',
    fontWeight: 500,
    boxShadow: 'var(--shadow-fab)',
    transition: 'opacity 0.2s',
  },
  btnSaveDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
}
