import type { Frame } from '../../types/frame'
import { formatChatDate } from '../../utils/dateFormat'

interface Props {
  frame: Frame
  onClick: () => void
  skeleton?: boolean
}

const PERF_COUNT = 3

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

  return (
    <div style={styles.frame} onClick={onClick}>
      <div style={styles.outer}>
        <Perfs />
        <div style={styles.body}>
          <div style={styles.frameNum}>♦{String(frame.frameNum).padStart(2, '0')}</div>
          <div style={styles.dateLabel}>{formatChatDate(new Date(frame.date))}</div>
          <div style={styles.title}>{frame.title}</div>
          <div style={styles.preview}>{frame.content}</div>
          <div style={styles.footer}>
            <div style={styles.mood}>{frame.mood ?? ''}</div>
            <span style={{ ...styles.status, ...styles.statusDone }}>◆ DEVELOPED</span>
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
  },
  frameNum: {
    position: 'absolute',
    top: 10,
    right: 12,
    fontFamily: "'VT323', monospace",
    fontSize: 18,
    color: 'var(--amber)',
    opacity: 0.35,
  },
  dateLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--amber-light)',
    opacity: 0.65,
    letterSpacing: '0.06em',
    marginBottom: 6,
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
    gap: 5,
  },
  status: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    letterSpacing: '0.06em',
    padding: '2px 7px',
    borderRadius: 2,
  },
  statusDone: {
    color: 'var(--fade-green)',
    border: '1px solid rgba(122,158,138,0.3)',
  },
}
