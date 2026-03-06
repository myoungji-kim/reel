import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import type { DevelopPreview } from '../../types/frame'
import MoodChipSelector from '../MoodChipSelector'
import { getMoodTintColor } from '../../utils/moodTone'
import OverlaySheet from './OverlaySheet'

type DateMode = 'yesterday' | 'today' | 'custom'

function getLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Props {
  isOpen: boolean
  preview: DevelopPreview | null
  onSave: (frameId: number, title: string, content: string, mood: string, photos: File[], date: string) => void
  onCancel: () => void
}

const PERF_COUNT = 14
const MAX_PHOTOS = 5

export default function PreviewOverlay({ isOpen, preview, onSave, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [dateMode, setDateMode] = useState<DateMode>('today')
  const [customDate, setCustomDate] = useState<string>('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const datePickerRef = useRef<HTMLDivElement>(null)

  const todayStr = useMemo(() => getLocalDateStr(new Date()), [])
  const yesterdayStr = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return getLocalDateStr(d)
  }, [])

  // 오늘/어제 제외한 최근 12일
  const pastDays = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (i + 2))
      return getLocalDateStr(d)
    })
  }, [])

  const handlePickerClose = useCallback((e: MouseEvent) => {
    if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
      setShowDatePicker(false)
    }
  }, [])

  useEffect(() => {
    if (showDatePicker) {
      document.addEventListener('mousedown', handlePickerClose)
    }
    return () => document.removeEventListener('mousedown', handlePickerClose)
  }, [showDatePicker, handlePickerClose])

  const selectedDate = dateMode === 'yesterday' ? yesterdayStr
    : dateMode === 'custom' && customDate ? customDate
    : todayStr

  useEffect(() => {
    if (preview) {
      setTitle(preview.title)
      setContent(preview.content)
      setMood(null)
      setDateMode('today')
      setCustomDate('')
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
    if (!preview || !mood) return
    onSave(preview.frameId, title, content, mood, photos, selectedDate)
  }

  return (
    <OverlaySheet
      isOpen={isOpen}
      zIndex={400}
      sheetStyle={{
        background: `linear-gradient(${getMoodTintColor(mood)}, ${getMoodTintColor(mood)}), var(--bg-mid)`,
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.3s',
      }}
    >
      <div>
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
          {/* 날짜 선택 */}
          <div style={styles.fieldTag}>날짜</div>
          <div style={styles.dateChips}>
            {(['yesterday', 'today'] as DateMode[]).map((mode) => {
              const dateStr = mode === 'yesterday' ? yesterdayStr : todayStr
              const label = mode === 'yesterday' ? '어제' : '오늘'
              const mmdd = dateStr.slice(5).replace('-', '/')
              return (
                <button
                  key={mode}
                  style={{
                    ...styles.dateChip,
                    ...(dateMode === mode ? styles.dateChipActive : {}),
                  }}
                  onClick={() => setDateMode(mode)}
                >
                  {label} <span style={styles.dateChipSub}>{mmdd}</span>
                </button>
              )
            })}
            <div ref={datePickerRef} style={{ position: 'relative' }}>
              <button
                style={{
                  ...styles.dateChip,
                  ...(dateMode === 'custom' ? styles.dateChipActive : {}),
                }}
                onClick={() => setShowDatePicker((v) => !v)}
              >
                {dateMode === 'custom' && customDate
                  ? customDate.slice(5).replace('-', '/')
                  : '날짜 선택'}
              </button>
              {showDatePicker && (
                <div style={styles.dateDrop}>
                  {pastDays.map((d) => {
                    const mmdd = d.slice(5).replace('-', '/')
                    const dow = ['일','월','화','수','목','금','토'][new Date(d).getDay()]
                    return (
                      <button
                        key={d}
                        style={{
                          ...styles.dateDropItem,
                          ...(customDate === d ? styles.dateDropItemActive : {}),
                        }}
                        onClick={() => {
                          setCustomDate(d)
                          setDateMode('custom')
                          setShowDatePicker(false)
                        }}
                      >
                        {mmdd} <span style={styles.dateDropDow}>{dow}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

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
                <button style={styles.removeBtn} onClick={() => removePhoto(i)} aria-label="사진 제거">
                  <X size={8} />
                </button>
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

          <div style={{ ...styles.fieldTag, marginTop: 20 }}>오늘 기분</div>
          <MoodChipSelector value={mood} onChange={setMood} />
          {!mood && (
            <div style={styles.moodHint}>기분을 선택해야 현상할 수 있어요</div>
          )}
        </div>

        {/* 푸터 */}
        <div style={styles.footer}>
          <button style={styles.btnCancel} onClick={onCancel}>
            ✕ 취소
          </button>
          <button
            style={{ ...styles.btnSave, ...(!mood ? styles.btnSaveDisabled : {}) }}
            onClick={handleSave}
            disabled={!mood}
          >
            ◆ 이대로 현상하기
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
  filmstrip: {
    height: 18,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    padding: '0 6px',
    gap: 4,
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
    fontSize: 10,
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
    fontSize: 10,
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
    boxShadow: '0 3px 12px var(--amber-35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'opacity 0.2s',
  },
  btnSaveDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  moodHint: {
    marginTop: 8,
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--amber)',
    letterSpacing: '0.06em',
    opacity: 0.7,
  },
  dateChips: {
    display: 'flex',
    gap: 6,
    marginBottom: 20,
  },
  dateChip: {
    padding: '5px 12px',
    background: 'transparent',
    border: '1px solid var(--border-light)',
    borderRadius: 20,
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--cream-muted)',
    letterSpacing: '0.06em',
    transition: 'all 0.15s',
    opacity: 0.7,
  },
  dateChipActive: {
    border: '1px solid var(--amber)',
    color: 'var(--amber)',
    opacity: 1,
    background: 'rgba(200, 150, 50, 0.08)',
  },
  dateChipSub: {
    opacity: 0.6,
    marginLeft: 3,
  },
  dateDrop: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    background: 'var(--bg-mid)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    zIndex: 10,
    minWidth: 110,
    maxHeight: 220,
    overflowY: 'auto' as const,
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
  },
  dateDropItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    padding: '9px 14px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    color: 'var(--cream-muted)',
    letterSpacing: '0.05em',
    textAlign: 'left' as const,
  },
  dateDropItemActive: {
    color: 'var(--amber)',
    background: 'rgba(200,150,50,0.08)',
  },
  dateDropDow: {
    opacity: 0.5,
    fontSize: 10,
  },
}
