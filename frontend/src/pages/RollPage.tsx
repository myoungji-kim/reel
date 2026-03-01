import { useEffect, useState } from 'react'
import { getFrames } from '../api/frameApi'
import { useFrameStore } from '../stores/frameStore'
import { useUIStore } from '../stores/uiStore'
import { useToast } from '../hooks/useToast'
import FilmFrame from '../components/frame/FilmFrame'
import FrameOverlay from '../components/frame/FrameOverlay'
import MonthDivider from '../components/frame/MonthDivider'
import type { Frame } from '../types/frame'

// YYYY-MM → "MARCH 2026" 형태
function toMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  const d = new Date(year, month - 1, 1)
  return d.toLocaleString('en-US', { month: 'long' }).toUpperCase() + ' ' + year
}

// frames → { "2026-03": [Frame, ...], ... }
function groupByMonth(frames: Frame[]): Map<string, Frame[]> {
  const map = new Map<string, Frame[]>()
  for (const frame of frames) {
    const key = frame.date.slice(0, 7)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(frame)
  }
  return map
}

export default function RollPage() {
  const { frames, setFrames } = useFrameStore()
  const { isFrameDetailOpen, setFrameDetailOpen } = useUIStore()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null)

  useEffect(() => {
    getFrames(0, 20)
      .then(({ data }) => setFrames(data.data.content))
      .catch(() => showToast('목록을 불러오지 못했어요.'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFrameClick = (frame: Frame) => {
    setSelectedFrame(frame)
    setFrameDetailOpen(true)
  }

  const grouped = groupByMonth(frames)

  return (
    <div style={styles.view}>
      <div style={styles.list}>
        {loading ? (
          // 스켈레톤 3개
          [0, 1, 2].map((i) => (
            <FilmFrame key={i} frame={{} as Frame} onClick={() => {}} skeleton />
          ))
        ) : frames.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>// FILM ROLL EMPTY</p>
            <p style={styles.emptySub}>현상된 일기가 여기에 쌓여요</p>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([yearMonth, monthFrames]) => (
            <div key={yearMonth}>
              <MonthDivider
                label={toMonthLabel(yearMonth)}
                count={monthFrames.length}
              />
              {monthFrames.map((frame) => (
                <FilmFrame
                  key={frame.id}
                  frame={frame}
                  onClick={() => handleFrameClick(frame)}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <FrameOverlay
        isOpen={isFrameDetailOpen}
        frame={selectedFrame}
        onClose={() => setFrameDetailOpen(false)}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  view: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px 80px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 80,
  },
  emptyText: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 13,
    color: 'var(--amber)',
    letterSpacing: '0.1em',
  },
  emptySub: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 13,
    color: 'var(--cream-muted)',
    fontWeight: 300,
  },
}
