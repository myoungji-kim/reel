import { useState } from 'react'
import { useFrameStore } from '../stores/frameStore'
import { useUIStore } from '../stores/uiStore'
import FilmFrame from '../components/frame/FilmFrame'
import FrameOverlay from '../components/frame/FrameOverlay'
import MonthDivider from '../components/frame/MonthDivider'
import type { Frame } from '../types/frame'

// YYYY-MM → "MARCH 2026"
function toMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  return new Date(year, month - 1, 1)
    .toLocaleString('en-US', { month: 'long' })
    .toUpperCase() + ' ' + year
}

function groupByMonth(frames: Frame[]): Map<string, Frame[]> {
  const map = new Map<string, Frame[]>()
  for (const frame of frames) {
    const key = frame.date.slice(0, 7)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(frame)
  }
  return map
}

export default function FavoritesPage() {
  const { frames } = useFrameStore()
  const { isFrameDetailOpen, setFrameDetailOpen } = useUIStore()
  const [selectedFrameId, setSelectedFrameId] = useState<number | null>(null)

  const bookmarked = frames
    .filter((f) => f.isBookmarked)
    .sort((a, b) => b.date.localeCompare(a.date))

  const selectedFrame = frames.find((f) => f.id === selectedFrameId) ?? null

  const handleFrameClick = (frame: Frame) => {
    setSelectedFrameId(frame.id)
    setFrameDetailOpen(true)
  }

  const useGrouped = bookmarked.length >= 10
  const grouped = useGrouped ? groupByMonth(bookmarked) : null

  return (
    <div style={styles.view}>
      {/* 헤더 */}
      <div style={styles.header}>
        <span style={styles.title}>즐겨찾기</span>
        {bookmarked.length > 0 && (
          <span style={styles.count}>{bookmarked.length} frames</span>
        )}
      </div>

      {/* 목록 */}
      <div style={styles.list}>
        {bookmarked.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>◈</div>
            <p style={styles.emptyTitle}>아직 즐겨찾기한 프레임이 없어요</p>
            <p style={styles.emptyDesc}>
              현상된 일기에서 북마크 아이콘을 탭하면<br />
              여기에 모아볼 수 있어요.
            </p>
          </div>
        ) : useGrouped && grouped ? (
          Array.from(grouped.entries()).map(([yearMonth, monthFrames]) => {
            const [y, m] = yearMonth.split('-').map(Number)
            return (
              <div key={yearMonth}>
                <MonthDivider label={toMonthLabel(yearMonth)} count={monthFrames.length} year={y} month={m} />
                {monthFrames.map((frame) => (
                  <FilmFrame key={frame.id} frame={frame} onClick={() => handleFrameClick(frame)} />
                ))}
              </div>
            )
          })
        ) : (
          bookmarked.map((frame) => (
            <FilmFrame key={frame.id} frame={frame} onClick={() => handleFrameClick(frame)} />
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
  },
  header: {
    flexShrink: 0,
    padding: '14px 20px 10px',
    borderBottom: '1px solid var(--border-default)',
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 20,
    fontWeight: 600,
    fontStyle: 'italic',
    color: 'var(--text-primary)',
  },
  count: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
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
    paddingTop: 80,
    gap: 0,
  },
  emptyIcon: {
    fontSize: 24,
    color: 'var(--text-placeholder)',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: "var(--font-body)",
    fontSize: 13,
    color: 'var(--text-muted)',
    fontWeight: 300,
    marginBottom: 8,
  },
  emptyDesc: {
    fontFamily: "var(--font-body)",
    fontSize: 11,
    color: 'var(--text-placeholder)',
    fontWeight: 300,
    lineHeight: 1.7,
    textAlign: 'center',
  },
}
