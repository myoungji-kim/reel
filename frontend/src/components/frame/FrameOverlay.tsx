import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import FilmPhoto from '../common/FilmPhoto'
import { Bookmark, BookmarkCheck, Pencil, X } from 'lucide-react'
import type { Frame, Photo } from '../../types/frame'
import { formatChatDate } from '../../utils/dateFormat'
import { getMoodToneStyle } from '../../utils/moodTone'
import MoodChipSelector from '../MoodChipSelector'
import { saveFrame, getFrame, archiveFrame, unarchiveFrame, toggleBookmark } from '../../api/frameApi'
import { uploadPhotos, deletePhoto } from '../../api/photoApi'
import { useFrameStore } from '../../stores/frameStore'
import { useToast } from '../../hooks/useToast'
import { useQueryClient } from '@tanstack/react-query'

interface Props {
  isOpen: boolean
  frame: Frame | null
  onClose: () => void
  onUnarchive?: (frame: Frame) => void
}

const PERF_COUNT = 14
const MAX_PHOTOS = 5


export default function FrameOverlay({ isOpen, frame, onClose, onUnarchive }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [localPhotos, setLocalPhotos] = useState<Photo[]>([])
  const [localBookmarked, setLocalBookmarked] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 편집 모드 사진 상태
  const [pendingAdd, setPendingAdd] = useState<File[]>([])
  const [pendingAddUrls, setPendingAddUrls] = useState<string[]>([])
  const [pendingDelete, setPendingDelete] = useState<number[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const updateFrame = useFrameStore((s) => s.updateFrame)
  const updateFramePhotos = useFrameStore((s) => s.updateFramePhotos)
  const removeFrame = useFrameStore((s) => s.removeFrame)
  const restoreFrame = useFrameStore((s) => s.restoreFrame)
  const toggleBookmarkFrame = useFrameStore((s) => s.toggleBookmarkFrame)
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  // 오버레이가 열릴 때마다 편집 상태 리셋 (같은 frame 재진입 포함)
  useEffect(() => {
    if (isOpen) {
      setIsEditing(false)
      setPendingAdd([])
      setPendingAddUrls([])
      setPendingDelete([])
    }
  }, [isOpen])

  useEffect(() => {
    if (frame) {
      setTitle(frame.title)
      setContent(frame.content)
      setMood(frame.mood ?? null)
      setLocalPhotos(frame.photos ?? [])
      setLocalBookmarked(frame.isBookmarked)
    }
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
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : '수정에 실패했어요.'
      showToast(message, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleBookmark = async () => {
    if (!frame) return
    const prev = localBookmarked
    setLocalBookmarked(!prev)
    toggleBookmarkFrame(frame.id, !prev)
    try {
      const result = await toggleBookmark(frame.id)
      setLocalBookmarked(result.isBookmarked)
      toggleBookmarkFrame(frame.id, result.isBookmarked)
    } catch {
      setLocalBookmarked(prev)
      toggleBookmarkFrame(frame.id, prev)
      showToast('북마크 변경에 실패했어요.', 'error')
    }
  }

  const handleArchive = async () => {
    if (!frame) return
    const frameSnapshot = { ...frame }
    try {
      await archiveFrame(frame.id)
      removeFrame(frame.id)
      queryClient.invalidateQueries({ queryKey: ['archived-frames'] })
      onClose()
      showToast('필름을 보관했어요', 'success', async () => {
        await unarchiveFrame(frameSnapshot.id)
        restoreFrame(frameSnapshot)
        queryClient.invalidateQueries({ queryKey: ['archived-frames'] })
      })
    } catch {
      showToast('보관에 실패했어요.', 'error')
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

  // 닫기 — 편집 중이면 pending 변경사항 정리 후 닫기
  const handleClose = () => {
    if (isEditing) {
      pendingAddUrls.forEach((url) => URL.revokeObjectURL(url))
      setPendingAdd([])
      setPendingAddUrls([])
      setPendingDelete([])
      setIsEditing(false)
    }
    onClose()
  }

  return (
    <div
      style={{
        ...styles.overlay,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'all' : 'none',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          ...styles.sheet,
          transform: isOpen ? 'translateY(0)' : 'translateY(60px)',
          background: 'var(--surface-muted)',
          ...getMoodToneStyle(frame?.mood),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.handle} />

        {/* 필름스트립 + 액션 버튼 (같은 행) */}
        <div style={styles.headerRow}>
          <div style={styles.frameTop}>
            {Array.from({ length: PERF_COUNT }, (_, i) => (
              <div key={i} style={styles.overlayPerf} />
            ))}
            {frame && (
              <span style={styles.overlayNum}>
                {frame.frameType === 'RETROSPECTIVE' && (
                  <span style={styles.recapLabel}>월간 회고</span>
                )}
                <span style={styles.overlayNumLabel}>FR.</span>
                {String(frame.frameNum).padStart(2, '0')}
              </span>
            )}
          </div>

          <div style={styles.headerBtns}>
            {isEditing ? (
              /* 편집 모드: 취소·저장만 표시, X 숨김 */
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
            ) : (
              /* 보기 모드: 북마크·(편집)·닫기 */
              <>
                {frame && (
                  <button
                    style={{
                      ...styles.iconBtn,
                      color: localBookmarked ? 'var(--gold)' : 'var(--text-muted)',
                    }}
                    onClick={handleToggleBookmark}
                    aria-label={localBookmarked ? '북마크 해제' : '북마크'}
                  >
                    {localBookmarked
                      ? <BookmarkCheck size={14} />
                      : <Bookmark size={14} />}
                  </button>
                )}
                {frame?.frameType !== 'RETROSPECTIVE' && (
                  <button style={styles.iconBtn} onClick={() => setIsEditing(true)} aria-label="수정">
                    <Pencil size={12} />
                  </button>
                )}
                <button style={styles.iconBtn} onClick={handleClose} aria-label="닫기">
                  <X size={12} />
                </button>
              </>
            )}
          </div>
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
                      <FilmPhoto
                        src={photo.url}
                        alt="photo"
                        style={styles.thumbImg}
                      />
                      <button style={styles.removeBtn} onClick={() => removeExisting(photo.id)} aria-label="사진 제거">
                        <X size={8} />
                      </button>
                    </div>
                  ))}
                  {pendingAddUrls.map((url, i) => (
                    <div key={`new-${i}`} style={styles.photoThumb}>
                      <img src={url} alt={`new-${i}`} style={styles.thumbImg} />
                      <button style={styles.removeBtn} onClick={() => removePending(i)} aria-label="사진 제거">
                        <X size={8} />
                      </button>
                    </div>
                  ))}
                  {totalCount < MAX_PHOTOS && (
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
            ) : (
              localPhotos.length > 0 && (
                <div style={styles.photoStrip}>
                  {localPhotos.map((photo) => (
                    <FilmPhoto
                      key={photo.id}
                      src={photo.url}
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

            {!isEditing && (
              <div style={styles.archiveRow}>
                {frame.isArchived ? (
                  <button style={styles.archiveBtn} onClick={() => { onUnarchive?.(frame); onClose() }}>
                    복원하기
                  </button>
                ) : (
                  <button style={styles.archiveBtn} onClick={handleArchive}>
                    필름 보관
                  </button>
                )}
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
    background: 'var(--overlay-bg)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    transition: 'opacity 0.25s',
  },
  sheet: {
    width: '100%',
    maxWidth: 440,
    background: 'var(--surface-base)',
    border: '1.5px solid var(--border-default)',
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
    background: 'var(--border-mid)',
    borderRadius: 2,
    margin: '0 auto 16px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  headerBtns: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    flexShrink: 0,
  },
  iconBtn: {
    background: 'transparent',
    border: '1px solid var(--border-default)',
    color: 'var(--text-muted)',
    width: 28,
    height: 28,
    borderRadius: 3,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cancelBtn: {
    background: 'transparent',
    border: '1px solid var(--border-default)',
    color: 'var(--text-muted)',
    padding: '4px 10px',
    borderRadius: 3,
    cursor: 'pointer',
    fontFamily: "var(--font-mono)",
    fontSize: 10,
  },
  saveBtn: {
    background: 'var(--gold)',
    border: 'none',
    color: 'var(--gold-pale)',
    padding: '4px 10px',
    borderRadius: 3,
    cursor: 'pointer',
    fontFamily: "var(--font-mono)",
    fontSize: 10,
  },
  frameTop: {
    flex: 1,
    height: 28,
    background: '#7a6a58',
    border: '1px solid #a09080',
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '0 6px',
    overflow: 'hidden',
    position: 'relative',
  },
  overlayPerf: {
    width: 10,
    height: 7,
    borderRadius: 1,
    background: '#c8bfaa',
    border: '1px solid #a09080',
    flexShrink: 0,
  },
  recapLabel: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 10,
    fontWeight: 500,
    color: 'var(--fade-green)',
    background: 'rgba(122,158,138,0.12)',
    border: '1px solid rgba(122,158,138,0.4)',
    padding: '1px 7px',
    borderRadius: 2,
    flexShrink: 0,
  },
  overlayNum: {
    position: 'absolute',
    right: 8,
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    color: '#e8c87a',
    display: 'flex',
    alignItems: 'baseline',
    gap: 3,
    background: 'rgba(122,106,88,0.9)',
    padding: '0 4px',
    borderRadius: 2,
  },
  overlayNumLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: '#c8a96e',
    letterSpacing: '0.06em',
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 22,
    fontWeight: 600,
    color: 'var(--text-primary)',
    lineHeight: 1.3,
    marginBottom: 4,
  },
  titleInput: {
    width: '100%',
    background: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 12px',
    color: 'var(--text-primary)',
    fontFamily: "var(--font-display)",
    fontSize: 18,
    marginBottom: 4,
    outline: 'none',
    boxSizing: 'border-box',
  },
  date: {
    fontFamily: "var(--font-body)",
    fontSize: 9,
    color: 'var(--text-muted)',
    marginBottom: 10,
  },
  content: {
    fontFamily: "var(--font-display)",
    fontStyle: 'italic',
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 2,
    fontWeight: 400,
    whiteSpace: 'pre-wrap',
    borderTop: '1px solid var(--border-default)',
    paddingTop: 12,
  },
  contentInput: {
    width: '100%',
    minHeight: 200,
    background: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px',
    color: 'var(--text-secondary)',
    fontFamily: "var(--font-display)",
    fontSize: 13,
    lineHeight: 2,
    fontWeight: 400,
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    borderTop: '1px solid var(--border-default)',
    paddingTop: 16,
  },
  photoSection: {
    marginTop: 20,
    borderTop: '1px solid var(--border-default)',
    paddingTop: 16,
  },
  photoLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: 'var(--text-muted)',
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
    border: '1px solid var(--border-default)',
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
    color: 'var(--text-inverse)',
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
    border: '1px dashed var(--border-mid)',
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "var(--font-mono)",
  },
  photoStrip: {
    display: 'flex',
    gap: 8,
    marginTop: 16,
    overflowX: 'auto',
    borderTop: '1px solid var(--border-default)',
    paddingTop: 12,
  },
  stripImg: {
    width: 72,
    height: 56,
    objectFit: 'cover',
    borderRadius: 3,
    border: '1px solid var(--border-default)',
    flexShrink: 0,
  },
  moodSection: {
    marginTop: 20,
    borderTop: '1px solid var(--border-default)',
    paddingTop: 16,
  },
  moodLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: 'var(--text-muted)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  archiveRow: {
    marginTop: 24,
    paddingTop: 12,
    borderTop: '1px solid var(--border-default)',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  archiveBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: 'var(--text-muted)',
    opacity: 0.55,
    letterSpacing: '0.08em',
    padding: '4px 0',
  },
}
