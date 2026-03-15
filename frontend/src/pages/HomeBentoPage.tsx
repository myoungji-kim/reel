import type React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getHomeSummary } from '../api/homeApi'
import type { HomeSummaryResponse } from '../api/homeApi'
import { getMoodBarColor } from '../utils/moodTone'
import { formatChatDate } from '../utils/dateFormat'

interface Props {
  onFrameClick: (id: number) => void
  onPlusClick: () => void
  onChatClick: () => void
}

export default function HomeBentoPage({ onFrameClick, onPlusClick }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['home-summary'],
    queryFn: getHomeSummary,
    staleTime: 1000 * 60,
  })

  return (
    <div style={styles.page}>
      <HomeHeader onPlusClick={onPlusClick} />
      <div style={styles.scroll}>
        {isLoading ? (
          <BentoSkeleton />
        ) : data ? (
          <BentoContent data={data} onFrameClick={onFrameClick} />
        ) : null}
      </div>
    </div>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

function HomeHeader({ onPlusClick }: { onPlusClick: () => void }) {
  return (
    <div style={styles.header}>
      <span style={styles.headerLogo}>reel</span>
      <button style={styles.plusBtn} onClick={onPlusClick} aria-label="빠른 현상">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M2 8h12" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

// ─── Bento Content ───────────────────────────────────────────────────────────

function BentoContent({
  data,
  onFrameClick,
}: {
  data: HomeSummaryResponse
  onFrameClick: (id: number) => void
}) {
  const { today, streak, monthStats, recentFrames } = data

  return (
    <>
      <div style={styles.grid}>
        <StreakCell count={streak.count} recentDays={streak.recentDays} />
        <TodayCell today={today} />
        <MonthCell monthStats={monthStats} />
        <MoodFlowCell recentDays={streak.recentDays} />
      </div>

      {recentFrames.length > 0 && (
        <>
          <div style={styles.divider} />
          <div style={styles.sectionLabel}>최근 기록</div>
          <PrevRecordList frames={recentFrames} onFrameClick={onFrameClick} />
        </>
      )}
    </>
  )
}

// ─── StreakCell ───────────────────────────────────────────────────────────────

function StreakCell({
  count,
  recentDays,
}: {
  count: number
  recentDays: HomeSummaryResponse['streak']['recentDays']
}) {
  return (
    <div style={styles.streakCell}>
      <div style={styles.streakTop}>
        <span style={styles.streakCount}>{count}</span>
        <span style={styles.streakUnit}>일</span>
      </div>
      <div style={styles.streakLabel}>STREAK</div>
      <div style={styles.dotsRow}>
        {recentDays.map((day, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              flexShrink: 0,
              background: day.mood
                ? getMoodBarColor(day.mood)
                : 'rgba(240,238,233,0.2)',
              border: day.mood ? 'none' : '1px solid rgba(240,238,233,0.3)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── TodayCell ────────────────────────────────────────────────────────────────

function TodayCell({ today }: { today: HomeSummaryResponse['today'] }) {
  const date = new Date(today.date)
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const day = date.getDate()

  return (
    <div style={styles.todayCell}>
      <div style={styles.todayDateRow}>
        <span style={styles.todayMonth}>{month}</span>
        <span style={styles.todayDay}>{day}</span>
      </div>
      <div style={styles.todayDow}>{today.dayOfWeek}</div>
      {today.mood ? (
        <div
          style={{
            ...styles.todayMoodBadge,
            background: getMoodBarColor(today.mood) + '33',
            color: getMoodBarColor(today.mood),
          }}
        >
          {today.mood}
        </div>
      ) : (
        <div style={styles.todayNoRecord}>—</div>
      )}
    </div>
  )
}

// ─── MonthCell ────────────────────────────────────────────────────────────────

function MonthCell({ monthStats }: { monthStats: HomeSummaryResponse['monthStats'] }) {
  const monthName = new Date(monthStats.year, monthStats.month - 1, 1)
    .toLocaleString('en-US', { month: 'short' })
    .toUpperCase()

  return (
    <div style={styles.monthCell}>
      <div style={styles.monthTop}>
        <span style={styles.monthCount}>{monthStats.frameCount}</span>
        <span style={styles.monthUnit}>frames</span>
      </div>
      <div style={styles.monthLabel}>{monthName} {monthStats.year}</div>
    </div>
  )
}

// ─── MoodFlowCell ─────────────────────────────────────────────────────────────

function MoodFlowCell({
  recentDays,
}: {
  recentDays: HomeSummaryResponse['streak']['recentDays']
}) {
  return (
    <div style={styles.moodFlowCell}>
      <div style={styles.moodFlowLabel}>MOOD FLOW</div>
      <div style={styles.barsRow}>
        {recentDays.map((day, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: day.mood ? 16 : 6,
              borderRadius: '3px 3px 0 0',
              background: day.mood ? getMoodBarColor(day.mood) : 'var(--border-default)',
              flexShrink: 0,
              alignSelf: 'flex-end',
              transition: 'height 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── PrevRecordList ───────────────────────────────────────────────────────────

function PrevRecordList({
  frames,
  onFrameClick,
}: {
  frames: HomeSummaryResponse['recentFrames']
  onFrameClick: (id: number) => void
}) {
  return (
    <div style={styles.recordList}>
      {frames.map((frame) => (
        <PrevRecordCard
          key={frame.id}
          frame={frame}
          onClick={() => onFrameClick(frame.id)}
        />
      ))}
    </div>
  )
}

function PrevRecordCard({
  frame,
  onClick,
}: {
  frame: HomeSummaryResponse['recentFrames'][number]
  onClick: () => void
}) {
  return (
    <div style={styles.card} onClick={onClick}>
      <div>
        <div style={styles.cardTitle}>{frame.title}</div>
        <div style={styles.cardMeta}>
          <span style={styles.cardDate}>{formatChatDate(new Date(frame.date))}</span>
          <span style={styles.cardNum}>#{String(frame.frameNum).padStart(2, '0')}</span>
        </div>
      </div>
      <span style={styles.cardArrow}>›</span>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BentoSkeleton() {
  return (
    <div style={styles.grid}>
      <div style={{ ...styles.streakCell, ...styles.skeleton }} />
      <div style={{ ...styles.todayCell, ...styles.skeleton }} />
      <div style={{ ...styles.monthCell, ...styles.skeleton }} />
      <div style={{ ...styles.moodFlowCell, ...styles.skeleton }} />
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px 10px',
    borderBottom: '1px solid var(--border-default)',
  },
  headerLogo: {
    fontFamily: "var(--font-display)",
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  plusBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    WebkitTapHighlightColor: 'transparent',
  },
  scroll: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: 80,
  },
  // CSS Grid bento
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    padding: '16px 16px 0',
  },
  // StreakCell: tall (spans 2 rows)
  streakCell: {
    gridRow: 'span 2',
    background: '#2a2620',
    borderRadius: 16,
    padding: '18px 16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 170,
  },
  streakTop: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  streakCount: {
    fontFamily: "var(--font-mono)",
    fontSize: 40,
    fontWeight: 500,
    color: 'var(--gold)',
    lineHeight: 1,
  },
  streakUnit: {
    fontFamily: "var(--font-mono)",
    fontSize: 14,
    color: 'rgba(240,238,233,0.6)',
  },
  streakLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    letterSpacing: '0.1em',
    color: 'rgba(240,238,233,0.4)',
    marginTop: 4,
  },
  dotsRow: {
    display: 'flex',
    gap: 5,
    flexWrap: 'wrap',
    marginTop: 'auto',
    paddingTop: 12,
  },
  // TodayCell
  todayCell: {
    background: 'var(--gold-pale)',
    borderRadius: 16,
    padding: '14px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  todayDateRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  todayMonth: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
  },
  todayDay: {
    fontFamily: "var(--font-mono)",
    fontSize: 28,
    fontWeight: 500,
    color: 'var(--text-primary)',
    lineHeight: 1,
  },
  todayDow: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
    marginBottom: 6,
  },
  todayMoodBadge: {
    fontFamily: "var(--font-body)",
    fontSize: 10,
    fontWeight: 500,
    padding: '3px 8px',
    borderRadius: 20,
    display: 'inline-block',
    alignSelf: 'flex-start',
  },
  todayNoRecord: {
    fontFamily: "var(--font-mono)",
    fontSize: 18,
    color: 'var(--text-placeholder)',
  },
  // MonthCell
  monthCell: {
    background: 'var(--surface-muted)',
    borderRadius: 16,
    padding: '14px 14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    border: '1px solid var(--border-default)',
  },
  monthTop: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  monthCount: {
    fontFamily: "var(--font-mono)",
    fontSize: 28,
    fontWeight: 500,
    color: 'var(--text-primary)',
    lineHeight: 1,
  },
  monthUnit: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: 'var(--text-muted)',
  },
  monthLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    letterSpacing: '0.08em',
    color: 'var(--text-placeholder)',
    marginTop: 4,
  },
  // MoodFlowCell: wide (spans 2 columns)
  moodFlowCell: {
    gridColumn: 'span 2',
    background: 'var(--surface-muted)',
    borderRadius: 16,
    padding: '14px 16px 12px',
    border: '1px solid var(--border-default)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  moodFlowLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    letterSpacing: '0.1em',
    color: 'var(--text-placeholder)',
  },
  barsRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 6,
    height: 20,
  },
  // Divider
  divider: {
    height: 1,
    background: 'var(--border-default)',
    margin: '16px 16px 0',
  },
  sectionLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    letterSpacing: '0.1em',
    color: 'var(--text-placeholder)',
    padding: '10px 20px 4px',
  },
  recordList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    paddingTop: 4,
  },
  card: {
    margin: '0 16px 8px',
    background: 'var(--surface-muted)',
    borderRadius: 12,
    padding: '11px 14px',
    border: '1px solid var(--border-default)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  cardTitle: {
    fontFamily: "var(--font-body)",
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--text-primary)',
    marginBottom: 4,
  },
  cardMeta: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  cardDate: {
    fontFamily: "var(--font-mono)",
    fontSize: 8,
    color: 'var(--text-muted)',
  },
  cardNum: {
    fontFamily: "var(--font-mono)",
    fontSize: 8,
    color: 'var(--text-placeholder)',
  },
  cardArrow: {
    fontFamily: "var(--font-mono)",
    fontSize: 16,
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  // Skeleton
  skeleton: {
    background: 'var(--surface-muted)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
}
