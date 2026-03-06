import type { Frame } from '../../types/frame'
import { formatChatDate } from '../../utils/dateFormat'
import { getMoodToneStyle, MOOD_OPTIONS } from '../../utils/moodTone'

interface Props {
  frame: Frame
  onClick: () => void
  skeleton?: boolean
}

const PERF_COUNT = 3
const THUMB_VISIBLE = 3
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

function Perfs({ right = false }: { right?: boolean }) {
  return (
    <div style={{ ...styles.perfs, ...(right ? styles.perfsRight : {}) }}>
      {Array.from({ length: PERF_COUNT }, (_, i) => (
        <div key={i} style={styles.perf} />
      ))}
    </div>
  )
}

export default function FilmFrame({ frame, onClick, skeleton = false }: Props) {
  if (skeleton) {
    return (
      <div style={{ ...styles.frame, cursor: 'default', opacity: 0.4 }}>
        <div style={styles.outer}>
          <Perfs />
          <div style={{ ...styles.body, minHeight: 90 }} />
          <Perfs right />
        </div>
      </div>
    )
  }

  const photos = frame.photos ?? []
  const visiblePhotos = photos.slice(0, THUMB_VISIBLE)
  const extraCount = photos.length - THUMB_VISIBLE

  return (
    <div style={{ ...styles.frame, ...getMoodToneStyle(frame.mood) }} onClick={onClick}>
      <div style={styles.outer}>
        <Perfs />
        <div style={styles.body}>
          <div style={styles.tintOverlay} />
          <div style={{
            ...styles.grainOverlay,
            opacity: 'var(--film-grain-opacity)' as unknown as number,
          }} />
          <div style={styles.bodyContent}>
            <div style={styles.metaRow}>
              <span style={styles.dateLabel}>
                {formatChatDate(new Date(frame.date))}
                <span style={styles.frameNumInline}> · #{String(frame.frameNum).padStart(2, '0')}</span>
              </span>
              {frame.isBookmarked && <span style={styles.bookmarkIcon}>★</span>}
            </div>
            <div style={styles.title}>{frame.title}</div>
            <div style={styles.preview}>{frame.content}</div>

            {photos.length > 0 && (
              <div style={styles.photoStrip}>
                {visiblePhotos.map((photo) => (
                  <img
                    key={photo.id}
                    src={`${API_BASE}${photo.url}`}
                    alt="photo"
                    style={styles.stripThumb}
                  />
                ))}
                {extraCount > 0 && (
                  <div style={styles.extraBadge}>+{extraCount}</div>
                )}
              </div>
            )}

            <div style={styles.footer}>
              <div style={styles.mood}>
                {frame.mood
                  ? `${MOOD_OPTIONS.find((o) => o.value === frame.mood)?.emoji ?? ''} ${frame.mood}`
                  : ''}
              </div>
              {frame.frameType === 'QUICK' ? (
                <span style={{ ...styles.status, ...styles.statusQuick }}>✦ 노트</span>
              ) : (
                <span style={{ ...styles.status, ...styles.statusDone }}>◈ 현상</span>
              )}
            </div>
          </div>
        </div>
        <Perfs right />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  frame: {
    position: 'relative',
    marginBottom: 14,
    cursor: 'pointer',
    transition: 'transform 0.15s',
  },
  outer: {
    background: '#0f0c08',
    border: '1.5px solid var(--border)',
    borderRadius: 3,
    display: 'flex',
    overflow: 'hidden',
  },
  perfs: {
    width: 18,
    flexShrink: 0,
    background: '#0a0806',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '8px 0',
    borderRight: '1px solid var(--border)',
  },
  perfsRight: {
    borderRight: 'none',
    borderLeft: '1px solid var(--border)',
  },
  perf: {
    width: 9,
    height: 6,
    borderRadius: 1,
    background: 'var(--bg)',
    border: '1px solid #2e2518',
  },
  body: {
    flex: 1,
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #1e1a0f, #161209)',
    position: 'relative',
    overflow: 'hidden',
  },
  tintOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'var(--film-tint)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  grainOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E")`,
    backgroundSize: '200px 200px',
    mixBlendMode: 'overlay',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bodyContent: {
    position: 'relative',
    zIndex: 1,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dateLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--amber-light)',
    opacity: 0.65,
    letterSpacing: '0.06em',
  },
  frameNumInline: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--cream-muted)',
    opacity: 0.5,
    letterSpacing: '0.04em',
  },
  bookmarkIcon: {
    fontSize: 10,
    color: 'var(--amber)',
    opacity: 0.8,
    lineHeight: 1,
    flexShrink: 0,
  },
  title: {
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 15,
    color: 'var(--cream)',
    fontWeight: 400,
    lineHeight: 1.4,
    marginBottom: 6,
  },
  preview: {
    fontSize: 12,
    color: 'var(--cream-muted)',
    lineHeight: 1.7,
    fontWeight: 300,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  photoStrip: {
    display: 'flex',
    gap: 4,
    marginTop: 8,
    marginBottom: 2,
    alignItems: 'center',
  },
  stripThumb: {
    width: 44,
    height: 34,
    objectFit: 'cover',
    borderRadius: 2,
    border: '1px solid var(--border)',
    flexShrink: 0,
  },
  extraBadge: {
    width: 44,
    height: 34,
    borderRadius: 2,
    border: '1px solid var(--border)',
    background: 'rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--cream-muted)',
    flexShrink: 0,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  mood: {
    fontSize: 12,
    color: 'var(--cream-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  status: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.06em',
    padding: '2px 7px',
    borderRadius: 2,
  },
  statusDone: {
    color: 'var(--fade-green)',
    border: '1px solid rgba(122,158,138,0.3)',
  },
  statusQuick: {
    color: 'var(--amber-light)',
    border: '1px solid var(--amber-30)',
  },
}
