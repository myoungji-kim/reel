import { Bookmark } from 'lucide-react'
import type { Frame } from '../../types/frame'
import { formatChatDate } from '../../utils/dateFormat'
import { getMoodBarColor, MOOD_OPTIONS } from '../../utils/moodTone'
import FilmPhoto from '../common/FilmPhoto'

interface Props {
  frame: Frame
  onClick: () => void
  skeleton?: boolean
}

const PERF_COUNT = 3
const THUMB_VISIBLE = 3

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
      <div style={{ ...styles.frame, cursor: 'default' }}>
        <div style={styles.outer}>
          <div style={{ ...styles.emotionBar, background: 'var(--border-default)' }} />
          <Perfs />
          <div
            style={{
              ...styles.body,
              minHeight: 90,
              background: 'linear-gradient(90deg, var(--surface-muted) 0%, var(--surface-muted) 35%, rgba(200,169,110,0.18) 50%, var(--surface-muted) 65%, var(--surface-muted) 100%)',
              backgroundSize: '250% 100%',
              animation: 'shimmer 2s ease-in-out infinite',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '14px 16px',
            }}
          >
            {/* 메타 줄 플레이스홀더 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 72, height: 8, borderRadius: 2,
                background: 'rgba(200,169,110,0.25)',
              }} />
              <div style={{
                width: '55%', height: 11, borderRadius: 2,
                background: 'rgba(26,24,20,0.12)',
              }} />
              <div style={{
                width: '80%', height: 8, borderRadius: 2,
                background: 'rgba(26,24,20,0.07)',
              }} />
              <div style={{
                width: '65%', height: 8, borderRadius: 2,
                background: 'rgba(26,24,20,0.07)',
                marginBottom: 10,
              }} />
            </div>
            {/* DEVELOPING 레이블 */}
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              color: 'var(--accent-gold)',
              letterSpacing: '0.14em',
              opacity: 0.4,
              animation: 'devBlink 1.6s ease-in-out infinite',
              position: 'relative',
              zIndex: 1,
            }}>
              // DEVELOPING...
            </div>
          </div>
          <Perfs right />
        </div>
      </div>
    )
  }

  const photos = frame.photos ?? []
  const visiblePhotos = photos.slice(0, THUMB_VISIBLE)
  const extraCount = photos.length - THUMB_VISIBLE

  const isRetro = frame.frameType === 'RETROSPECTIVE'

  return (
    <div
      style={styles.frame}
      onClick={onClick}
      onMouseDown={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.985)' }}
      onMouseUp={(e) => { (e.currentTarget as HTMLDivElement).style.transform = '' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = '' }}
      onTouchStart={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.985)' }}
      onTouchEnd={(e) => { (e.currentTarget as HTMLDivElement).style.transform = '' }}
    >
      <div style={{ ...styles.outer, ...(isRetro ? styles.outerRetro : {}), ...(frame.isBookmarked ? styles.outerBookmarked : {}) }}>
        {/* 감정 컬러바 */}
        <div style={{ ...styles.emotionBar, background: getMoodBarColor(frame.mood) }} />
        <Perfs />
        <div style={styles.body}>
          <div style={styles.metaRow}>
            <span style={styles.dateLabel}>{formatChatDate(new Date(frame.date))}</span>
            <div style={styles.metaRight}>
              {isRetro && <span style={styles.retroBadgeTop}>월간 회고</span>}
              {frame.isBookmarked && (
                <Bookmark
                  size={10}
                  style={{ color: 'var(--accent-gold)', opacity: 0.9, flexShrink: 0 }}
                  fill="currentColor"
                />
              )}
              <span style={styles.frameNumInline}>#{String(frame.frameNum).padStart(2, '0')}</span>
            </div>
          </div>
          <div style={{ ...styles.title, ...(isRetro ? styles.titleRetro : {}) }}>{frame.title}</div>
          <div style={styles.preview}>{frame.content}</div>

          {photos.length > 0 && (
            <div style={styles.photoStrip}>
              {visiblePhotos.map((photo) => (
                <FilmPhoto
                  key={photo.id}
                  src={photo.url}
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
            {isRetro ? null : frame.frameType === 'QUICK' ? (
              <span style={{ ...styles.status, ...styles.statusQuick }}>✦ 노트</span>
            ) : (
              <span style={{ ...styles.status, ...styles.statusDone }}>◈ 현상</span>
            )}
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
    background: 'var(--surface-muted)',
    border: '1px solid var(--border-default)',
    borderRadius: 10,
    display: 'flex',
    overflow: 'hidden',
  },
  emotionBar: {
    width: 3,
    flexShrink: 0,
  },
  perfs: {
    width: 18,
    flexShrink: 0,
    background: 'var(--surface-muted)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: '8px 0',
  },
  perfsRight: {},
  perf: {
    width: 9,
    height: 7,
    borderRadius: 2,
    background: 'var(--surface-base)',
    border: '1px solid #ddd8d0',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    padding: '12px 12px 10px 8px',
    background: 'var(--surface-muted)',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dateLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 8.5,
    color: 'var(--accent-gold)',
    letterSpacing: '0.08em',
  },
  frameNumInline: {
    fontFamily: "var(--font-mono)",
    fontSize: 8.5,
    color: 'var(--text-placeholder)',
    letterSpacing: '0.06em',
  },
  metaRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  retroBadgeTop: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 10,
    fontWeight: 500,
    color: '#7a9e8a',
    background: 'rgba(122,158,138,0.12)',
    border: '1px solid rgba(122,158,138,0.35)',
    borderRadius: 2,
    padding: '1px 6px',
    letterSpacing: '0.04em',
  },
  outerBookmarked: {
    borderLeft: '3px solid rgba(196, 160, 80, 0.55)',
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 19,
    color: 'var(--text-primary)',
    fontWeight: 600,
    lineHeight: 1.2,
    marginBottom: 6,
    letterSpacing: '-0.01em',
  },
  preview: {
    fontFamily: "var(--font-body)",
    fontSize: 10,
    color: 'var(--text-muted)',
    lineHeight: 1.75,
    fontWeight: 300,
    marginBottom: 10,
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
    border: '1px solid var(--border-default)',
    background: 'var(--surface-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "var(--font-mono)",
    fontSize: 'var(--text-xs)' as unknown as number,
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  mood: {
    fontSize: 'var(--text-sm)' as unknown as number,
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  status: {
    fontFamily: "'DM Mono', 'Noto Sans KR', monospace",
    fontSize: 8.5,
    letterSpacing: '0.08em',
    padding: '6px 12px',
    borderRadius: 6,
    minHeight: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    cursor: 'default',
  },
  statusDone: {
    color: 'var(--accent-gold)',
    border: '1px solid #d8cdb0',
    background: 'transparent',
  },
  statusQuick: {
    color: 'var(--accent-gold)',
    border: '1px solid #d8cdb0',
    background: 'transparent',
  },
  statusRetro: {
    color: 'var(--fade-green)',
    border: '1px solid var(--fade-green)',
    background: 'rgba(122,158,138,0.1)',
  },
  outerRetro: {
    border: '1.5px solid rgba(74, 112, 64, 0.6)',
  },
  titleRetro: {
    fontFamily: "'Noto Serif KR', serif",
  },
}
