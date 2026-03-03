import { useState, useEffect, useRef } from 'react'
import type { Frame, Photo } from '../../types/frame'
import { formatChatDate } from '../../utils/dateFormat'
import { getMoodToneStyle } from '../../utils/moodTone'
import MoodChipSelector from '../MoodChipSelector'
import { saveFrame, getFrame } from '../../api/frameApi'
import { uploadPhotos, deletePhoto } from '../../api/photoApi'
import { useFrameStore } from '../../stores/frameStore'
import { useToast } from '../../hooks/useToast'

interface Props {
  isOpen: boolean
  frame: Frame | null
  onClose: () => void
}

const PERF_COUNT = 8
const MAX_PHOTOS = 5

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export default function FrameOverlay({ isOpen, frame, onClose }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [localPhotos, setLocalPhotos] = useState<Photo[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // 편집 모드 사진 상태
  const [pendingAdd, setPendingAdd] = useState<File[]>([])
  const [pendingAddUrls, setPendingAddUrls] = useState<string[]>([])
  const [pendingDelete, setPendingDelete] = useState<number[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const updateFrame = useFrameStore((s) => s.updateFrame)
  const updateFramePhotos = useFrameStore((s) => s.updateFramePhotos)
  const { showToast } = useToast()

  useEffect(() => {
    if (frame) {
      setTitle(frame.title)
      setContent(frame.content)
      setMood(frame.mood ?? null)
      setLocalPhotos(frame.photos ?? [])
    }
    setIsEditing(false)
    setPendingAdd([])
    setPendingAddUrls([])
    setPendingDelete([])
  }, [frame])

  // cleanup object URLs
  useEffect(() => {
    return () => {
      pendingAddUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [pendingAddUrls])

  const visibleExisting = localPhotos.filter((p) => !pendingDelete.includes(p.id))
  const totalCount = visibleExisting.length + pendingAdd.length

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = MAX_PHOTOS - totalCount
    const toAdd = files.slice(0, remaining)
    const newUrls = toAdd.map((f) => URL.createObjectURL(f))
    setPendingAdd((prev) => [...prev, ...toAdd])
    setPendingAddUrls((prev) => [...prev, ...newUrls])
    e.target.value = ''
  }

  const removeExisting = (photoId: number) => {
    setPendingDelete((prev) => [...prev, photoId])
  }

  const removePending = (index: number) => {
    URL.revokeObjectURL(pendingAddUrls[index])
    setPendingAdd((prev) => prev.filter((_, i) => i !== index))
    setPendingAddUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!frame || !title.trim() || !content.trim() || !mood) return
    setIsSaving(true)
    try {
      await saveFrame(frame.id, title.trim(), content.trim(), mood)
      updateFrame(frame.id, title.trim(), content.trim(), mood)

      // 사진 업로드/삭제 병렬 처리
      await Promise.all([
        pendingAdd.length > 0 ? uploadPhotos(frame.id, pendingAdd) : Promise.resolve(),
        ...pendingDelete.map((photoId) => deletePhoto(frame.id, photoId)),
      ])

      // 최신 photos 상태 서버에서 재조회
      const { data } = await getFrame(frame.id)
      updateFramePhotos(frame.id, data.data.photos)
      setLocalPhotos(data.data.photos)

      setPendingAdd([])
      setPendingAddUrls([])
      setPendingDelete([])
      setIsEditing(false)
      showToast('수정됐어요.')
    } catch {
      showToast('수정에 실패했어요.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (frame) {
      setTitle(frame.title)
      setContent(frame.content)
      setMood(frame.mood ?? null)
      setLocalPhotos(frame.photos ?? [])
    }
    pendingAddUrls.forEach((url) => URL.revokeObjectURL(url))
    setPendingAdd([])
    setPendingAddUrls([])
    setPendingDelete([])
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
          background: 'linear-gradient(var(--film-tint), var(--film-tint)), var(--bg-mid)',
          ...getMoodToneStyle(frame?.mood),
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
                style={{ ...styles.saveBtn, opacity: isSaving || !mood ? 0.4 : 1 }}
                onClick={handleSave}
                disabled={isSaving || !mood}
              >
                저장
              </button>
            </>
          )}
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* 상단 필름스트립 */}
        <div style={{ ...styles.frameTop, background: 'linear-gradient(var(--film-tint), var(--film-tint)), var(--bg)' }}>
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

            {/* 사진 섹션 */}
            {isEditing ? (
              <div style={styles.photoSection}>
                <div style={styles.photoLabel}>
                  사진 ({totalCount}/{MAX_PHOTOS})
                </div>
                <div style={styles.photoGrid}>
                  {visibleExisting.map((photo) => (
                    <div key={photo.id} style={styles.photoThumb}>
                      <img
                        src={`${API_BASE}${photo.url}`}
                        alt="photo"
                        style={styles.thumbImg}
                      />
                      <button style={styles.removeBtn} onClick={() => removeExisting(photo.id)}>
                        ✕
                      </button>
                    </div>
                  ))}
                  {pendingAddUrls.map((url, i) => (
                    <div key={`new-${i}`} style={styles.photoThumb}>
                      <img src={url} alt={`new-${i}`} style={styles.thumbImg} />
                      <button style={styles.removeBtn} onClick={() => removePending(i)}>
                        ✕
                      </button>
                    </div>
                  ))}
                  {totalCount < MAX_PHOTOS && (
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
            ) : (
              localPhotos.length > 0 && (
                <div style={styles.photoStrip}>
                  {localPhotos.map((photo) => (
                    <img
                      key={photo.id}
                      src={`${API_BASE}${photo.url}`}
                      alt="photo"
                      style={styles.stripImg}
                    />
                  ))}
                </div>
              )
            )}

            {isEditing && (
              <div style={styles.moodSection}>
                <div style={styles.moodLabel}>오늘 기분</div>
                <MoodChipSelector value={mood} onChange={setMood} />
              </div>
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
  photoSection: {
    marginTop: 20,
    borderTop: '1px solid var(--border)',
    paddingTop: 16,
  },
  photoLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: 'var(--cream-muted)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 8,
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
  photoStrip: {
    display: 'flex',
    gap: 6,
    marginTop: 16,
    overflowX: 'auto',
    borderTop: '1px solid var(--border)',
    paddingTop: 12,
  },
  stripImg: {
    width: 72,
    height: 56,
    objectFit: 'cover',
    borderRadius: 3,
    border: '1px solid var(--border)',
    flexShrink: 0,
  },
  moodSection: {
    marginTop: 20,
    borderTop: '1px solid var(--border)',
    paddingTop: 16,
  },
  moodLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: 'var(--cream-muted)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
}
